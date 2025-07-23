// server/index.ts

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// --- CORREÇÃO PARA O ERRO "__dirname is not defined" ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

console.log(`API Key Loaded: ${process.env.GOOGLE_API_KEY ? "Yes" : "No"}`);

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import os from "os";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.FRONTEND_PORT
    ? parseInt(process.env.FRONTEND_PORT)
    : 80;
  const host = process.env.SERVER_HOST || "0.0.0.0";

  server.listen(
    {
      port,
      host,
    },
    () => {
      const domain = process.env.DOMAIN;
      const localAddress = `http://localhost:${port}`;
      const networkAddress = `http://${getLocalIP()}:${port}`;

      log("🚀 Servidor iniciado com sucesso!");
      if (domain) {
        log(`🌐 Domínio customizado: https://${domain}`);
      }
      log(`📍 Local: ${localAddress}`);
      log(`🌍 Rede: ${networkAddress}`);
    }
  );
})();

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const alias of iface) {
        if (
          alias.family === "IPv4" &&
          alias.address !== "127.0.0.1" &&
          !alias.internal
        ) {
          return alias.address;
        }
      }
    }
  }
  return "localhost";
}

// server/index.ts
import path3 from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// server/checkout.ts
import express from "express";
import axios from "axios";
var router = express.Router();
var APPMAX_ACCESS_TOKEN = process.env.APPMAX_ACCESS_TOKEN || "SUA_ACCESS_TOKEN_AQUI";
var APPMAX_API_URL = "https://homolog.sandboxappmax.com.br/api/v3";
router.post("/appmax/customer", async (req, res) => {
  try {
    const data = {
      ...req.body,
      "access-token": APPMAX_ACCESS_TOKEN
    };
    const response = await axios.post(`${APPMAX_API_URL}/customer`, data);
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});
router.post("/appmax/order", async (req, res) => {
  try {
    const data = {
      ...req.body,
      "access-token": APPMAX_ACCESS_TOKEN
    };
    const response = await axios.post(`${APPMAX_API_URL}/order`, data);
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});
router.post("/appmax/payment/credit-card", async (req, res) => {
  try {
    const data = {
      ...req.body,
      "access-token": APPMAX_ACCESS_TOKEN
    };
    const response = await axios.post(
      `${APPMAX_API_URL}/payment/credit-card`,
      data
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});
var checkout_default = router;

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/places", async (req, res) => {
    console.log(">>> ROTA /api/places FOI ACESSADA <<<");
    const query = req.query.query;
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!query || !apiKey) {
      return res.status(400).json({ error: "Missing query or API key" });
    }
    const formattedQuery = query.trim().replace(/\s+/g, "+");
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${formattedQuery}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Erro ao buscar dados do Google Places:", error);
      res.status(500).json({ error: "Erro ao buscar dados do Google Places" });
    }
  });
  app2.use("/api", checkout_default);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [react()],
  base: "/slenocard/",
  // Caminho do repositório para GitHub Pages
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import os from "os";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
dotenv.config({ path: path3.resolve(__dirname, "../.env.local") });
console.log(`API Key Loaded: ${process.env.GOOGLE_API_KEY ? "Yes" : "No"}`);
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : 80;
  const host = process.env.SERVER_HOST || "0.0.0.0";
  server.listen(
    {
      port,
      host
    },
    () => {
      const domain = process.env.DOMAIN;
      const localAddress = `http://localhost:${port}`;
      const networkAddress = `http://${getLocalIP()}:${port}`;
      log("\u{1F680} Servidor iniciado com sucesso!");
      if (domain) {
        log(`\u{1F310} Dom\xEDnio customizado: https://${domain}`);
      }
      log(`\u{1F4CD} Local: ${localAddress}`);
      log(`\u{1F30D} Rede: ${networkAddress}`);
    }
  );
})();
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const alias of iface) {
        if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return "localhost";
}

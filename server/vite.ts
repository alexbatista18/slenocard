import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

// CORREÇÃO: Definir __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // CORREÇÃO: Usar path absoluto seguro
      const clientTemplate = path.join(__dirname, "..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // CORREÇÃO CRÍTICA: Múltiplos caminhos para tentar
  const possiblePaths = [
    path.join(process.cwd(), "dist", "public"),
    path.join(__dirname, "..", "dist", "public"),
    path.join(process.cwd(), "public"),
    path.join(__dirname, "..", "public"),
    path.join(process.cwd(), "client", "dist"),
  ];

  console.log("Debugging production paths:", {
    cwd: process.cwd(),
    __dirname: __dirname,
    possiblePaths: possiblePaths,
  });

  let distPath: string | null = null;

  // Encontrar o primeiro caminho que existe
  for (const testPath of possiblePaths) {
    console.log(
      `Testing path: ${testPath} - exists: ${fs.existsSync(testPath)}`
    );
    if (fs.existsSync(testPath)) {
      distPath = testPath;
      console.log(`✅ Using path: ${distPath}`);
      break;
    }
  }

  if (!distPath) {
    console.error("❌ No valid dist path found! Available files/folders:");
    try {
      console.log("Root directory contents:", fs.readdirSync(process.cwd()));
      console.log("__dirname contents:", fs.readdirSync(__dirname));
    } catch (e) {
      console.log("Error listing directories:", e);
    }

    // FALLBACK EXTREMO: servir arquivos do diretório atual
    console.log("🚨 Using fallback: serving from current directory");
    app.use(express.static(process.cwd()));
    app.use("*", (_req, res) => {
      res.status(404).send("App not built properly. Check build process.");
    });
    return;
  }

  // Servir arquivos estáticos
  app.use(express.static(distPath));

  // SPA fallback
  app.use("*", (_req, res) => {
    const indexPath = path.join(distPath!, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("index.html not found");
    }
  });
}

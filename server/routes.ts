import type { Express } from "express";
import { createServer, type Server } from "http";
import checkoutRoutes from "./checkout";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/places", async (req, res) => {
    console.log(">>> ROTA /api/places FOI ACESSADA <<<");
    const query = req.query.query as string;
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

  // Rotas de checkout Appmax
  app.use("/api", checkoutRoutes);

  const httpServer = createServer(app);
  return httpServer;
}

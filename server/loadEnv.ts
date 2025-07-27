// server/loadEnv.ts
import dotenv from "dotenv";
import path from "path";

// Carrega as variáveis de ambiente do arquivo .env.local na raiz do projeto.
// Este arquivo é pré-carregado para garantir que as variáveis estejam disponíveis globalmente
// antes que qualquer outro código do aplicativo seja executado.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

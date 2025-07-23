// Importa o framework Express para criar rotas HTTP
import express from "express";
// Importa o axios para fazer requisições HTTP externas (API Appmax)
import axios from "axios";

// Cria um roteador do Express para agrupar as rotas relacionadas à Appmax
const router = express.Router();

// Token de acesso fornecido pela Appmax (coloque no seu .env para segurança)
const APPMAX_ACCESS_TOKEN =
  process.env.APPMAX_ACCESS_TOKEN || "SUA_ACCESS_TOKEN_AQUI";
// URL base da API da Appmax (sandbox para testes)
const APPMAX_API_URL = "https://homolog.sandboxappmax.com.br/api/v3";

/**
 * Endpoint para criar ou atualizar um cliente na Appmax.
 * Envie os dados do cliente no corpo da requisição (JSON).
 * Exemplo de uso no frontend:
 *   fetch('/api/appmax/customer', { method: 'POST', body: JSON.stringify({ ...dadosCliente }) })
 */
router.post("/appmax/customer", async (req, res) => {
  try {
    // Monta o payload com os dados do cliente e o token de acesso
    const data = {
      ...req.body,
      "access-token": APPMAX_ACCESS_TOKEN,
    };
    // Faz a requisição para a API da Appmax
    const response = await axios.post(`${APPMAX_API_URL}/customer`, data);
    // Retorna a resposta da Appmax para o frontend
    res.json(response.data);
  } catch (error: any) {
    // Em caso de erro, retorna o erro recebido da Appmax
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});

/**
 * Endpoint para criar um pedido (order) na Appmax.
 * Envie o customer_id e os dados do carrinho no corpo da requisição.
 * Exemplo de uso no frontend:
 *   fetch('/api/appmax/order', { method: 'POST', body: JSON.stringify({ ...dadosPedido }) })
 */
router.post("/appmax/order", async (req, res) => {
  try {
    const data = {
      ...req.body,
      "access-token": APPMAX_ACCESS_TOKEN,
    };
    const response = await axios.post(`${APPMAX_API_URL}/order`, data);
    res.json(response.data);
  } catch (error: any) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});

/**
 * Endpoint para processar pagamento via cartão de crédito na Appmax.
 * Envie o customer_id, order_id e dados do cartão no corpo da requisição.
 * Exemplo de uso no frontend:
 *   fetch('/api/appmax/payment/credit-card', { method: 'POST', body: JSON.stringify({ ...dadosPagamento }) })
 */
router.post("/appmax/payment/credit-card", async (req, res) => {
  try {
    const data = {
      ...req.body,
      "access-token": APPMAX_ACCESS_TOKEN,
    };
    const response = await axios.post(
      `${APPMAX_API_URL}/payment/credit-card`,
      data
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});

// Você pode criar endpoints semelhantes para boleto, pix, etc.
// Consulte a documentação Appmax para os endpoints e payloads específicos.

// Exporta o roteador para ser usado no arquivo de rotas principal do backend
export default router;

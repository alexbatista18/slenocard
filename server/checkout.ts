// Importa o framework Express para criar rotas HTTP
import express from "express";
// Importa o axios para fazer requisições HTTP externas (API Appmax)
import axios from "axios";
import { saveTransaction, TransactionRecord } from "./db";

// Cria um roteador do Express para agrupar as rotas relacionadas à Appmax
const router = express.Router();

// Token de acesso fornecido pela Appmax (coloque no seu .env para segurança)
const APPMAX_ACCESS_TOKEN = process.env.APPMAX_ACCESS_TOKEN;
// DEBUG: Mostra o valor do token ao iniciar o backend
console.log("[DEBUG] APPMAX_ACCESS_TOKEN carregado:", APPMAX_ACCESS_TOKEN);
// URL base da API da Appmax (sandbox para testes)
const APPMAX_API_URL = "https://admin.appmax.com.br/api/v3";

/**
 * Endpoint para criar ou atualizar um cliente na Appmax.
 * Envie os dados do cliente no corpo da requisição (JSON).
 * Exemplo de uso no frontend:
 *   fetch('/api/appmax/customer', { method: 'POST', body: JSON.stringify({ ...dadosCliente }) })
 */
router.post("/appmax/customer", async (req, res) => {
  try {
    // Monta o payload conforme a estrutura exigida pela Appmax

    const {
      nome,
      email,
      documento,
      telefone,
      phone,
      endereco_rua,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep,
      ip,
      custom_txt,
      produtos,
      tracking,
    } = req.body;

    // Separar nome em firstname e lastname
    let firstname = "";
    let lastname = "";
    if (nome) {
      const partes = nome.trim().split(" ");
      firstname = partes[0];
      lastname = partes.slice(1).join(" ") || partes[0];
    }

    // Aceita tanto telefone quanto phone
    const telephone = telefone || phone;

    // Monta produtos se vier do frontend
    let products: { product_sku: string; product_qty: number }[] = [];
    if (Array.isArray(produtos)) {
      products = produtos.map((p: any) => ({
        product_sku: p.sku,
        product_qty: p.quantidade,
      }));
    }

    // Tracking opcional
    const trackingObj = tracking || {};

    const data = {
      "access-token": APPMAX_ACCESS_TOKEN,
      firstname,
      lastname,
      email,
      telephone,
      ip: ip || req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      document_number: documento, // CPF/CNPJ
      postcode: endereco_cep ? String(endereco_cep).replace(/\D/g, "") : "",
      address_street: endereco_rua,
      address_street_number: endereco_numero,
      address_street_complement: endereco_complemento,
      address_street_district: endereco_bairro,
      address_city: endereco_cidade,
      address_state: endereco_estado,
      custom_txt,
      products,
      tracking: trackingObj,
    };

    // DEBUG: Log para verificar o token antes de enviar
    console.log("Enviando token para Appmax:", APPMAX_ACCESS_TOKEN);

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
    // Produtos fixos do pricing-section
    const PRODUCT_CATALOG = [
      {
        sku: "CARD1",
        name: "Starter",
        price: 49.9,
        quantity: 1,
      },
      {
        sku: "CARD3",
        name: "Negócio",
        price: 119.9,
        quantity: 3,
      },
      {
        sku: "CARD10",
        name: "Empresa",
        price: 299.9,
        quantity: 10,
      },
    ];

    // Recebe do frontend: dados do cliente OU apenas customer_id e produtos
    const {
      customer_id,
      nome,
      email,
      telefone,
      endereco_rua,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep,
      loja_pesquisada,
      produtos,
      shipping = 10.0,
      discount = 0,
      freight_type = "PAC",
    } = req.body;

    let customer;
    // Se veio customer_id, busca o cliente na Appmax
    if (customer_id) {
      const customerRes = await axios.get(
        `${APPMAX_API_URL}/customer/${customer_id}`,
        {
          params: { "access-token": APPMAX_ACCESS_TOKEN },
        }
      );
      customer = customerRes.data.data;
    } else {
      // 1. Cria cliente na Appmax
      const customerPayload = {
        "access-token": APPMAX_ACCESS_TOKEN,
        firstname: nome?.split(" ")[0] || "",
        lastname: nome?.split(" ").slice(1).join(" ") || "",
        email,
        telephone: telefone,
        postcode: endereco_cep,
        address_street: endereco_rua,
        address_street_number: endereco_numero,
        address_street_complement: endereco_complemento,
        address_street_district: endereco_bairro,
        address_city: endereco_cidade,
        address_state: endereco_estado,
      };
      const customerRes = await axios.post(
        `${APPMAX_API_URL}/customer`,
        customerPayload
      );
      customer = customerRes.data.data;
    }

    // 2. Monta products conforme catálogo e quantidade enviada
    let products: { sku: string; name: string; qty: number; price: number }[] =
      [];
    let orderTotal = 0;
    if (Array.isArray(produtos)) {
      products = produtos.map((p: any) => {
        const catalog = PRODUCT_CATALOG.find((c) => c.sku === p.sku);
        if (!catalog) throw new Error(`Produto SKU inválido: ${p.sku}`);
        const qty = p.quantidade || catalog.quantity;
        const price = catalog.price;
        orderTotal += price * qty;
        return {
          sku: catalog.sku,
          name: catalog.name,
          qty,
          price,
        };
      });
    }
    const finalTotal = orderTotal + shipping - discount;

    // 3. Cria pedido na Appmax
    const orderPayload = {
      "access-token": APPMAX_ACCESS_TOKEN,
      customer_id: customer.id,
      products,
      shipping,
      discount,
      freight_type,
      total: finalTotal,
    };
    const orderRes = await axios.post(`${APPMAX_API_URL}/order`, orderPayload);
    // Log completo da resposta do pedido para debug
    console.log(
      "[DEBUG] Resposta completa do pedido Appmax:",
      JSON.stringify(orderRes.data, null, 2)
    );
    const order = orderRes.data.data;

    // 4. Salva transação como pendente
    const record: TransactionRecord = {
      id: Date.now(),
      customer_id: customer.id,
      order_id: order.id,
      status: "pendente",
      created_at: new Date().toISOString(),
      user: {
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email,
        telephone: customer.telephone,
        address: {
          street: customer.address_street,
          number: customer.address_street_number,
          complement: customer.address_street_complement,
          district: customer.address_street_district,
          city: customer.address_city,
          state: customer.address_state,
          postcode: customer.postcode,
        },
        loja_pesquisada,
      },
    };
    saveTransaction(record);

    // 5. Retorna link de checkout para o frontend
    // Tenta buscar o link de checkout do local correto na resposta do pedido
    let checkout_url = "";
    // Tenta buscar no interested_bundle (objeto ou array)
    if (order && order.customer && order.customer.interested_bundle) {
      if (
        Array.isArray(order.customer.interested_bundle) &&
        order.customer.interested_bundle.length > 0
      ) {
        if (order.customer.interested_bundle[0].link_to_checkout) {
          checkout_url = order.customer.interested_bundle[0].link_to_checkout;
        }
      } else if (order.customer.interested_bundle.link_to_checkout) {
        checkout_url = order.customer.interested_bundle.link_to_checkout;
      }
    }
    // Se não achou, tenta buscar no bundles
    if (
      !checkout_url &&
      order &&
      order.bundles &&
      Array.isArray(order.bundles)
    ) {
      for (const bundle of order.bundles) {
        if (bundle.link_to_checkout) {
          checkout_url = bundle.link_to_checkout;
          break;
        }
      }
    }
    if (!checkout_url) {
      console.warn(
        "[ALERTA] Link de checkout não encontrado na resposta do pedido. Verifique configuração do produto/bundle na Appmax."
      );
    }
    console.log("[DEBUG] Link de checkout retornado:", checkout_url);
    res.json({
      success: true,
      text: "OK",
      checkout_url,
      order_id: order.id,
      customer_id: customer.id,
      debug_order: order, // Inclui toda a resposta para debug no frontend se quiser
    });
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

/**
 * Endpoint para consultar pedido na Appmax.
 * Envie o order_id como parâmetro na URL.
 * Exemplo de uso no frontend:
 *   fetch('/api/appmax/order/:orderId')
 */
router.get("/appmax/order/:orderId", async (req, res) => {
  try {
    const response = await axios.get(
      `${APPMAX_API_URL}/order/${req.params.orderId}`,
      { params: { "access-token": APPMAX_ACCESS_TOKEN } }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});

/**
 * Endpoint para processar pagamento via Pix na Appmax.
 * Envie customer_id, order_id e cpf no corpo da requisição.
 * Exemplo de uso no frontend:
 *   fetch('/api/appmax/payment/pix', { method: 'POST', body: JSON.stringify({ ...dadosPix }) })
 */
router.post("/appmax/payment/pix", async (req, res) => {
  try {
    const data = {
      ...req.body,
      "access-token": APPMAX_ACCESS_TOKEN,
    };
    const response = await axios.post(`${APPMAX_API_URL}/payment/pix`, data);
    res.json(response.data);
  } catch (error: any) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});

/**
 * Endpoint para processar pagamento via Boleto na Appmax.
 * Envie customer_id, order_id e cpf no corpo da requisição.
 * Exemplo de uso no frontend:
 *   fetch('/api/appmax/payment/boleto', { method: 'POST', body: JSON.stringify({ ...dadosBoleto }) })
 */
router.post("/appmax/payment/boleto", async (req, res) => {
  try {
    const data = {
      ...req.body,
      "access-token": APPMAX_ACCESS_TOKEN,
    };
    const response = await axios.post(`${APPMAX_API_URL}/payment/boleto`, data);
    res.json(response.data);
  } catch (error: any) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});

/**
 * Endpoint para receber webhooks da Appmax.
 * Cadastre esta rota no painel Appmax para receber notificações de eventos.
 */
router.post("/appmax/webhook", (req, res) => {
  // Trate os dados recebidos do webhook conforme sua lógica de negócio
  console.log("Webhook recebido:", req.body);
  const { order_id, order_status, payment_status } = req.body;
  // Normaliza status para TransactionStatus
  let status: "concluido" | "pendente" | "falha" = "pendente";
  if (order_status && typeof order_status === "string") {
    if (
      order_status.toLowerCase().includes("concluido") ||
      order_status.toLowerCase().includes("pago")
    ) {
      status = "concluido";
    } else if (order_status.toLowerCase().includes("falha")) {
      status = "falha";
    }
  }
  if (payment_status && typeof payment_status === "string") {
    if (
      payment_status.toLowerCase().includes("concluido") ||
      payment_status.toLowerCase().includes("pago")
    ) {
      status = "concluido";
    } else if (payment_status.toLowerCase().includes("falha")) {
      status = "falha";
    }
  }
  if (order_id) {
    const {
      updateTransactionStatus,
      getTransactionByOrderId,
    } = require("./db");
    updateTransactionStatus(order_id, status);
    // Busca transação para mostrar loja_pesquisada
    const transaction = getTransactionByOrderId(order_id);
    const loja = transaction?.user?.loja_pesquisada || "(não informado)";
    console.log(
      `Transação ${order_id} atualizada para status: ${status} | Loja pesquisada: ${loja}`
    );
  }
  res.sendStatus(200);
});

// Exporta o roteador para ser usado no arquivo de rotas principal do backend
export default router;
/**
 * Dica para visualizar logs completos:
 * - Use o terminal do sistema operacional (cmd, PowerShell, ou terminal integrado do VS Code em tela cheia)
 * - Ou rode o backend com redirecionamento para arquivo: `node server/index.js > logs.txt 2>&1` e abra o logs.txt
 * - Ou use ferramentas como PM2 para gerenciar logs longos
 */

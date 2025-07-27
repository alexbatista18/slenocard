// Importa o framework Express para criar rotas HTTP
import express from "express";
// Importa o axios para fazer requisições HTTP externas (API Appmax)
import axios from "axios";
import {
  saveTransaction,
  TransactionRecord,
  updateTransactionStatus,
} from "./db";

// Cria um roteador do Express para agrupar as rotas relacionadas à Appmax
const router = express.Router();

// Token de acesso fornecido pela Appmax (coloque no seu .env para segurança)
const APPMAX_ACCESS_TOKEN = process.env.APPMAX_ACCESS_TOKEN;
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
    const { customer_id, produtos, loja_pesquisada } = req.body;

    // 1. Validação inicial
    if (
      !loja_pesquisada ||
      typeof loja_pesquisada !== "object" ||
      !loja_pesquisada.nome
    ) {
      return res
        .status(400)
        .json({ error: "Selecione uma loja antes de finalizar o pedido." });
    }
    if (!customer_id) {
      return res
        .status(400)
        .json({ error: "O ID do cliente (customer_id) é obrigatório." });
    }

    // 2. Busca os dados do cliente na Appmax para pegar o HASH
    const customerRes = await axios.get(
      `${APPMAX_API_URL}/customer/${customer_id}`,
      { params: { "access-token": APPMAX_ACCESS_TOKEN } }
    );
    const customer = customerRes.data.data;
    const customerHash = customer.hash;

    if (!customerHash) {
      throw new Error("Não foi possível obter o hash do cliente da Appmax.");
    }

    // 3. Define o ID do Bundle (Oferta) do produto
    const skuSelecionado = produtos[0]?.sku || "CARD1";
    // Mapeamento dos SKUs para IDs dos bundles conforme imagem
    const bundleMap: Record<string, { id: number; nome: string }> = {
      CARD1: { id: 27838021, nome: "Cartão de Avaliação SlenoCard" },
      CARD3: { id: 27846752, nome: "3 Cartões de Avaliação SlenoCard" },
      CARD10: { id: 27846764, nome: "10 Cartões de Avaliação SlenoCard" },
    };
    const bundleInfo = bundleMap[skuSelecionado];
    if (!bundleInfo) {
      throw new Error(
        `SKU inválido ou Bundle ID não configurado: ${skuSelecionado}`
      );
    }
    const bundleId = bundleInfo.id;
    // bundleInfo.nome pode ser usado para logs ou registro

    // 4. Monta a URL de checkout manualmente
    const checkout_url = `https://slenocard1753621598844.carrinho.app/one-checkout/ocmtb/${bundleId}?customer=${customerHash}`;

    // 5. Salva um registro local PROVISÓRIO com order_id NULO
    const record: TransactionRecord = {
      id: Date.now(),
      customer_id: customer.id,
      order_id: null, // Ainda não temos o ID do pedido oficial
      status: "iniciado", // Um status inicial para indicar que o checkout foi gerado
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
        loja_pesquisada: loja_pesquisada, // Salvando a informação crucial
      },
    };
    saveTransaction(record);

    console.log(
      `[CHECKOUT] Link gerado para o cliente ${customer.id}: ${checkout_url}`
    );

    // 6. Retorna a URL para o frontend redirecionar o cliente
    res.json({
      success: true,
      checkout_url,
      customer_id: customer.id,
    });
  } catch (error: any) {
    console.error(
      "[ERRO EM /api/appmax/order]",
      error?.response?.data || error.message
    );
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
import { updateTransactionByEmail } from "./db";

router.post("/appmax/webhook", (req, res) => {
  console.log(`\n[WEBHOOK] Rota acessada em: ${new Date().toISOString()}`);

  try {
    const { data, event } = req.body;

    // 1. Extrai as informações essenciais do webhook
    const realOrderId = data?.id;
    const customerEmail = data?.customer?.email;
    const eventStatus = data?.status?.toLowerCase();

    if (!realOrderId || !customerEmail) {
      console.warn(
        "[WEBHOOK] Payload recebido sem order_id ou e-mail do cliente. Ignorando."
      );
      return res.sendStatus(200);
    }

    // Ignora o evento 'OrderIntegrated'
    if (event === "OrderIntegrated" || event === "OrderAuthorizedWithDelay") {
      console.log(`[WEBHOOK] Evento 'OrderIntegrated' ignorado.`);
      return res.sendStatus(200);
    }

    // 2. Determina o status final da transação
    let finalStatus:
      | "concluido"
      | "pendente"
      | "falha"
      | "pix_pendente"
      | "estornado" = "pendente";

    if (
      event === "OrderPaid" ||
      eventStatus === "aprovado" ||
      eventStatus === "pago"
    ) {
      finalStatus = "concluido";
    } else if (event === "OrderPixCreated") {
      finalStatus = "pix_pendente";
    } else if (event === "OrderRefund") {
      finalStatus = "estornado";
    } else if (
      eventStatus?.includes("falha") ||
      eventStatus?.includes("recusado")
    ) {
      finalStatus = "falha";
    }

    console.log(
      `[WEBHOOK] Evento: ${event} | Order ID: ${realOrderId} | Status: ${finalStatus} | Email: ${customerEmail}`
    );

    // 3. Atualiza a transação local usando o E-MAIL como chave de busca
    const updatedById = updateTransactionStatus(realOrderId, finalStatus);

    if (updatedById) {
      console.log(
        `[SUCESSO] Status da transação ${realOrderId} atualizado para '${finalStatus}'.`
      );
    } else {
      // 2. Se não encontrou por ID, assume que é o primeiro webhook e tenta vincular pelo e-mail.
      console.log(
        `[INFO] Não encontrou transação pelo ID ${realOrderId}. Tentando vincular pelo e-mail ${customerEmail}...`
      );
      const updatedByEmail = updateTransactionByEmail(customerEmail, {
        order_id: realOrderId,
        status: finalStatus,
      });

      if (updatedByEmail) {
        console.log(
          `[SUCESSO] Transação do cliente ${customerEmail} VINCULADA ao Order ID ${realOrderId} com status '${finalStatus}'.`
        );
      } else {
        console.warn(
          `[ALERTA] Nenhum registro encontrado para o Order ID ${realOrderId} ou para o e-mail pendente ${customerEmail}.`
        );
      }
    }
  } catch (error) {
    console.error("[ERRO NO WEBHOOK]", error);
  }

  res.sendStatus(200);
});
/**
 * Rota para buscar o link de checkout de um pedido Appmax
 * Se não existir, gera manualmente usando bundles.id e customer.hash
 * GET /appmax/order/:orderId/checkout-link
 */
router.get("/appmax/order/:orderId/checkout-link", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const response = await axios.get(`${APPMAX_API_URL}/order/${orderId}`, {
      params: { "access-token": APPMAX_ACCESS_TOKEN },
    });
    const order = response.data?.data;
    let checkout_url = "";
    // Tenta buscar o link de checkout padrão
    if (order && order.bundles && Array.isArray(order.bundles)) {
      for (const bundle of order.bundles) {
        if (bundle.link_to_checkout) {
          checkout_url = bundle.link_to_checkout;
          break;
        }
      }
      // Se não achou, gera manualmente
      if (!checkout_url && order.customer && order.customer.hash) {
        const bundleId = order.bundles[0]?.id;
        const hash = order.customer.hash;
        if (bundleId && hash) {
          checkout_url = `https://slenocard1753621598844.carrinho.app/one-checkout/ocmtb/${bundleId}?customer=${hash}`;
        }
      }
    }
    res.json({ checkout_url });
  } catch (error: any) {
    res.status(400).json({ error: error?.response?.data || error.message });
  }
});

// Exporta o roteador para ser usado no arquivo de rotas principal do backend
export default router;
/**
 * Dica para visualizar logs completos:
 * - Use o terminal do sistema operacional (cmd, PowerShell, ou terminal integrado do VS Code em tela cheia)
 * - Ou rode o backend com redirecionamento para arquivo: `node server/index.js > logs.txt 2>&1` e abra o logs.txt
 * - Ou use ferramentas como PM2 para gerenciar logs longos
 */

// Atualiza transação pelo e-mail, preenchendo order_id e status
import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "db.json");

export type TransactionStatus =
  | "iniciado"
  | "pendente"
  | "pagamento_pendente"
  | "pagamento_aprovado"
  | "nao_autorizado"
  | "analise_antifraude"
  | "recusado_por_risco"
  | "estornado"
  | "chargeback"
  | "chargeback_recuperado";

export type TransactionRecord = {
  id: number;
  customer_id: number;
  order_id: any;
  status: TransactionStatus;
  created_at: string;
  updated_at?: string;
  user: {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    address: {
      street: string;
      number: string;
      complement: string;
      district: string;
      city: string;
      state: string;
      postcode: string;
    };
    loja_pesquisada?: {
      nome: any;
      endereco: any;
      geometry: any;
    };
  };
};

export function saveTransaction(record: TransactionRecord) {
  let db: TransactionRecord[] = [];
  if (existsSync(DB_PATH)) {
    db = JSON.parse(readFileSync(DB_PATH, "utf-8"));
  }
  db.push(record);
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getTransactions(): TransactionRecord[] {
  if (!existsSync(DB_PATH)) return [];
  return JSON.parse(readFileSync(DB_PATH, "utf-8"));
}

// Atualiza o status de uma transação pelo order_id
export function updateTransactionStatus(
  order_id: number,
  status: string,
  webhookData?: any
) {
  let db: TransactionRecord[] = [];
  if (existsSync(DB_PATH)) {
    db = JSON.parse(readFileSync(DB_PATH, "utf-8"));
  }
  let updated = false;
  db = db.map((record) => {
    if (record.order_id === Number(order_id)) {
      updated = true;
      // Se o status recebido não está no tipo, salva como string mesmo
      return {
        ...record,
        status: status as TransactionStatus,
        updated_at: new Date().toISOString(),
      };
    }
    return record;
  });
  if (updated) {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }
  return updated;
}

export function updateTransactionByEmail(
  email: string,
  dataToUpdate: { order_id: number; status: string }
) {
  const transactions: TransactionRecord[] = getTransactions();
  // CORREÇÃO: Busca por 'order_id === null'
  const transactionIndex = transactions.findIndex(
    (t: TransactionRecord) => t.user?.email === email && t.order_id === null
  );

  if (transactionIndex > -1) {
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      order_id: dataToUpdate.order_id,
      status: dataToUpdate.status as TransactionStatus,
      updated_at: new Date().toISOString(), // Adiciona um timestamp de atualização
    };
    writeFileSync(DB_PATH, JSON.stringify(transactions, null, 2));
    console.log(`DB: Registro para ${email} atualizado com sucesso.`);
    return transactions[transactionIndex];
  }
  console.log(
    `DB: Nenhum registro pendente (com order_id nulo) encontrado para o e-mail ${email}.`
  );
  return null;
}

// Busca transação pelo e-mail do cliente
export function getTransactionByEmail(
  email: string
): TransactionRecord | undefined {
  if (!existsSync(DB_PATH)) return undefined;
  const db: TransactionRecord[] = JSON.parse(readFileSync(DB_PATH, "utf-8"));
  return db.find((record) => record.user?.email === email);
}

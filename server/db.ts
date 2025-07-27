import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "db.json");

export type TransactionStatus = "concluido" | "pendente" | "falha";

export type TransactionRecord = {
  id: number;
  customer_id: number;
  order_id: number;
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
  status: TransactionStatus,
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
      return {
        ...record,
        status: status,
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

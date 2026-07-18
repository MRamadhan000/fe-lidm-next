import { QuestionItemType } from '@/types/learning';

export interface QuestionItemRecord {
  id: string;
  type: QuestionItemType;
  name: string;
  image?: string | null;
  price: number;
  weight: number;
  quantity: number;
  orderNumber: number;
  moneyNominals?: Record<string, number> | null;
}

export interface MoneyRow {
  denom: string;
  qty: string;
}

export const emptyMoneyRow = (): MoneyRow => ({ denom: '', qty: '1' });

export const RUPIAH_PRESETS = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

export const moneyRowsFromNominals = (
  nominals?: Record<string, number> | null
): MoneyRow[] => {
  if (!nominals || Object.keys(nominals).length === 0) return [emptyMoneyRow()];
  return Object.entries(nominals).map(([denom, qty]) => ({ denom: String(denom), qty: String(qty) }));
};

export const moneyRowsToNominals = (rows: MoneyRow[]): Record<string, number> | null => {
  const entries = rows
    .filter((row) => row.denom.trim() !== '' && row.qty.trim() !== '')
    .map((row) => [row.denom.trim(), Number(row.qty)] as const);
  if (entries.length === 0) return null;
  return Object.fromEntries(entries);
};

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  productId: number;
  quantity: number;
}

export interface Invoice {
  id: number;
  number: string;
  status: 'Aberta' | 'Fechada';
  createdAt: string;
  items: InvoiceItem[];
}
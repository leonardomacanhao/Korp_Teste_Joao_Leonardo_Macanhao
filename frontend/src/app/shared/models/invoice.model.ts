import { INVOICE_STATUS } from '../../core/config/application.config';

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  productId: number;
  quantity: number;
}

export interface Invoice {
  id: number;
  number: string;
  status: typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];
  createdAt: string;
  items: InvoiceItem[];
}

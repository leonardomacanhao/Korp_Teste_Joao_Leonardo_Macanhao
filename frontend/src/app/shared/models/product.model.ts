export interface Product {
  id: number;
  code: string;
  description: string;
  stockBalance: number;
  isActive?: boolean;
  rowVersion?: string | null;
}
export interface Brand {
  name: string;
  products: {
    name: string;
    category: string;
    sector: string;
  }[];
}
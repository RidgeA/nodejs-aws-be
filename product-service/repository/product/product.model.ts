import { v4 } from 'uuid';

export class Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  count: number;

  constructor(data?: Partial<Product>) {
    if (data) {
      this.id = v4();
      this.title = data.title;
      this.description = data.description;
      this.price = data.price;
      this.images = data.images ?? [];
      this.count = data.count;
    }
  }
}

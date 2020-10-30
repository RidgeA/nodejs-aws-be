import { promises } from 'fs';
import { Product } from './product.interface';

const readFile = promises.readFile;

const once = (fn) => {
  let cached;
  return async (...args) => {
    if (!cached) {
      cached = await fn.call(null, args);
    }
    return cached
  }
}

const loadData = once(() => readFile('products-mock-data.json', 'utf8').then(JSON.parse))

export class ProductRepository {
  async getProductList(): Promise<Product[]> {
    return loadData();
  }

  async getProductById(id: string): Promise<Product> {

    const data = await loadData();

    return data.find(item => item.id === id);
  }
}

import { pg } from '../../infrastructure/db';
import { Query } from "../query.interface";
import { Product } from './product.type';

export class ProductRepository {

  async find(q: Query): Promise<Product[]> {
    const rows = await pg.many(q());

    return rows as unknown as Product[];
  }

  async findOne(q: Query): Promise<Product> {
    const rows = await pg.one(q());

    return rows as unknown as Product;
  }
}

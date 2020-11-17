import { sql } from "slonik";
import { pg } from 'product-servcie/infrastructure/db';
import { Query } from "../query.interface";
import { Product } from './product.model';

//TODO: Need a better way to close connection
export class ProductRepository {

  async find(q: Query): Promise<Product[]> {
    const rows = await pg.many(q());
    return rows as unknown as Product[];
  }

  async findOne(q: Query): Promise<Product> {
    const rows = await pg.one(q());
    return rows as unknown as Product;
  }

  async save(product: Product): Promise<Product> {

    const queries = [];

    queries.push(
      sql`
      insert into "product" ("product_id", "title", "description", "price") 
      values (${product.id}, ${product.title}, ${product.description}, ${product.price})
      `,
      sql`
      insert into "stock" ("product_id", "count") values (${product.id}, ${product.count})
      `,
    );

    if (product.images && product.images.length > 0) {
      const imgRecords = [];
      for (const img of product.images) {
        imgRecords.push(sql`(${product.id}, ${img})`);
      }
      queries.push(
        sql`
        insert into "product_image" ("product_id", "image_url") 
        values ${sql.join(imgRecords, sql`, `)}
        `
      );
    }

    await pg.transaction(async tx => {
      for (const query of queries) {
        await tx.query(query);
      }
    });

    return product;
  }
}

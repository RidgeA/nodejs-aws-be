import { sql } from "slonik";
import { pg } from '../../infrastructure/db';
import { Query } from "../query.interface";
import { Product } from './product.type';

//TODO: Need a better way to close connection
export class ProductRepository {

  async find(q: Query): Promise<Product[]> {
    const rows = await pg.many(q());
    await pg.end();

    return rows as unknown as Product[];
  }

  async findOne(q: Query): Promise<Product> {
    const rows = await pg.one(q());
    await pg.end();

    return rows as unknown as Product;
  }

  async save(product: Product): Promise<Product> {

    const insertProduct = sql`
    insert into "product" ("product_id", "title", "description", "price") 
    values (${product.id}, ${product.title}, ${product.description}, ${product.price})
    `;

    const insertCount = sql`
    insert into "stock" ("product_id", "count") values (${product.id}, ${product.count})
    `;

    const imgRecords = [];
    for (const img of product.images) {
      imgRecords.push(sql`(${product.id}, ${img})`);
    }
    const insertImages = sql`
    insert into "product_image" ("product_id", "image_url") 
    values ${sql.join(imgRecords, sql`, `)}
    `;

    await pg.transaction(async tx => {
      await tx.query(insertProduct);
      await tx.query(insertCount);
      await tx.query(insertImages);
    });
    await pg.end();

    return product;
  }
}

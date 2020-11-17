import { DatabasePoolType, sql } from "slonik";
import { inject, injectable } from "tsyringe";
import { Product } from '../../../models/product.model';
import { Token } from "../../di";
import { Query } from "../query.interface";

@injectable()
export class ProductRepository {

  constructor(
    @inject(Token.DBDriver) private readonly db: DatabasePoolType
  ) {
  }

  async find(q: Query): Promise<Product[]> {
    const rows = await this.db.many(q());
    return rows as unknown as Product[];
  }

  async findOne(q: Query): Promise<Product> {
    const rows = await this.db.one(q());
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

    await this.db.transaction(async tx => {
      for (const query of queries) {
        await tx.query(query);
      }
    });

    return product;
  }
}

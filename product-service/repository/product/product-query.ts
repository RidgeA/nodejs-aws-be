import { sql } from "slonik";
import { Query } from "../query.interface";

const productTableFields = (tAlias) => sql.join([
  sql`${sql.identifier([tAlias, 'product_id'])} ${sql.identifier(['id'])}`,
  sql`${sql.identifier([tAlias, 'title'])} ${sql.identifier(['title'])}`,
  sql`${sql.identifier([tAlias, 'description'])} ${sql.identifier(['description'])}`,
  sql`${sql.identifier([tAlias, 'price'])} ${sql.identifier(['price'])}`,
], sql`, `);

const stockTableFields = (tAlias) => sql.join([
  sql`${sql.identifier([tAlias, 'count'])} ${sql.identifier(['count'])}`,
], sql`, `);

const imagesFieldsArray = (tAlias) => sql.join([
  sql`array_agg(${sql.identifier([tAlias, 'image_url'])}) ${sql.identifier(['images'])}`,
], sql`, `);

export const Queries = {
  getProductsWithImagesAndStock: (): Query => {
    return () => sql`
      select
        ${productTableFields('p')},
        ${stockTableFields('s')},
        ${imagesFieldsArray('pi')}
      from product p
               join stock s on p.product_id = s.product_id
               join product_image pi on p.product_id = pi.product_id
      group by p.product_id, s.product_id;`;
  },

  getProductById: (id: string): Query => {
    return () => sql`
      select 
        ${productTableFields('p')},
        ${stockTableFields('s')},
        ${imagesFieldsArray('pi')}
      from product p
      join stock s on p.product_id = s.product_id
      join product_image pi on p.product_id = pi.product_id
      where p.product_id = ${id}
        group by p.product_id, s.product_id;`;
  },
};

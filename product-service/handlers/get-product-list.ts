import 'source-map-support/register';

import { APIGatewayProxyHandler } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { ProductRepository } from "../repository/product/product";
import { Queries } from "../repository/product/product-query";
import { Product } from "../repository/product/product.type";

interface ProductListGetter {
  find(Query): Promise<Product[]>
}

export function getProductListHandler(repo: ProductListGetter): APIGatewayProxyHandler {

  return async () => {
    try {
      const products = await repo.find(Queries.getProductsWithImagesAndStock());

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        statusCode: StatusCodes.OK,
        body: JSON.stringify(products),
      };
    } catch (err) {

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          message: err.message,
        }),
      };
    }
  };
}

export const getProductList: APIGatewayProxyHandler = getProductListHandler(new ProductRepository());

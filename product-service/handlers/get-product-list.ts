import { APIGatewayProxyHandler, } from 'aws-lambda';
import 'source-map-support/register';
import { ProductRepository } from "../repository/product";
import { Product } from "../repository/product.type";

interface ProductListGetter {
  getProductList(): Promise<Product[]>
}

export function getProductListHandler(repo: ProductListGetter): APIGatewayProxyHandler {

  return async () => {
    try {
      const products = await repo.getProductList()

      return {
        statusCode: 200,
        body: JSON.stringify(products),
      };
    } catch (err) {

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: err.message,
        })
      }
    }
  }
}

export const getProductList: APIGatewayProxyHandler = getProductListHandler(new ProductRepository());

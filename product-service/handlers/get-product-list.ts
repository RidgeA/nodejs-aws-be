import { APIGatewayProxyHandler, } from 'aws-lambda';
import 'source-map-support/register';
import { ProductRepository, } from "../repository/product";
import { Product, } from "../repository/product.type";
import { StatusCodes, } from 'http-status-codes';

interface ProductListGetter {
  getProductList(): Promise<Product[]>
}

export function getProductListHandler(repo: ProductListGetter): APIGatewayProxyHandler {

  return async () => {
    try {
      const products = await repo.getProductList();

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

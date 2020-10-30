import { APIGatewayProxyHandler, } from 'aws-lambda';
import 'source-map-support/register';
import { ProductRepository } from "../repository/product";
import { Product } from "../repository/product.type";

interface ProductByIdGetter {
  getProductById(id: string): Promise<Product>
}

export function getProductByIdHandler(repo: ProductByIdGetter): APIGatewayProxyHandler {

  return async (event) => {
    try {
      const { id } = event.pathParameters

      const product = await repo.getProductById(id)

      if (!product) {
        return {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          statusCode: 404,
          body: 'Product not found'
        }
      }

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: JSON.stringify(product),
      };
    } catch (err) {

      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        statusCode: 500,
        body: JSON.stringify({
          message: err.message,
        })
      }
    }
  }
}

export const getProductById: APIGatewayProxyHandler = getProductByIdHandler(new ProductRepository());

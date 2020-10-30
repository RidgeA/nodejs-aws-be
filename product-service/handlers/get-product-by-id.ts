import { APIGatewayProxyHandler, } from 'aws-lambda';
import 'source-map-support/register';
import { ProductRepository } from "../repository/product";
import { Product } from "../repository/product.interface";

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
          statusCode: 404,
          body: 'Product not found'
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify(product),
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

export const getProductById: APIGatewayProxyHandler = getProductByIdHandler(new ProductRepository());

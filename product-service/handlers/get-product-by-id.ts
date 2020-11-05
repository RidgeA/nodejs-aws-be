import middy from '@middy/core';
import cors from '@middy/http-cors';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';
import { NotFoundError } from "slonik";
import 'source-map-support/register';
import { ProductRepository } from "../repository/product/product";
import { Queries } from "../repository/product/product-query";
import { Product } from "../repository/product/product.type";

interface ProductByIdGetter {
  findOne(Query): Promise<Product>
}

export function getProductByIdHandler(repo: ProductByIdGetter): APIGatewayProxyHandler {

  return middy(
    async (event) => {
      try {
        const { id } = event.pathParameters;

        const product = await repo.findOne(Queries.getProductById(id));

        return {
          statusCode: StatusCodes.OK,
          body: JSON.stringify(product),
        };
      } catch (err) {

        if (err instanceof NotFoundError) {

          return {
            statusCode: StatusCodes.NOT_FOUND,
            body: 'Product not found',
          };
        }

        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          body: JSON.stringify({ message: err.message }),
        };
      }
    })
    .use(cors())
    .use(JSONErrorHandlerMiddleware());
}

export const getProductById: APIGatewayProxyHandler = getProductByIdHandler(new ProductRepository());


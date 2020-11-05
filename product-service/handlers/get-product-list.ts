import middy from '@middy/core';
import cors from "@middy/http-cors";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import JSONErrorHandlerMiddleware from "middy-middleware-json-error-handler";
import 'source-map-support/register';
import { ProductRepository } from "../repository/product/product";
import { Queries } from "../repository/product/product-query";
import { Product } from "../repository/product/product.type";

interface ProductListGetter {
  find(Query): Promise<Product[]>
}

export function getProductListHandler(repo: ProductListGetter): APIGatewayProxyHandler {

  return middy(
    async () => {
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
    })
    .use(cors())
    .use(JSONErrorHandlerMiddleware());
}

export const getProductList: APIGatewayProxyHandler = getProductListHandler(new ProductRepository());

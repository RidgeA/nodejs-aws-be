import middy from '@middy/core';
import cors from "@middy/http-cors";

import { APIGatewayProxyHandler } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import JSONErrorHandlerMiddleware from "middy-middleware-json-error-handler";
import 'source-map-support/register';
import { ConsoleLogger, Logger } from "../infrastructure/logger";
import { ProductRepository } from "../repository/product/product";
import { Queries } from "../repository/product/product-query";
import { Product } from "../repository/product/product.type";
import { LoggerMiddleware } from "./middleware/logger-middleware";

interface ProductListGetter {
  find(Query): Promise<Product[]>
}

export function getProductListHandler(repo: ProductListGetter, logger: Logger): APIGatewayProxyHandler {

  return middy(
    async () => {
      try {
        const products = await repo.find(Queries.getProductsWithImagesAndStock());

        return {
          statusCode: StatusCodes.OK,
          body: JSON.stringify(products),
        };
      } catch (err) {

        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          body: JSON.stringify({
            message: err.message,
          }),
        };
      }
    })
    .use(LoggerMiddleware(logger))
    .use(cors())
    .use(JSONErrorHandlerMiddleware());
}

export const getProductList: APIGatewayProxyHandler = getProductListHandler(new ProductRepository(), new ConsoleLogger());

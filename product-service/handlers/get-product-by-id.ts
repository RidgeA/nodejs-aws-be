import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import cors from '@middy/http-cors';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';
import { NotFoundError } from "slonik";
import { DependencyContainer } from "tsyringe";
import { Product } from "../../models/product.model";
import { buildResponse } from "../../shared/build-response";
import { Token } from "../di";
import { Logger } from "../infrastructure/logger";
import { Queries } from "../repository/product/product-query";
import { LoggerMiddleware } from "./middleware/logger-middleware";

interface ProductByIdGetter {
  findOne(Query): Promise<Product>
}

export function getProductByIdHandler(c: DependencyContainer): APIGatewayProxyHandler {

  const logger = c.resolve<Logger>(Token.Logger);
  const repo = c.resolve<ProductByIdGetter>(Token.ProductRepository);

  return middy(
    async (event) => {
      try {
        const { id } = event.pathParameters;

        const product = await repo.findOne(Queries.getProductById(id));

        return buildResponse(StatusCodes.OK, product);
      } catch (err) {

        if (err instanceof NotFoundError) {

          return buildResponse(StatusCodes.NOT_FOUND, 'Product not found');
        }

        throw err;
      }
    })
    .use(doNotWaitForEmptyEventLoop())
    .use(LoggerMiddleware(logger))
    .use(cors())
    .use(JSONErrorHandlerMiddleware());
}

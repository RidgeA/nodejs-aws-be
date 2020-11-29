import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import cors from "@middy/http-cors";
import { APIGatewayProxyHandler } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import JSONErrorHandlerMiddleware from "middy-middleware-json-error-handler";
import DependencyContainer from "tsyringe/dist/typings/types/dependency-container";
import { Product } from "../../models/product.model";
import { buildResponse } from "../../shared/build-response";
import { Token } from "../di";
import { Logger } from "../infrastructure/logger";
import { Queries } from "../repository/product/product-query";
import { LoggerMiddleware } from "./middleware/logger-middleware";

interface ProductListGetter {
  find(Query): Promise<Product[]>
}

export function getProductListHandler(c: DependencyContainer): APIGatewayProxyHandler {

  const logger = c.resolve<Logger>(Token.Logger);
  const repo = c.resolve<ProductListGetter>(Token.ProductRepository);

  return middy(async () => {
    const products = await repo.find(Queries.getProductsWithImagesAndStock());

    return buildResponse(StatusCodes.OK, products);
  })
    .use(doNotWaitForEmptyEventLoop())
    .use(LoggerMiddleware(logger))
    .use(cors())
    .use(JSONErrorHandlerMiddleware());
}

import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import cors from "@middy/http-cors";
import { APIGatewayProxyHandler } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import JSONErrorHandlerMiddleware from "middy-middleware-json-error-handler";
import 'source-map-support/register';
import { buildResponse } from "../../shared/build-response";
import { ConsoleLogger, Logger } from "../infrastructure/logger";
import { ProductRepository } from "../../repository/product/product";
import { Queries } from "../../repository/product/product-query";
import { Product } from "../../repository/product/product.model";
import { LoggerMiddleware } from "./middleware/logger-middleware";

interface ProductListGetter {
  find(Query): Promise<Product[]>
}

export function getProductListHandler(repo: ProductListGetter, logger?: Logger): APIGatewayProxyHandler {

  return middy(async () => {
    const products = await repo.find(Queries.getProductsWithImagesAndStock());

    return buildResponse(StatusCodes.OK, products);
  })
    .use(doNotWaitForEmptyEventLoop())
    .use(LoggerMiddleware(logger))
    .use(cors())
    .use(JSONErrorHandlerMiddleware());
}

export const getProductList: APIGatewayProxyHandler = getProductListHandler(new ProductRepository(), new ConsoleLogger());

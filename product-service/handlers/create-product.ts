import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import cors from '@middy/http-cors';
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import ClassValidatorMiddleware, { WithBody } from 'middy-middleware-class-validator';
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';
import { DependencyContainer } from "tsyringe";
import { Product } from "../../models/product.model";
import { buildResponse } from "../../shared/build-response";
import { Token } from "../di";
import { Logger } from "../infrastructure/logger";
import { CreateProductDto } from "../dto/create-product-dto";
import { LoggerMiddleware } from "./middleware/logger-middleware";

interface ProductSaver {
  save(Product): Promise<void>
}

export function createProductHandler(c: DependencyContainer): APIGatewayProxyHandler {

  const logger = c.resolve<Logger>(Token.Logger);
  const repo = c.resolve<ProductSaver>(Token.ProductRepository);

  return middy(
    async (event: WithBody<APIGatewayProxyEvent, CreateProductDto>) => {

      const product = new Product(event.body);

      await repo.save(product);

      return buildResponse(StatusCodes.CREATED, product);
    })
    .use(doNotWaitForEmptyEventLoop())
    .use(LoggerMiddleware(logger))
    .use(cors())
    .use(ClassValidatorMiddleware({ classType: CreateProductDto }))
    .use(JSONErrorHandlerMiddleware());
}

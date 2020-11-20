import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import cors from '@middy/http-cors';
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { IsArray, IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { StatusCodes } from "http-status-codes";
import ClassValidatorMiddleware, { WithBody } from 'middy-middleware-class-validator';
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';
import { DependencyContainer } from "tsyringe";
import { Product } from "../../models/product.model";
import { buildResponse } from "../../shared/build-response";
import { Token } from "../di";
import { Logger } from "../infrastructure/logger";
import { LoggerMiddleware } from "./middleware/logger-middleware";

interface ProductSaver {
  save(Product): Promise<void>
}

class CreateProductDTO {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsInt()
  @Min(1)
  price: number;

  @IsInt()
  @Min(0)
  count: number;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  images: string[];
}

export function createProductHandler(c: DependencyContainer): APIGatewayProxyHandler {

  const logger = c.resolve<Logger>(Token.Logger);
  const repo = c.resolve<ProductSaver>(Token.ProductRepository);

  return middy(
    async (event: WithBody<APIGatewayProxyEvent, CreateProductDTO>) => {

      const product = new Product(event.body);

      await repo.save(product);

      return buildResponse(StatusCodes.CREATED, product);
    })
    .use(doNotWaitForEmptyEventLoop())
    .use(LoggerMiddleware(logger))
    .use(cors())
    .use(ClassValidatorMiddleware({ classType: CreateProductDTO }))
    .use(JSONErrorHandlerMiddleware());
}

import middy from "@middy/core";
import cors from "@middy/http-cors";
import { APIGatewayProxyHandler } from "aws-lambda/trigger/api-gateway-proxy";
import { S3 } from "aws-sdk";
import { StatusCodes } from "http-status-codes";
import { container } from "tsyringe";
import DependencyContainer from "tsyringe/dist/typings/types/dependency-container";
import { buildResponse } from "../../shared/build-response";
import { Token } from "../di";
import { ConfigService } from "../services/config/config.service";

export const importProductsFile: APIGatewayProxyHandler = importProductsFileHandler(container);

export function importProductsFileHandler(c: DependencyContainer): APIGatewayProxyHandler {

  return middy(async (event) => {

    const name = event?.queryStringParameters?.name;
    if (!name) {
      return buildResponse(StatusCodes.BAD_REQUEST, 'name');
    }

    const s3 = c.resolve<S3>(Token.S3);
    const config = c.resolve<ConfigService>(Token.Config);

    const bucketName = config.env().bucket;
    const params = { Bucket: bucketName, Key: `upload/${name}` };
    const url = await s3.getSignedUrlPromise('putObject', params);

    return buildResponse(StatusCodes.OK, url);
  }).use(cors());
}

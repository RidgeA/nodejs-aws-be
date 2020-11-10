import middy from "@middy/core";
import cors from "@middy/http-cors";
import { APIGatewayProxyHandler } from "aws-lambda/trigger/api-gateway-proxy";
import { StatusCodes } from "http-status-codes";
import { container } from "tsyringe";
import DependencyContainer from "tsyringe/dist/typings/types/dependency-container";
import { Token } from "../di";
import { SignedUrlService } from "../services/signed-url/signed-url-service";
import { buildResponse } from "../utils";

export const importProductsFile: APIGatewayProxyHandler = importProductsFileHandler(container);

export function importProductsFileHandler(c: DependencyContainer): APIGatewayProxyHandler {

  return middy(async (event) => {

    const name = event?.queryStringParameters?.name;
    if (!name) {
      return buildResponse(StatusCodes.BAD_REQUEST, 'name');
    }

    const service = c.resolve<SignedUrlService>(Token.SignedUrlService);
    const uploadUrl = await service.getSignedUrl(name);

    return buildResponse(StatusCodes.OK, uploadUrl);
  }).use(cors());
}

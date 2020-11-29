import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Logger } from "../../infrastructure/logger";

type Handler = middy.HandlerLambda<APIGatewayProxyEvent, APIGatewayProxyResult>;

export const LoggerMiddleware = (logger: Logger): middy.MiddlewareObject<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return {
    after(handler: Handler, next: middy.NextFunction): void {
      try {
        const httpMethod = handler?.event?.httpMethod;
        const path = handler?.event?.path;
        const requestTime = handler?.event?.requestContext?.requestTime;
        const protocol = handler?.event?.requestContext?.protocol;
        const statusCode = handler?.response?.statusCode;
        logger.log(`[${requestTime}] ${httpMethod} ${path} ${protocol} ${statusCode}`);
      } catch (e) {
        console.log("Failed to log request:", e);
      }
      return next();
    },
  };
};

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { container } from "tsyringe";
import { Token } from "../di";
import { name } from '../package.json';
import { importProductsFileHandler } from "./import-products-file";

describe(name, () => {
  describe('importProductsFile', () => {

    beforeEach(() => {
      container.clearInstances();
    });

    it('should return HTTP status 400 (Bad Request) if name query parameter missed', async () => {

      container.register(Token.SignedUrlService, {
        useValue: {
          getSignedUrl: jest.fn(),
        },
      });

      const handler = importProductsFileHandler(container);

      const event = { queryStringParameters: {} } as APIGatewayProxyEvent;
      const context = {} as Context;
      const result = await handler(event, context, null) as APIGatewayProxyResult;

      expect(result).toHaveProperty('statusCode', StatusCodes.BAD_REQUEST);
    });

    it('should call return url with file name', async () => {

      const url = 'https://signed.url';
      container.register(Token.SignedUrlService, {
        useValue: {
          getSignedUrl: jest.fn().mockResolvedValue(url),
        },
      });

      const handler = importProductsFileHandler(container);

      const event = { queryStringParameters: { name: 'name' } } as unknown as APIGatewayProxyEvent;

      const context = {} as Context;
      const result = await handler(event, context, null) as APIGatewayProxyResult;

      expect(result).toHaveProperty('statusCode', StatusCodes.OK);
      expect(result).toHaveProperty('body', url);
    });

    it('should pass file name to the SignedUrlService service', async () => {

      const getSignedUrl = jest.fn().mockResolvedValue('https://signed.url');

      container.register(Token.SignedUrlService, {
        useValue: {
          getSignedUrl,
        },
      });

      const handler = importProductsFileHandler(container);

      const name = 'name';
      const event = { queryStringParameters: { name } } as unknown as APIGatewayProxyEvent;

      const context = {} as Context;
      await handler(event, context, null);

      const [firstCall] = getSignedUrl.mock.calls;
      const [firstArg] = firstCall;
      expect(firstArg).toBe(name);

    });


  });
});

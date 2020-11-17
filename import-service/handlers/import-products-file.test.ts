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

      const fileName = 'file-name';
      const bucket = 'bucket';
      const url = `https://signed.url/upload/${fileName}`;

      const configEnv = jest.fn().mockReturnValue({ bucket: bucket });
      const signedUrlPromise = jest.fn().mockResolvedValue(url);

      container
        .register(Token.Config, {
          useValue: {
            env: configEnv,
          },
        })
        .register(Token.S3, {
          useValue: {
            getSignedUrlPromise: signedUrlPromise,
          },
        });

      const handler = importProductsFileHandler(container);

      const event = { queryStringParameters: {} } as APIGatewayProxyEvent;
      const context = {} as Context;
      const result = await handler(event, context, null) as APIGatewayProxyResult;

      expect(result).toHaveProperty('statusCode', StatusCodes.BAD_REQUEST);
    });

    it('should call return url with file name', async () => {

      const fileName = 'file-name';
      const bucket = 'bucket';
      const url = `https://signed.url/upload/${fileName}`;

      const configEnv = jest.fn().mockReturnValue({ bucket: bucket });
      const signedUrlPromise = jest.fn().mockResolvedValue(url);
      container
        .register(Token.Config, {
          useValue: {
            env: configEnv,
          },
        })
        .register(Token.S3, {
          useValue: {
            getSignedUrlPromise: signedUrlPromise,
          },
        });

      const handler = importProductsFileHandler(container);

      const event = { queryStringParameters: { name: 'name' } } as unknown as APIGatewayProxyEvent;

      const context = {} as Context;
      const result = await handler(event, context, null) as APIGatewayProxyResult;

      expect(result).toHaveProperty('statusCode', StatusCodes.OK);
      expect(result).toHaveProperty('body', url);
    });

  });
});

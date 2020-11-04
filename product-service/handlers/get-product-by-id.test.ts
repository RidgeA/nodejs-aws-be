import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from "slonik";
import { name } from '../package.json';
import { getProductByIdHandler } from './get-product-by-id';

describe(name, () => {

  describe('getProductById', () => {

    it('should return product', async () => {

      const id = "673e8fa0-b0c7-49b1-a74a-ca6b5330e642";
      const repository = {
        findOne: jest.fn().mockResolvedValue({
          title: "Powerbank аккумулятор Xiaomi Mi Power Bank 20000",
          description: "Вес (г): 338; Размеры (мм): 141.9x73x21.8;",
          images: ["http://magazilla.ru/jpg_zoom1/700928.jpg"],
          price: 1815,
          id,
        }),
      };

      const handler = getProductByIdHandler(repository);

      const event = { pathParameters: { id } } as unknown as APIGatewayProxyEvent;

      const actual = await handler(event, null, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode', StatusCodes.OK);
      expect(typeof actual.body).toBe('string');
    });

    it('should return 404 status code if repository throws NotFoundError', async () => {

      const id = "673e8fa0-b0c7-49b1-a74a-ca6b5330e642";
      const repository = {
        findOne: jest.fn().mockRejectedValue(new NotFoundError()),
      };

      const handler = getProductByIdHandler(repository);

      const event = { pathParameters: { id } } as unknown as APIGatewayProxyEvent;

      const actual = await handler(event, null, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode', StatusCodes.NOT_FOUND);
      expect(actual.body).toBe('Product not found');
    });

    it('should return 500 status code if repository throws an error', async () => {

      const id = "673e8fa0-b0c7-49b1-a74a-ca6b5330e642";
      const repository = {
        findOne: jest.fn().mockRejectedValue(new Error('some error')),
      };

      const handler = getProductByIdHandler(repository);

      const event = { pathParameters: { id } } as unknown as APIGatewayProxyEvent;

      const actual = await handler(event, null, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode', StatusCodes.INTERNAL_SERVER_ERROR);
      expect(typeof actual.body).toBe('string');

    });

  });
});

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from "slonik";
import { container, DependencyContainer } from "tsyringe";
import { Token } from "../di";
import { NoopLogger } from "../infrastructure/logger";
import { name } from '../package.json';
import { getProductByIdHandler } from './get-product-by-id';

describe(name, () => {

  describe('getProductById', () => {

    let testContainer: DependencyContainer;

    beforeEach(() => {
      container.clearInstances();
      testContainer = container.createChildContainer();
      testContainer.register(Token.Logger, { useValue: new NoopLogger() });
    });

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
      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = getProductByIdHandler(testContainer);

      const event = { pathParameters: { id } } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;

      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode', StatusCodes.OK);
      expect(typeof actual.body).toBe('string');
    });

    it('should return 404 status code if repository throws NotFoundError', async () => {

      const id = "673e8fa0-b0c7-49b1-a74a-ca6b5330e642";
      const repository = {
        findOne: jest.fn().mockRejectedValue(new NotFoundError()),
      };
      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = getProductByIdHandler(testContainer);

      const event = { pathParameters: { id } } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;
      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode', StatusCodes.NOT_FOUND);
      expect(actual.body).toBe('Product not found');
    });

    it('should return 500 status code if repository throws an error', async () => {

      const id = "673e8fa0-b0c7-49b1-a74a-ca6b5330e642";
      const repository = {
        findOne: jest.fn().mockRejectedValue(new Error('some error')),
      };
      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = getProductByIdHandler(testContainer);

      const event = { pathParameters: { id } } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;
      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode', StatusCodes.INTERNAL_SERVER_ERROR);
      expect(typeof actual.body).toBe('string');

    });

  });
});

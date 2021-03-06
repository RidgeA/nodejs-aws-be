import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { StatusCodes } from 'http-status-codes';
import { container, DependencyContainer } from "tsyringe";
import { Product } from "../../models/product.model";
import { Token } from "../di";
import { NoopLogger } from "../infrastructure/logger";
import { name } from '../package.json';
import { getProductListHandler } from './get-product-list';

describe(name, () => {

  describe('getProductList', () => {

    let testContainer: DependencyContainer;

    beforeEach(() => {
      container.clearInstances();
      testContainer = container.createChildContainer();
      testContainer.register(Token.Logger, { useValue: new NoopLogger() });
    });

    it('should return a list of products', async () => {

      const repository = {
        find(): Promise<Product[]> {
          return Promise.resolve([
            {
              title: "Powerbank аккумулятор Xiaomi Mi Power Bank 20000",
              description: "Вес (г): 338; Размеры (мм): 141.9x73x21.8;",
              images: ["http://magazilla.ru/jpg_zoom1/700928.jpg"],
              price: 1815,
              count: 10,
              id: "673e8fa0-b0c7-49b1-a74a-ca6b5330e642",
            },
            {
              title: "Powerbank аккумулятор Xiaomi Mi Power Bank 2 10000",
              description: "Вес (г): 217; Размеры (мм): 130x71x14;",
              images: ["http://magazilla.ru/jpg_zoom1/1088756.jpg"],
              count: 10,
              price: 1045,
              id: "3a24dece-d71e-46e7-85b4-d0ca9e00c3e1",
            },
          ]);
        },
      };
      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = getProductListHandler(testContainer);

      const event = {} as APIGatewayProxyEvent;
      const context = {} as Context;
      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode', StatusCodes.OK);
      expect(typeof actual.body).toBe('string');
      expect(() => JSON.parse(actual.body)).not.toThrow();
    });

    it('should return 500 status code if some error happened', async () => {

      const repository = {
        find(): Promise<Product[]> {
          return Promise.reject(new Error('some error'));
        },
      };
      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = getProductListHandler(testContainer);

      const event = {} as APIGatewayProxyEvent;
      const context = {} as Context;
      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode', StatusCodes.INTERNAL_SERVER_ERROR);
      expect(typeof actual.body).toBe('string');
    });

  });
});

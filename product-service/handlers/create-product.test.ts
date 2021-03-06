import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { isUUID } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { container, DependencyContainer } from "tsyringe";
import { Token } from "../di";
import { NoopLogger } from "../infrastructure/logger";

import { name } from '../package.json';
import { createProductHandler } from "./create-product";

describe(name, () => {

  describe('createProduct', () => {

    let testContainer: DependencyContainer;

    beforeEach(() => {
      container.clearInstances();
      testContainer = container.createChildContainer();
      testContainer
        .register(Token.Logger, { useValue: new NoopLogger() });
    });

    it('should call repository to save a product', async () => {

      const product = {
        title: 'Product title',
        description: 'Product description',
        count: 1,
        price: 100,
        images: ['https://image.com/picture.jpg'],
      };

      const repository = {
        save: jest.fn().mockResolvedValue(product),
      };

      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = createProductHandler(testContainer);

      const event = {
        body: product,
        context: {},
      } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;
      await handler(event, context, null);

      expect(repository.save.mock.calls.length).toBe(1);

    });

    it('should return the product with `id` property', async () => {
      const product = {
        title: 'Product title',
        description: 'Product description',
        count: 1,
        price: 100,
        images: ['https://image.com/picture.jpg'],
      };

      const repository = {
        save: jest.fn().mockResolvedValue(product),
      };

      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = createProductHandler(testContainer);

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;
      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('body');

      const actualBody = JSON.parse(actual.body);
      expect(actualBody).toHaveProperty('id');
      expect(isUUID(actualBody.id, 4)).toBeTruthy();
      expect(actualBody).toHaveProperty('title', product.title);
      expect(actualBody).toHaveProperty('description', product.description);
      expect(actualBody).toHaveProperty('count', product.count);
      expect(actualBody).toHaveProperty('price', product.price);
      expect(actualBody).toHaveProperty('images', product.images);
    });

    it('should create a product without images', async () => {
      const product = {
        title: 'Product title',
        description: 'Product description',
        count: 1,
        price: 100,
      };

      const repository = {
        save: jest.fn().mockResolvedValue(product),
      };

      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = createProductHandler(testContainer);

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;
      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('body');

      const actualBody = JSON.parse(actual.body);
      expect(actualBody).toHaveProperty('images');
      expect(Array.isArray(actualBody.images)).toBeTruthy();
      expect(actualBody.images.length).toBe(0);
    });

    it.each(['title', 'count', 'price'])('should validate required fields (%s)', async (property) => {
      const product = {
        title: 'Product title',
        description: 'Product description',
        count: 1,
        price: 100,
        images: ['https://image.com/picture.jpg'],
        // remove property
        [property]: undefined,
      };

      const repository = {
        save: jest.fn().mockRejectedValue(new Error('should not be called')),
      };

      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = createProductHandler(testContainer);

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;
      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode');
      expect(actual.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(actual).toHaveProperty('body');
    });

    it.each([
      ['price', true],
      ['price', '100'],
      ['price', -1],
      ['price', 0],

      ['count', true],
      ['count', '100'],
      ['count', -1],
      ['count', -1],
    ])('should validate numeric properties (%s, %j)', async (property, value) => {
      const product = {
        title: 'Product title',
        description: 'Product description',
        count: 1,
        price: 100,
        images: ['https://image.com/picture.jpg'],
        // change property
        [property]: value,
      };

      const repository = {
        save: jest.fn().mockRejectedValue(new Error('should not be called')),
      };

      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = createProductHandler(testContainer);

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;

      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode');
      expect(actual.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(actual).toHaveProperty('body');
    });

    it.each([
      ['some string'],
      'not an array',
    ])('should validate images array (%j)', async (value) => {

      const product = {
        title: 'Product title',
        description: 'Product description',
        count: 1,
        price: 100,
        images: value,
        // change property
      };

      const repository = {
        save: jest.fn().mockRejectedValue(new Error('should not be called')),
      };

      testContainer.register(Token.ProductRepository, { useValue: repository });

      const handler = createProductHandler(testContainer);

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;
      const context = {} as Context;

      const actual = await handler(event, context, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode');
      expect(actual.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(actual).toHaveProperty('body');
    });

  });
});

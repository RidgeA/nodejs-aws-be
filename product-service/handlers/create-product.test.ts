import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { isUUID } from "class-validator";
import { StatusCodes } from "http-status-codes";
import { NoopLogger } from "../infrastructure/logger";

import { name } from '../package.json';
import { createProductHandler } from "./create-product";

describe(name, () => {
  describe('createProduct', () => {
    it('should call repository to save a product', async () => {

      const product = {
        title: 'Product title',
        description: 'Product description',
        count: 1,
        price: 100,
        images: ['https://image.com/picture.jpg'],
      };

      const repo = {
        save: jest.fn().mockResolvedValue(product),
      };

      const handler = createProductHandler(repo, new NoopLogger());

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;

      await handler(event, null, null);

      expect(repo.save.mock.calls.length).toBe(1);

    });

    it('should return the product with `id` property', async () => {
      const product = {
        title: 'Product title',
        description: 'Product description',
        count: 1,
        price: 100,
        images: ['https://image.com/picture.jpg'],
      };

      const repo = {
        save: jest.fn().mockResolvedValue(product),
      };

      const handler = createProductHandler(repo, new NoopLogger());

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;

      const actual = await handler(event, null, null);

      expect(actual).toHaveProperty('body');

      const actualBody = JSON.parse((actual as APIGatewayProxyResult).body);
      expect(actualBody).toHaveProperty('id');
      expect(isUUID(actualBody.id, 4)).toBeTruthy();
      expect(actualBody).toHaveProperty('title', product.title);
      expect(actualBody).toHaveProperty('description', product.description);
      expect(actualBody).toHaveProperty('count', product.count);
      expect(actualBody).toHaveProperty('price', product.price);
      expect(actualBody).toHaveProperty('images', product.images);
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

      const repo = {
        save: jest.fn().mockRejectedValue(new Error('should not be called')),
      };

      const handler = createProductHandler(repo, new NoopLogger());

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;

      const actual = await handler(event, null, null) as APIGatewayProxyResult;

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

      const repo = {
        save: jest.fn().mockRejectedValue(new Error('should not be called')),
      };

      const handler = createProductHandler(repo, new NoopLogger());

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;

      const actual = await handler(event, null, null) as APIGatewayProxyResult;

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

      const repo = {
        save: jest.fn().mockRejectedValue(new Error('should not be called')),
      };

      const handler = createProductHandler(repo, new NoopLogger());

      const event = {
        body: product,
      } as unknown as APIGatewayProxyEvent;

      const actual = await handler(event, null, null) as APIGatewayProxyResult;

      expect(actual).toHaveProperty('statusCode');
      expect(actual.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(actual).toHaveProperty('body');
    });

  });
});

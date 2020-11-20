import { SQSEvent } from "aws-lambda";
import { container, DependencyContainer } from "tsyringe";
import { Token } from "../di";
import { NoopLogger } from "../infrastructure/logger";
import { catalogBatchProcessHandler } from "./catalog-batch-process";

describe('catalogBatchProcess', () => {

  let testContainer: DependencyContainer;
  beforeEach(() => {
    testContainer = container.createChildContainer();
    testContainer.createChildContainer();
    testContainer.register(Token.Logger, { useClass: NoopLogger });
  });

  it('should call repository to save products', async () => {
    const save = jest.fn().mockResolvedValue(null);
    testContainer.register(Token.ProductRepository, {
      useValue: { save },
    });

    const product = {
      title: 'test product',
      description: 'test description',
      price: 1,
      count: 1,
      images: [],
    };
    const event = {
      Records: [
        {
          body: JSON.stringify(product),
        },
      ],
    } as SQSEvent;
    const handler = catalogBatchProcessHandler(testContainer);

    await handler(event, null, null);

    expect(save).toHaveBeenCalled();
    const [firstCall] = save.mock.calls;
    const [productsToSave] = firstCall;
    const [productToSave] = productsToSave;

    for (const [key, value] of Object.entries(product)) {
      expect(productToSave).toHaveProperty(key, value);
    }
  });

  it('should skip malformed json string', async () => {
    const save = jest.fn().mockResolvedValue(null);
    testContainer.register(Token.ProductRepository, {
      useValue: { save },
    });

    const product = {
      title: 'test product',
      description: 'test description',
      price: 1,
      count: 1,
      images: [],
    };
    const event = {
      Records: [
        {
          body: '{malformed}',
        },
        {
          body: JSON.stringify(product),
        },
      ],
    } as SQSEvent;
    const handler = catalogBatchProcessHandler(testContainer);

    await handler(event, null, null);

    expect(save).toHaveBeenCalled();
    const [firstCall] = save.mock.calls;
    const [productsToSave] = firstCall;
    expect(productsToSave.length).toBe(1);

    const [productToSave] = productsToSave;
    for (const [key, value] of Object.entries(product)) {
      expect(productToSave).toHaveProperty(key, value);
    }
  });

  it('should not call "save" method if there are not products to save', async () => {
    const save = jest.fn().mockResolvedValue(null);
    testContainer.register(Token.ProductRepository, {
      useValue: { save },
    });

    const event = {
      Records: [
        {
          body: '{malformed}',
        },
      ],
    } as SQSEvent;
    const handler = catalogBatchProcessHandler(testContainer);

    await handler(event, null, null);

    expect(save).not.toHaveBeenCalled();
  });
});

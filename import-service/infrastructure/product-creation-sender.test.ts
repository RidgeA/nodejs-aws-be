import { container, DependencyContainer } from "tsyringe";
import { Token } from "../di";
import { ProductCreationSender } from "./product-creation-sender";

describe('ProductCreationSender', () => {

  let testContainer: DependencyContainer;

  beforeEach(() => {
    testContainer = container.createChildContainer();
    testContainer.clearInstances();
    testContainer.register(Token.ProductCreationSender, { useClass: ProductCreationSender });
  });

  describe('send', () => {
    it('should send a message to SNS topic', async () => {
      const catalogItemsQueueUrl = 'catalogItemQueue';
      testContainer.register(Token.Config, {
        useValue: {
          env: () => ({ catalogItemsQueueUrl }),
        },
      });

      const promise = jest.fn().mockResolvedValue(null);
      const sendMessage = jest.fn().mockReturnValue({ promise });
      testContainer.register(Token.SQS, { useValue: { sendMessage } });

      const pcs = testContainer.resolve<ProductCreationSender>(Token.ProductCreationSender);

      const message = { hello: "world" };
      await pcs.send(message);

      expect(sendMessage).toHaveBeenCalledWith({
        MessageBody: JSON.stringify(message),
        QueueUrl: catalogItemsQueueUrl,
      });
      expect(promise).toHaveBeenCalled();

    });
  });
});

import { SQSEvent, SQSHandler } from "aws-lambda";
import { DependencyContainer } from "tsyringe";
import { Product } from "../../models/product.model";
import { Token } from "../di";
import { Logger } from "../infrastructure/logger";
import { NewProductNotificationService } from "../infrastructure/new-product-notification-service";

interface ProductBatchSaver {
  save(products: Product[]): Promise<Product[]>
}

export function catalogBatchProcessHandler(c: DependencyContainer): SQSHandler {

  const repository = c.resolve<ProductBatchSaver>(Token.ProductRepository);
  const notification = c.resolve<NewProductNotificationService>(Token.NewProductNotificationService);
  const logger = c.resolve<Logger>(Token.Logger);

  return async (event: SQSEvent) => {

    logger.log(`Got ${event.Records.length} records to process`);

    const products: Product[] = [];
    for (const rec of event.Records) {
      try {
        const data = JSON.parse(rec.body);
        products.push(new Product(data));
      } catch (error) {
        logger.log(`Failed to parse message body. Body: ${rec.body}, error: ${error.message}`);
      }
    }

    if (products.length === 0) {
      logger.log('Nothing to save');
      return;
    }

    logger.log(`Saving ${products.length} new products...`);
    await repository.save(products);

    await notification.send(JSON.stringify(products, null, 2));
  };
}

import { SQSEvent, SQSHandler } from "aws-lambda";
import { transformAndValidate } from "class-transformer-validator";
import { DependencyContainer } from "tsyringe";
import { Product } from "../../models/product.model";
import { Token } from "../di";
import { CreateProductDto } from "../dto/create-product-dto";
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
    const errors: Error[] = [];
    for (const rec of event.Records) {
      try {
        const dto = await transformAndValidate(CreateProductDto, rec.body) as Product;

        products.push(new Product(dto));
      } catch (error) {
        logger.log(`Validation failed, error: ${error}`);
        errors.push(error);
      }
    }

    if (products.length !== 0) {
      logger.log(`Saving ${products.length} new products...`);
      await repository.save(products);
    }

    if (products.length !== 0 || errors.length !== 0) {
      await notification.send(products, errors);
    }
  };
}

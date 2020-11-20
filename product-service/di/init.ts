import { SNS } from "aws-sdk";
import { container } from "tsyringe";
import { pg } from "../infrastructure/db";
import { ConsoleLogger } from "../infrastructure/logger";
import { NewProductNotificationService } from "../infrastructure/new-product-notification-service";
import { ProductRepository } from "../repository/product/product";
import { Token } from "./index";

container
  .register(Token.DBDriver, { useValue: pg })
  .register(Token.ProductRepository, { useClass: ProductRepository })
  .register(Token.Logger, { useClass: ConsoleLogger })
  .register(Token.SNS, { useFactory: () => new SNS({ region: 'eu-west-1' }) })
  .register(Token.NewProductNotificationService, { useClass: NewProductNotificationService })
;


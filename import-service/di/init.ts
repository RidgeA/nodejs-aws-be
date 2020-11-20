import { S3, SQS } from "aws-sdk";
import { container, Lifecycle } from "tsyringe";
import { ObjectStorage } from "../infrastructure/object-storage";
import { ProductCreationSender } from "../infrastructure/product-creation-sender";
import { ConfigService } from "../services/config/config.service";
import { Token } from "./index";

container
  .register(Token.Config, { useClass: ConfigService }, { lifecycle: Lifecycle.Singleton })
  .register(Token.SQS, { useFactory: () => new SQS({ region: 'eu-west-1' }) })
  .register(Token.S3, { useFactory: () => new S3({ region: 'eu-west-1', signatureVersion: 'v4' }) })
  .register(Token.ObjectStorage, { useClass: ObjectStorage }, { lifecycle: Lifecycle.Singleton })
  .register(Token.ProductCreationSender, { useClass: ProductCreationSender }, { lifecycle: Lifecycle.Singleton })
;

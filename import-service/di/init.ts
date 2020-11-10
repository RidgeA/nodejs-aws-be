import { S3 } from "aws-sdk";
import { container, Lifecycle } from "tsyringe";
import { ConfigService } from "../services/config/config.service";
import { SignedUrlService } from "../services/signed-url/signed-url-service";
import { Token } from "./index";

container
  .register(Token.S3, { useFactory: () => new S3({ region: 'eu-west-1', signatureVersion: 'v4' }) })
  .register(Token.Config, { useClass: ConfigService }, { lifecycle: Lifecycle.Singleton })
  .register(Token.SignedUrlService, { useClass: SignedUrlService });

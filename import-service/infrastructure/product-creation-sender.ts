import { SQS } from "aws-sdk";
import { inject, injectable } from "tsyringe";
import { Token } from "../di";
import { ConfigService } from "../services/config/config.service";

@injectable()
export class ProductCreationSender {
  constructor(
    @inject(Token.Config) private readonly config: ConfigService,
    @inject(Token.SQS) private readonly sqs: SQS,
  ) {
  }

  async send<T>(message: T): Promise<void> {

    const req = this.sqs.sendMessage({
        MessageBody: JSON.stringify(message),
        QueueUrl: this.config.env().catalogItemsQueueUrl,
      }
    );

    await req.promise();

    return;
  }
}

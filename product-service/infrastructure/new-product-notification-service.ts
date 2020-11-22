import { SNS } from "aws-sdk";
import { inject, injectable } from "tsyringe";
import { Product } from "../../models/product.model";
import { Token } from "../di";

@injectable()
export class NewProductNotificationService {

  constructor(
    @inject(Token.SNS) private readonly sns: SNS,
  ) {
  }

  async send(products: Product[], errors: Error[]): Promise<void> {
    if (products && products.length > 0) {
      await this.sns.publish({
        TopicArn: process.env.SNS_TOPIC_CREATE_PRODUCT_TOPIC_ARN,
        Message: JSON.stringify(products, null, 2),
        MessageAttributes: {
          'result': {
            DataType: 'String',
            StringValue: 'success',
          },
        },
      }).promise();
    }

    if (errors && errors.length > 0) {
      await this.sns.publish({
        TopicArn: process.env.SNS_TOPIC_CREATE_PRODUCT_TOPIC_ARN,
        Message: JSON.stringify(errors, null, 2),
        MessageAttributes: {
          'result': {
            DataType: 'String',
            StringValue: 'error',
          },
        },
      });
    }
    return;
  }
}

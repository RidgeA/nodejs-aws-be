import { SNS } from "aws-sdk";
import { inject, injectable } from "tsyringe";
import { Token } from "../di";

@injectable()
export class NewProductNotificationService {

  constructor(
    @inject(Token.SNS) private readonly sns: SNS,
  ) {
  }

  async send(message: string): Promise<void> {
    await this.sns.publish({
      TopicArn: 'arn:aws:sns:eu-west-1:625494443472:createProductTopic',
      Message: message,
    }).promise();
    return;
  }
}

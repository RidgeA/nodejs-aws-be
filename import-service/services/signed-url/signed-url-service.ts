import { S3 } from "aws-sdk";
import { inject, injectable } from "tsyringe";
import { Token } from "../../di";
import { ConfigService } from "../config/config.service";

@injectable()
export class SignedUrlService {

  constructor(
    @inject(Token.S3) private readonly s3: S3,
    @inject(Token.Config) private readonly config: ConfigService,
  ) {

  }

  async getSignedUrl(fileName: string): Promise<string> {
    const bucketName = this.config.env().bucket;
    const params = { Bucket: bucketName, Key: `upload/${fileName}` };
    return this.s3.getSignedUrlPromise('putObject', params);
  }
}

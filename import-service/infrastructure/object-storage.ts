import { S3 } from "aws-sdk";
import { inject, injectable } from "tsyringe";
import { Token } from "../di";
import ReadableStream = NodeJS.ReadableStream;

@injectable()
export class ObjectStorage {
  constructor(
    @inject(Token.S3) private readonly s3: S3,
  ) {
  }

  readStream(bucket: string, key: string): ReadableStream {
    return this.s3.getObject({
      Bucket: bucket,
      Key: key,
    }).createReadStream();
  }

  async move(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void> {
    await this.s3.copyObject({
      Bucket: destinationBucket,
      CopySource: `/${sourceBucket}/${sourceKey}`,
      Key: destinationKey,
    }).promise();

    await this.s3.deleteObject({
      Bucket: sourceBucket,
      Key: sourceKey,
    }).promise();

    return;
  }

  async moveWithinBucket(bucket: string, sourceKey: string, destinationKey: string): Promise<void> {
    return this.move(bucket, sourceKey, bucket, destinationKey);
  }
}

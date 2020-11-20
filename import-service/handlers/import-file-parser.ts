import { S3Event, S3Handler } from "aws-lambda";
import parse from "csv-parser";
import { pipeline, Writable } from "stream";
import { DependencyContainer } from "tsyringe";
import { promisify } from "util";
import { Token } from "../di";
import { ObjectStorage } from "../infrastructure/object-storage";
import { ProductCreationSender } from "../infrastructure/product-creation-sender";

const pipelineP = promisify(pipeline);

// todo: move to a separate class
// todo: add validation
const writableSender = (sender: ProductCreationSender): Writable => {
  return new Writable({
    objectMode: true,
    write(record: Record<string, unknown>, encoding: string, callback) {
      const product = {
        title: record.title as string,
        description: record.description as string,
        price: Number(record.price),
        count: Number(record.count),
        images: (record.images as string)?.split(';') ?? [],
      };

      sender.send(product)
        .then(() => callback())
        .catch(callback);
    },
  });
};

export function importFileParserHandler(c: DependencyContainer): S3Handler {

  const storage = c.resolve<ObjectStorage>(Token.ObjectStorage);
  const sender = c.resolve<ProductCreationSender>(Token.ProductCreationSender);

  return async (event: S3Event/*, context*/) => {

    const parser = parse();

    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const key = record.s3.object.key;
      const readStream = storage.readStream(bucketName, key);

      await pipelineP(
        readStream,
        parser,
        writableSender(sender),
      );

      await storage.moveWithinBucket(bucketName, key, key.replace('upload/', 'parsed/'));
    }
  };
}

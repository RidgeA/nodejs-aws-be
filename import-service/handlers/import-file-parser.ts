import middy from "@middy/core";
import { S3Event, S3Handler } from "aws-lambda";
import { S3 } from "aws-sdk";
import parse from "csv-parser";
import { pipeline, Writable } from "stream";
import { container, DependencyContainer } from "tsyringe";
import { promisify } from "util";
import { Product } from "../../repository/product/product.model";
import { Token } from "../di";

const pipelineP = promisify(pipeline);

export function importFileParserHandler(c: DependencyContainer): S3Handler {

  return middy(
    async (event: S3Event/*, context*/) => {

      const parser = parse();
      const s3 = c.resolve<S3>(Token.S3);

      for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const key = record.s3.object.key;
        const readStream = s3.getObject({
          Bucket: bucketName,
          Key: key,
        }).createReadStream();

        await pipelineP(
          readStream,
          parser,
          new Writable({
            objectMode: true,
            write(record: Record<string, unknown>, encoding: string, callback) {
              const product = new Product({
                title: record.title as string,
                description: record.description as string,
                price: Number(record.price),
                count: Number(record.count),
                images: (record.images as string).split(';'),
              });
              console.log(product);
              callback();
            },
          })
        );

        await s3.copyObject({
          Bucket: bucketName,
          CopySource: `/${bucketName}/${key}`,
          Key: key.replace('upload/', 'parsed/'),
        }).promise();

        await s3.deleteObject({
          Bucket: bucketName,
          Key: key,
        }).promise();
      }
    }
  );
}

export const importFileParser: S3Handler = importFileParserHandler(container);

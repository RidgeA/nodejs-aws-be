import { Context, S3Event } from "aws-lambda";
import { Readable } from "stream";
import { container } from "tsyringe";
import { Token } from "../di";
import { name } from '../package.json';
import { importFileParserHandler } from "./import-file-parser";

describe(name, () => {

  beforeEach(() => {
    container.clearInstances();
  });

  describe('import-file-parser', () => {

    it('should send file to a queue', async () => {
      const expProduct = {
        count: 1,
        description: "product description",
        images: [
          "https://images.com/picture1.jpg",
          "https://images.com/picture2.jpg",
        ],
        price: 1,
        title: "product title",
      };

      const readStream = jest.fn().mockReturnValue(
        Readable.from([
          'title,description,price,count,images\n',
          `${expProduct.title},${expProduct.description},${expProduct.price},${expProduct.count},${expProduct.images[0]};${expProduct.images[1]}`,
        ]));

      const moveWithinBucket = jest.fn().mockReturnValue(null);

      container.register(Token.ObjectStorage, {
        useValue: {
          readStream,
          moveWithinBucket,
        },
      });

      const send = jest.fn().mockResolvedValue(null);
      container.register(Token.ProductCreationSender, {
        useValue: {
          send,
        },
      });

      /*const handler = */
      const handler = importFileParserHandler(container);

      const event = {
        Records: [
          {
            s3: {
              bucket: {
                name: 'bucket-name',
              },
              object: {
                key: 'object-key',
              },
            },
          },
        ],
      } as S3Event;
      const context = {} as Context;
      await handler(event, context, null);

      expect(readStream).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(expProduct);
    });

    it('should move file to "parsed" directory', async () => {

      const expProduct = {
        count: 1,
        description: "product description",
        images: [
          "https://images.com/picture1.jpg",
          "https://images.com/picture2.jpg",
        ],
        price: 1,
        title: "product title",
      };

      const readStream = jest.fn().mockReturnValue(
        Readable.from([
          'title,description,price,count,images\n',
          `${expProduct.title},${expProduct.description},${expProduct.price},${expProduct.count},${expProduct.images[0]};${expProduct.images[1]}`,
        ]));

      const moveWithinBucket = jest.fn().mockReturnValue(null);

      container.register(Token.ObjectStorage, {
        useValue: {
          readStream,
          moveWithinBucket,
        },
      });

      const send = jest.fn().mockResolvedValue(null);
      container.register(Token.ProductCreationSender, {
        useValue: {
          send,
        },
      });

      /*const handler = */
      const handler = importFileParserHandler(container);

      const bucketName = 'bucket-name';
      const objectKey = 'upload/object-key';
      const event = {
        Records: [
          {
            s3: {
              bucket: {
                name: bucketName,
              },
              object: {
                key: objectKey,
              },
            },
          },
        ],
      } as S3Event;
      const context = {} as Context;
      await handler(event, context, null);

      expect(moveWithinBucket).toHaveBeenCalledTimes(1);
      expect(moveWithinBucket).toHaveBeenCalledWith(bucketName, objectKey, objectKey.replace('upload', 'parsed'));
    });
  });
});

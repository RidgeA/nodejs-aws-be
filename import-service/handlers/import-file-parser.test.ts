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

    it('should parse file using stream', async () => {
      // todo: add paring check

      const createReadStream = jest.fn().mockReturnValue(Readable.from([
        'title,description,price,count,images\n',
        'product title,product description,1,1,https://images.com/picture1.jpg;https://images.com/picture2.jpg\n',
      ]));
      const getObject = jest.fn().mockReturnValue({ createReadStream });
      const copyObject = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
      const deleteObject = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
      container.register(Token.S3, {
        useValue: {
          getObject,
          copyObject,
          deleteObject,
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

      expect(getObject).toHaveBeenCalledTimes(1);
      expect(createReadStream).toHaveBeenCalledTimes(1);

      expect(copyObject).toHaveBeenCalledTimes(1);
      expect(deleteObject).toHaveBeenCalledTimes(1);
    });

    it('should move file to "parsed" directory', async () => {

      const createReadStream = jest.fn().mockReturnValue(Readable.from(['hello,world\n']));
      const getObject = jest.fn().mockReturnValue({ createReadStream });
      const copyObject = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
      const deleteObject = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
      container.register(Token.S3, {
        useValue: {
          getObject,
          copyObject,
          deleteObject,
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

      expect(copyObject).toHaveBeenCalledTimes(1);
      expect(copyObject).toHaveBeenCalledWith({
        Bucket: bucketName,
        Key: objectKey.replace('upload', 'parsed'),
        CopySource: `/${bucketName}/${objectKey}`,
      });

      expect(deleteObject).toHaveBeenCalledTimes(1);
      expect(deleteObject).toHaveBeenCalledWith({
        Bucket: bucketName,
        Key: objectKey,
      });
    });

  });
});

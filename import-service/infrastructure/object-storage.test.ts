import { Readable } from "stream";
import { container, DependencyContainer } from "tsyringe";
import { Token } from "../di";
import { ObjectStorage } from "./object-storage";

describe('ObjectStorage', () => {

  let testContainer: DependencyContainer;

  beforeEach(() => {
    testContainer = container.createChildContainer();
    testContainer.clearInstances();

    testContainer.register(Token.ObjectStorage, { useClass: ObjectStorage });
  });

  describe('readStream', () => {
    it('should call S3 to get the object and stream it', () => {

      const createReadStream = jest.fn().mockReturnValue(Readable.from(['hello']));
      const getObject = jest.fn().mockReturnValue({ createReadStream });
      testContainer.register(Token.S3, {
        useValue: {
          getObject,
        },
      });

      const bucket = 'bucket';
      const key = 'key';

      const os = testContainer.resolve<ObjectStorage>(Token.ObjectStorage);

      os.readStream(bucket, key);

      expect(getObject).toHaveBeenCalled();
      expect(getObject).toHaveBeenCalledWith({
        Bucket: bucket,
        Key: key,
      });
      expect(createReadStream).toHaveBeenCalled();
    });
  });

  describe('move', () => {
    it('should call S3 api to copy and delete object', async () => {
      const copyObject = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
      const deleteObject = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
      testContainer.register(Token.S3, {
        useValue: {
          copyObject,
          deleteObject,
        },
      });

      const sourceBucket = 'sourceBucket';
      const sourceKey = 'sourceKey';
      const destBucket = 'destBucket';
      const destKey = 'destKey';

      const os = testContainer.resolve<ObjectStorage>(Token.ObjectStorage);

      await os.move(sourceBucket, sourceKey, destBucket, destKey);

      expect(copyObject).toHaveBeenCalledWith({
        Bucket: destBucket,
        CopySource: `/${sourceBucket}/${sourceKey}`,
        Key: destKey,
      });

      expect(deleteObject).toHaveBeenCalledWith({
        Bucket: sourceBucket,
        Key: sourceKey,
      });

    });
  });

  describe('moveWithinBucket', () => {
    it('should call S3 api to copy and delete object', async () => {
      const copyObject = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
      const deleteObject = jest.fn().mockReturnValue({ promise: () => Promise.resolve() });
      testContainer.register(Token.S3, {
        useValue: {
          copyObject,
          deleteObject,
        },
      });

      const sourceBucket = 'sourceBucket';
      const sourceKey = 'sourceKey';
      const destKey = 'destKey';

      const os = testContainer.resolve<ObjectStorage>(Token.ObjectStorage);

      await os.moveWithinBucket(sourceBucket, sourceKey, destKey);

      expect(copyObject).toHaveBeenCalledWith({
        Bucket: sourceBucket,
        CopySource: `/${sourceBucket}/${sourceKey}`,
        Key: destKey,
      });

      expect(deleteObject).toHaveBeenCalledWith({
        Bucket: sourceBucket,
        Key: sourceKey,
      });

    });
  });

});

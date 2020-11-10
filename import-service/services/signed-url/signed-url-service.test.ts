import { container } from "tsyringe";
import { Token } from "../../di";
import { name } from '../../package.json';
import { SignedUrlService } from "./signed-url-service";

describe(name, () => {
  describe('SignedUrlService', () => {

    beforeEach(() => {
      container.clearInstances();
      container.register(Token.SignedUrlService, { useClass: SignedUrlService });
    });

    it('should return signed url form S3 service', async () => {

      const fileName = 'file-name';
      const bucket = 'bucket';
      const url = `https://signed.url/upload/${fileName}`;

      const configEnv = jest.fn().mockReturnValue({ bucket: bucket });
      const signedUrlPromise = jest.fn().mockResolvedValue(url);

      container
        .register(Token.Config, {
          useValue: {
            env: configEnv,
          },
        })
        .register(Token.S3, {
          useValue: {
            getSignedUrlPromise: signedUrlPromise,
          },
        });

      const service = container.resolve<SignedUrlService>(Token.SignedUrlService);

      const actual = await service.getSignedUrl(fileName);

      expect(actual).toBe(url);


    });

    it('should set proper options for S3.getSignedUrlPromise method', async () => {

      const fileName = 'file-name';
      const bucket = 'bucket';
      const url = `https://signed.url/upload/${fileName}`;

      const configEnv = jest.fn().mockReturnValue({ bucket: bucket });
      const signedUrlPromise = jest.fn().mockResolvedValue(url);

      container
        .register(Token.Config, {
          useValue: {
            env: configEnv,
          },
        })
        .register(Token.S3, {
          useValue: {
            getSignedUrlPromise: signedUrlPromise,
          },
        });

      const service = container.resolve<SignedUrlService>(Token.SignedUrlService);

      await service.getSignedUrl(fileName);

      const [firstCall] = signedUrlPromise.mock.calls;
      const [operation, params] = firstCall;

      expect(operation).toBe('putObject');
      expect(params).toHaveProperty('Bucket', bucket);
      expect(params).toHaveProperty('Key', `upload/${fileName}`);

    });
  });
});

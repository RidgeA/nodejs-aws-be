import { ConfigEnv } from "./config.env.interface";

export class ConfigService {
  env(): ConfigEnv {
    return {
      bucket: process.env.BUCKET,
      catalogItemsQueueUrl: process.env.SQS_QUEUE_CATALOG_ITEMS_QUEUE_REF,
    };
  }
}

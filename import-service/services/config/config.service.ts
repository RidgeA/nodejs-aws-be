// import { singleton } from "tsyringe";
import { ConfigEnv } from "./config.env.interface";

// @singleton()
export class ConfigService {
  env(): ConfigEnv {
    return {
      bucket: process.env.BUCKET,
    };
  }
}

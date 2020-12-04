import { ConfigEnv } from "./config.env.interface";

export class ConfigService {
  env(): ConfigEnv {
    return {
      ...process.env,
    };
  }
}

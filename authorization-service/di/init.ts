import { container, Lifecycle } from "tsyringe";
import { ConfigService } from "../services/config/config.service";
import { Token } from "./index";

container
  .register(Token.Config, { useClass: ConfigService }, { lifecycle: Lifecycle.Singleton })
;

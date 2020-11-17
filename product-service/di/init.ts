import { container } from "tsyringe";
import { pg } from "../infrastructure/db";
import { ConsoleLogger } from "../infrastructure/logger";
import { ProductRepository } from "../repository/product/product";
import { Token } from "./index";

container
  .register(Token.DBDriver, { useValue: pg })
  .register(Token.ProductRepository, { useClass: ProductRepository })
  .register(Token.Logger, { useClass: ConsoleLogger });


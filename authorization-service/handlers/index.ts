import { container } from "tsyringe";
import { basicAuthorizerHandler } from "./basic-authorizer";

export const basicAuthorizer = basicAuthorizerHandler(container);

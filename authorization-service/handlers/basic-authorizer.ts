import {
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda';
import { DependencyContainer } from "tsyringe";
import { Token } from "../di";
import { ConfigService } from "../services/config/config.service";

function isTokenEvent(e: APIGatewayTokenAuthorizerEvent | APIGatewayRequestAuthorizerEvent): e is APIGatewayTokenAuthorizerEvent {
  return e.type === 'TOKEN';
}

function getPolicy(principalId: string, effect: 'Allow' | 'Deny', resource: string): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: effect,
          Action: 'execute-api:Invoke',
          Resource: resource,
        },
      ],
    },
  };
}

function allow(principalId: string, resource: string): APIGatewayAuthorizerResult {
  return getPolicy(principalId, 'Allow', resource);
}

function deny(principalId: string, resource: string): APIGatewayAuthorizerResult {
  return getPolicy(principalId, 'Deny', resource);
}

export function basicAuthorizerHandler(c: DependencyContainer): APIGatewayAuthorizerHandler {
  const config = c.resolve<ConfigService>(Token.Config);

  return async (
    event: APIGatewayTokenAuthorizerEvent | APIGatewayRequestAuthorizerEvent,
    /*context: Context,*/
    /*callback*/) => {

    if (!isTokenEvent(event)) {
      throw new Error('Unauthorized');
    }

    try {

      const [, encodedCredentials] = event.authorizationToken.split(' ');
      const [user, password] = Buffer.from(encodedCredentials, 'base64').toString().split(':');
      if (!password || !user) {
        return deny(encodedCredentials, event.methodArn);
      }

      const storedPassword = config.env()[user];

      if (password && password === storedPassword) {
        return allow(encodedCredentials, event.methodArn);
      }

      return deny(encodedCredentials, event.methodArn);

    } catch (err) {
      console.log('Error: ', err.error);
      throw new Error('Unauthorized');
    }

  };
}

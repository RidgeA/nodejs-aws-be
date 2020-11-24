import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { container, DependencyContainer } from "tsyringe";
import { Token } from "../di";
import { basicAuthorizerHandler } from "./basic-authorizer";

describe('basicAuthorizer', () => {

  let testContainer: DependencyContainer;

  beforeEach(() => {
    testContainer = container.createChildContainer();
    testContainer.clearInstances();
  });

  it('should return Allow policy for valid computedCredentials', async () => {

    const user = 'user';
    const password = 'password';
    testContainer.register(Token.Config, {
      useValue: {
        env: () => ({ [user]: password }),
      },
    });

    const handler = basicAuthorizerHandler(testContainer);

    const event = {
      type: 'TOKEN',
      authorizationToken: `Basic: ${Buffer.from(`${user}:${password}`).toString('base64')}`,
      methodArn: 'arn',
    } as APIGatewayTokenAuthorizerEvent;
    const actual = await handler(event, null, null);

    expect(actual).toHaveProperty('principalId', event.authorizationToken.split(' ')[1]);
    expect(actual).toHaveProperty('policyDocument.Statement.0.Effect', 'Allow');
    expect(actual).toHaveProperty('policyDocument.Statement.0.Action', 'execute-api:Invoke');
    expect(actual).toHaveProperty('policyDocument.Statement.0.Resource', event.methodArn);
  });

  it('should return Deny policy for valid computedCredentials', async () => {

    testContainer.register(Token.Config, {
      useValue: {
        env: () => ({ user: 'password' }),
      },
    });

    const handler = basicAuthorizerHandler(testContainer);

    const event = {
      type: 'TOKEN',
      authorizationToken: `Basic: ${Buffer.from('bad:user').toString('base64')}`,
      methodArn: 'arn',
    } as APIGatewayTokenAuthorizerEvent;
    const actual = await handler(event, null, null);

    expect(actual).toHaveProperty('principalId', event.authorizationToken.split(' ')[1]);
    expect(actual).toHaveProperty('policyDocument.Statement.0.Effect', 'Deny');
    expect(actual).toHaveProperty('policyDocument.Statement.0.Action', 'execute-api:Invoke');
    expect(actual).toHaveProperty('policyDocument.Statement.0.Resource', event.methodArn);
  });

  it.skip('should return something if request malformed', () => {
    return;
  });

});

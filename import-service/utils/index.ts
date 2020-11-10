import { APIGatewayProxyResult } from "aws-lambda";

const isString = (v: unknown): v is string => {
  return typeof v === 'string';
};

export const buildResponse = (statusCode: number, _body: Record<string, unknown> | string): APIGatewayProxyResult => {

  let body;

  if (isString(_body)) {
    body = _body;
  } else {
    body = JSON.stringify(_body);
  }


  return {
    statusCode,
    body,
  };
};

import Axios from 'axios';
import { APIGatewayProxyEvent } from "aws-lambda";
import { decode } from 'jsonwebtoken';
import { SigningKey } from './SigningKey';
import { JwtPayload } from './JwtPayload';

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const jwtToken = getToken(event.headers.Authorization);

  return parseUserId(jwtToken)
}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

export async function getSigningKey(jwksUrl: string, kid: string) {

  const res = await Axios.get<{ keys: SigningKey[] }>(jwksUrl,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Credentials': true,
      }
    });

  const signingKey = res.data?.keys?.find(key =>
    key.kid === kid
    && key.use === 'sig'
    && key.kty === 'RSA'
    && key.x5c?.length > 0
  );

  if (!signingKey) {
    return null;
  }

  return {
    ...signingKey,
    publicKey: certToPEM(signingKey.x5c[0])
  };

}

function certToPEM(cert: string) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----\n`;
  return cert;
}

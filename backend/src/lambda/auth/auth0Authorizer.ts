import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { decode, verify } from 'jsonwebtoken'
import 'source-map-support/register'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { getSigningKey, getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth_auth0_authorizer');

const jwksUrl = 'https://dev-4yc6wwycj1c6fva8.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a Tenant', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('Tenant was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('Tenant not authorized', { error: e.message })

    return {
      principalId: 'tenant',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt = decode(token, { complete: true }) as Jwt;

  const key = await getSigningKey(jwksUrl, jwt.header.kid);

  return verify(
    token,
    key.publicKey,
    {
      algorithms: ['RS256']
    }
  ) as JwtPayload;
}
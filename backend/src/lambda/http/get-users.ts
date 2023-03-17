import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import 'source-map-support/register'
import { getUsers } from '../../services/user-service'
import { createLogger } from '../../utils/logger'
import { CustomEvent } from '../CustomEvent'
import { credentialsParser } from '../middlewares'

const logger = createLogger('lambda_get_users');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { tenantId } = event as CustomEvent;
      const users = await getUsers(tenantId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: users
        })
      }
    } catch (error) {
      logger.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Unable to get users"
        })
      }
    }
  }
);

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .use(credentialsParser());
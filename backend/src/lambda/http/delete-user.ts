import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import 'source-map-support/register'
import { deleteUser } from '../../db-access/user-access'
import { createLogger } from '../../utils/logger'
import { CustomEvent } from '../CustomEvent'
import { credentialsParser } from '../middlewares'

const logger = createLogger('lambda_delete_user');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { tenantId } = event as CustomEvent;
      const { userId } = event.pathParameters;

      await deleteUser(tenantId, userId);

      logger.info("Deleted user", { userId });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Item deleted"
        })
      };
    } catch (error) {
      logger.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Unable to delete user"
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .use(credentialsParser());
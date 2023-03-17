import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import 'source-map-support/register'
import { UpdateUserRequest } from '../../requests/UpdateUserRequest'
import { updateUser } from '../../services/user-service'
import { createLogger } from '../../utils/logger'
import { CustomEvent } from '../CustomEvent'
import { credentialsParser } from '../middlewares'

const logger = createLogger('lambda_update_user');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { userId } = event.pathParameters;
      const { name, joinDate } = JSON.parse(event.body) as UpdateUserRequest;
      const { tenantId } = event as CustomEvent;
      const updatedItem = await updateUser(tenantId, userId, { name, joinDate });

      logger.info("Updated user", { tenantId, userId });

      return {
        statusCode: 200,
        body: JSON.stringify({
          updatedItem
        })
      };
    } catch (error) {
      logger.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Unable to update user"
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
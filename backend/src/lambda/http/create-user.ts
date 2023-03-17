import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import 'source-map-support/register'
import { CreateUserRequest } from '../../requests/CreateUserRequest'
import { createUser } from '../../services/user-service'
import { createLogger } from '../../utils/logger'
import { CustomEvent } from '../CustomEvent'
import { credentialsParser } from '../middlewares'

const logger = createLogger('lambda_create_user');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { tenantId } = event as CustomEvent;
      const { name, joinDate } = JSON.parse(event.body) as CreateUserRequest;

      const user = await createUser(tenantId, { name, joinDate });

      logger.info("Created new user", { user });

      return {
        statusCode: 201,
        body: JSON.stringify({
          item: user
        })
      };

    } catch (error) {
      logger.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Unable to create new user"
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
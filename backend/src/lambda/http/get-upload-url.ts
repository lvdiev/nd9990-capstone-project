import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import 'source-map-support/register'
import { getAvatarUploadUrl } from '../../services/user-service'
import { createLogger } from '../../utils/logger'
import { CustomEvent } from '../CustomEvent'
import { credentialsParser } from '../middlewares'

const logger = createLogger('lambda_gen_upload_url');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { userId } = event.pathParameters;
      const { tenantId } = event as CustomEvent;
      const url = await getAvatarUploadUrl(tenantId, userId);

      logger.info("Generated upload URL", { tenantId, userId, url });

      return {
        statusCode: 201,
        body: JSON.stringify({
          url
        })
      }
    } catch (error) {
      logger.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Unable to generate upload URL"
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
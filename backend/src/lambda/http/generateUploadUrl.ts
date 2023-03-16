import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getAttachmentUploadUrl } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { CustomEvent } from '../CustomEvent'
import { credentialsParser } from '../middlewares'

const logger = createLogger('lambda_gen_upload_url');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { todoId } = event.pathParameters;
      const { userId } = event as CustomEvent;
      const url = await getAttachmentUploadUrl(userId, todoId);

      logger.info("Generated upload URL", { userId, todoId, url });

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
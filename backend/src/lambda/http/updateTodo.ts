import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { CustomEvent } from '../CustomEvent'
import { credentialsParser } from '../middlewares'

const logger = createLogger('lambda_update_todo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { todoId } = event.pathParameters;
      const { name, dueDate, done } = JSON.parse(event.body) as UpdateTodoRequest;
      const { userId } = event as CustomEvent;
      const updatedItem = await updateTodo(userId, todoId, { name, dueDate, done });

      logger.info("Updated TODO", { userId, todoId });

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
          error: "Unable to update TODO"
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
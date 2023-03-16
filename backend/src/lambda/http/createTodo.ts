import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { credentialsParser } from '../middlewares'
import { CustomEvent } from '../CustomEvent'

const logger = createLogger('lambda_create_todo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const { userId } = event as CustomEvent;
      const { name, dueDate } = JSON.parse(event.body) as CreateTodoRequest;

      const todo = await createTodo(userId, { name, dueDate });

      logger.info("Created new TODO", { todo });

      return {
        statusCode: 201,
        body: JSON.stringify({
          item: todo
        })
      };

    } catch (error) {
      logger.error(error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Unable to create new TODO"
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
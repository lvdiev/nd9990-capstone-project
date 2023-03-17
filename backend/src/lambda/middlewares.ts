import { APIGatewayProxyResult } from 'aws-lambda';
import { getTenantId } from '../auth/utils';
import { createLogger } from '../utils/logger';
import { CustomEvent } from './CustomEvent';

const logger = createLogger('lambda_middlewares');

export const credentialsParser = () => ({
  before: (handler, next) => {
    const event = handler.event as CustomEvent;
    const token = event.headers.Authorization;

    if (!token) {
      const res: APIGatewayProxyResult = {
        statusCode: 401,
        body: JSON.stringify({ error: 'No token found.' })
      };
      return next(res);
    }

    try {

      event.tenantId = getTenantId(event);

    } catch (error) {
      logger.error(error);

      const res: APIGatewayProxyResult = {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid token.' })
      };

      return next(res);
    }

    return next();
  }
});
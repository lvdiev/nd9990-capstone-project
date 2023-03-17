import { APIGatewayProxyEvent } from 'aws-lambda';

export interface CustomEvent extends APIGatewayProxyEvent {
    tenantId?: string;
}
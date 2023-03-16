import { APIGatewayProxyEvent } from 'aws-lambda';

export interface CustomEvent extends APIGatewayProxyEvent {
    userId?: string;
}
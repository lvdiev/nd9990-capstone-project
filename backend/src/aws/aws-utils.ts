import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger';
import * as uuid from 'uuid';

const xaws = AWSXRay.captureAWS(AWS);
const logger = createLogger('helpers_aws_utils');
const s3 = createS3Client();

export function createDynamoDBClient(): DocumentClient {
    return !process.env.IS_OFFLINE
        ? new xaws.DynamoDB.DocumentClient()
        : new xaws.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });
}

export function createS3Client() {
    return new xaws.S3({ signatureVersion: 'v4' });
}

export async function getS3SignedUrl(s3Bucket: string, urlTimeout: number) {

    logger.info('getS3PresignedUrl', { s3Bucket, urlTimeout });

    const key = uuid.v4();
    const objectUrl = `https://${s3Bucket}.s3.amazonaws.com/${key}`;

    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: s3Bucket,
        Key: key,
        Expires: urlTimeout
    });

    return { objectUrl, signedUrl };
}
import { createDynamoDBClient } from './awsUtils';

const dbClient = createDynamoDBClient();

export async function updateAttachmentUrl(userId: string, todoId: string, url: string): Promise<string> {
  await dbClient.update({
    TableName: process.env.TODOS_TABLE,
    Key: {
      userId: userId,
      todoId: todoId
    },
    UpdateExpression: "set attachmentUrl = :url",
    ExpressionAttributeValues: {
      ":url": url,
    }
  }).promise();

  return url
}

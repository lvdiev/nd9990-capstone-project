import { User } from '../models/User';
import { UserUpdate } from '../models/UserUpdate';
import { createLogger } from '../utils/logger';
import { createDynamoDBClient } from '../aws/aws-utils';

const logger = createLogger('helpers_user_access');
const dbClient = createDynamoDBClient();
const userTable = process.env.USER_TABLE;
const userCreatedIndex = process.env.USER_CREATED_AT_INDEX

export async function createUser(user: User): Promise<User> {
  try {
    await dbClient.put({
      TableName: userTable,
      Item: user
    }).promise();

    return user;
  } catch (error) {
    logger.error(error);

    return null;
  }
}

export async function getUsersByTenantId(tenantId: string): Promise<User[]> {
  try {
    const result = await dbClient.query({
      TableName: userTable,
      IndexName: userCreatedIndex,
      KeyConditionExpression: 'tenantId = :pk',
      ExpressionAttributeValues: {
        ':pk': tenantId
      }
    }).promise();

    return result.Items as User[];
  } catch (error) {
    logger.error(error);

    return [];
  }
};

export async function searchUsers(tenantId: string, keyword: string): Promise<User[]> {
  try {
    const result = await dbClient.scan({
      TableName: userTable,
      FilterExpression: 'tenantId = :tenantId and contains(name, :keyword)',
      ExpressionAttributeValues: {
        ':tenantId': tenantId,
        ':keyword': keyword,
      },
    }).promise();

    return result.Items as User[];
  } catch (error) {
    logger.error(error);

    return [];
  }
}

export async function updateUser(tenantId: String, userId: String, { name, joinDate }: UserUpdate): Promise<boolean> {
  try {
    await dbClient.update({
      TableName: userTable,
      Key: {
        userId: userId,
        tenantId: tenantId
      },
      UpdateExpression: "set name = :name, joinDate = :joinDate",
      ExpressionAttributeValues: {
        ":name": name,
        ":joinDate": joinDate
      }
    }).promise();

    return true;

  } catch (error) {
    logger.error(error);

    return false;
  }
}

export async function deleteUser(tenantId: String, userId: String): Promise<boolean> {
  try {
    await dbClient.delete({
      TableName: userTable,
      Key: {
        userId: userId,
        tenantId: tenantId
      }
    }).promise();

    return true;
  } catch (error) {
    logger.error(error);

    return false;
  }
}

export async function updateAvatarUrl(tenantId: string, userId: string, url: string): Promise<string> {
  await dbClient.update({
    TableName: userTable,
    Key: {
      tenantId: tenantId,
      userId: userId
    },
    UpdateExpression: "set avatarUrl = :url",
    ExpressionAttributeValues: {
      ":url": url,
    }
  }).promise();

  return url
}

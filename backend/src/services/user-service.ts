import * as uuid from 'uuid';
import { User } from '../models/User';
import { CreateUserRequest } from '../requests/CreateUserRequest';
import { UpdateUserRequest } from '../requests/UpdateUserRequest';
import { createLogger } from '../utils/logger';
import { getS3SignedUrl } from '../aws/aws-utils';
import * as userAccess from '../db-access/user-access';

const s3Bucket = process.env.AVATAR_S3_BUCKET;
const urlTimeout = Number(process.env.SIGNED_URL_EXPIRATION);

const logger = createLogger('helpers_totos')

export async function searchUser(tenantId: string, keyword: string): Promise<User[]> {
  return userAccess.searchUsers(tenantId, keyword);
}

export async function getUsers(tenantId: string): Promise<User[]> {
  return await userAccess.getUsersByTenantId(tenantId);
}

export async function createUser(tenantId: string, { name, joinDate }: CreateUserRequest): Promise<User> {
  logger.info('createUser', { tenantId, name, joinDate });

  return await userAccess.createUser({
    tenantId: tenantId,
    userId: uuid.v4(),
    name: name,
    joinDate: joinDate
  })
}

export async function updateUser(tenantId: string, userId: string, { name, joinDate }: UpdateUserRequest): Promise<boolean> {
  logger.info('updateUser', { tenantId, userId });

  return await userAccess.updateUser(
    tenantId, userId,
    {
      name,
      joinDate
    }
  )
}

export async function getAvatarUploadUrl(tenantId: string, userId: string) {
  logger.info('getAvatarUploadUrl', { tenantId, userId });

  const { objectUrl, signedUrl } = await getS3SignedUrl(s3Bucket, urlTimeout);

  await userAccess.updateAvatarUrl(tenantId, userId, objectUrl);

  return signedUrl;
}

export async function deleteUser(tenantId: string, userId: string): Promise<boolean> {
  logger.info('deleteUser', { tenantId, userId });

  return await userAccess.deleteUser(tenantId, userId);
}
import * as uuid from 'uuid';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
import { updateAttachmentUrl } from './attachmentUtils';
import { getS3SignedUrl } from './awsUtils';
import * as todosAccess from './todosAccess';

const s3Bucket = process.env.ATTACHMENT_S3_BUCKET;
const urlTimeout = Number(process.env.SIGNED_URL_EXPIRATION);

const logger = createLogger('helpers_totos')

export async function searchTodo(userId: string, keyword: string): Promise<TodoItem[]> {
  return todosAccess.searchTodos(userId, keyword);
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return await todosAccess.getTodosByUserId(userId);
}

export async function createTodo(userId: string, { name, dueDate }: CreateTodoRequest): Promise<TodoItem> {
  logger.info('createTodo', { userId, name, dueDate });

  return await todosAccess.createTodo({
    todoId: uuid.v4(),
    userId: userId,
    name: name,
    dueDate: dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export async function updateTodo(userId: string, todoId: string, { name, dueDate, done }: UpdateTodoRequest): Promise<boolean> {
  logger.info('updateTodo', { userId, todoId });

  return await todosAccess.updateTodo(
    userId, todoId,
    { name, dueDate, done }
  )
}

export async function getAttachmentUploadUrl(userId: string, todoId: string) {
  logger.info('getAttachmentUploadUrl', { userId, todoId });

  const { objectUrl, signedUrl } = await getS3SignedUrl(s3Bucket, urlTimeout);

  await updateAttachmentUrl(userId, todoId, objectUrl);

  return signedUrl;
}

export async function deleteTodo(userId: string, todoId: string): Promise<boolean> {
  logger.info('deleteTodo', { userId, todoId });

  return await todosAccess.deleteTodo(userId, todoId);
}
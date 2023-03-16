import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { createLogger } from '../utils/logger';
import { createDynamoDBClient } from './awsUtils';

const logger = createLogger('helpers_todo_access');
const dbClient = createDynamoDBClient();
const todosTable = process.env.TODOS_TABLE;
const todoCreatedIndex = process.env.TODOS_CREATED_AT_INDEX

export async function createTodo(todo: TodoItem): Promise<TodoItem> {
  try {
    await dbClient.put({
      TableName: todosTable,
      Item: todo
    }).promise();

    return todo;
  } catch (error) {
    logger.error(error);

    return null;
  }
}

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  try {
    const result = await dbClient.query({
      TableName: todosTable,
      IndexName: todoCreatedIndex,
      KeyConditionExpression: 'userId = :pk',
      ExpressionAttributeValues: {
        ':pk': userId
      }
    }).promise();

    return result.Items as TodoItem[];
  } catch (error) {
    logger.error(error);

    return [];
  }
};

export async function searchTodos(userId: string, keyword: string): Promise<TodoItem[]> {
  try {
    const result = await dbClient.scan({
      TableName: todosTable,
      FilterExpression: 'userId = :userId and contains(name, :keyword)',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':keyword': keyword,
      },
    }).promise();

    return result.Items as TodoItem[];
  } catch (error) {
    logger.error(error);

    return [];
  }
}

export async function updateTodo(userId: String, todoId: String, { name, dueDate, done }: TodoUpdate): Promise<boolean> {
  try {
    await dbClient.update({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
        ":name": name,
        ":dueDate": dueDate,
        ":done": done
      }
    }).promise();

    return true;

  } catch (error) {
    logger.error(error);

    return false;
  }
}

export async function deleteTodo(userId: String, todoId: String): Promise<boolean> {
  try {
    await dbClient.delete({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }).promise();

    return true;
  } catch (error) {
    logger.error(error);

    return false;
  }
}

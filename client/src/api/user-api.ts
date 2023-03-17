import Axios from 'axios';
import { apiEndpoint } from '../config';
import { CreateUserRequest } from '../types/CreateUserRequest';
import { UpdateUserRequest } from '../types/UpdateUserRequest';
import { User } from '../types/User';

function getHeaders(idToken: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  }
}

export async function getUsers(idToken: string): Promise<User[]> {
  console.log('Fetching users')

  const response = await Axios.get(`${apiEndpoint}/users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Users:', response.data)
  return response.data.items
}

export async function createUser(
  idToken: string,
  newUser: CreateUserRequest
): Promise<User> {
  const response = await Axios.post(`${apiEndpoint}/users`, JSON.stringify(newUser), {
    headers: getHeaders(idToken)
  })
  return response.data.item
}

export async function patchUser(
  idToken: string,
  userId: string,
  updatedUser: UpdateUserRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/users/${userId}`, JSON.stringify(updatedUser), {
    headers: getHeaders(idToken)
  })
}

export async function deleteUser(
  idToken: string,
  userId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/users/${userId}`, {
    headers: getHeaders(idToken)
  })
}

export async function getUploadUrl(
  idToken: string,
  userId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/users/${userId}/avatar`, '', {
    headers: getHeaders(idToken)
  })
  return response.data.url
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

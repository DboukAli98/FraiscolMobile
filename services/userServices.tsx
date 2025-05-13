import { User } from '@/types';
import apiClient from './apiClient';

export type NewUser = Omit<User, 'id'>;

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<User[]>('/users');
  return data;
};




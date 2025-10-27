import { IUser, ICreateUserDto, IUpdateUserDto } from '../models/User.model';
import { IQueryResult, IListQueryResult, IPagination, IOrderBy } from '../types/base.types';

// SOLID: Interface Segregation Principle
export interface IUserService {
  // CRUD operasyonları
  createUser(dto: ICreateUserDto): Promise<IQueryResult<IUser>>;
  getUserById(id: string): Promise<IQueryResult<IUser>>;
  getAllUsers(): Promise<IListQueryResult<IUser>>;
  updateUser(id: string, dto: IUpdateUserDto): Promise<IQueryResult<IUser>>;
  deleteUser(id: string): Promise<IQueryResult<boolean>>;
  
  // İş mantığı metodları
  getUserByEmail(email: string): Promise<IQueryResult<IUser>>;
  getActiveUsers(): Promise<IListQueryResult<IUser>>;
  getUsersWithPagination(pagination: IPagination, orderBy?: IOrderBy): Promise<IListQueryResult<IUser>>;
  getUsersByAgeRange(minAge: number, maxAge: number): Promise<IListQueryResult<IUser>>;
  activateUser(id: string): Promise<IQueryResult<IUser>>;
  deactivateUser(id: string): Promise<IQueryResult<IUser>>;
  getTotalUserCount(): Promise<number>;
  getActiveUserCount(): Promise<number>;
  userExists(id: string): Promise<boolean>;
  emailExists(email: string): Promise<boolean>;
}


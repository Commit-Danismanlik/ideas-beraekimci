import { IQueryResult, IListQueryResult, IFilter, IOrderBy, IPagination } from '../types/base.types';

// Generic Repository Interface - SOLID: Interface Segregation Principle
export interface IRepository<T> {
  // Create
  create(data: Omit<T, 'id'>): Promise<IQueryResult<T>>;
  
  // Read
  getById(id: string): Promise<IQueryResult<T>>;
  getAll(): Promise<IListQueryResult<T>>;
  getByFilter(filters: IFilter[]): Promise<IListQueryResult<T>>;
  getWithPagination(pagination: IPagination, orderBy?: IOrderBy): Promise<IListQueryResult<T>>;
  
  // Update
  update(id: string, data: Partial<T>): Promise<IQueryResult<T>>;
  
  // Delete
  delete(id: string): Promise<IQueryResult<boolean>>;
  
  // Utility
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
  countByFilter(filters: IFilter[]): Promise<number>;
}


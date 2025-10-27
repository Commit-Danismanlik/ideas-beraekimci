// Temel veri tipleri ve interface'ler

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Firestore veri dönüşüm interface'i
export interface IFirestoreConverter<T> {
  toFirestore(data: T): Record<string, unknown>;
  fromFirestore(data: Record<string, unknown>): T;
}

// Query sonuç interface'i
export interface IQueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Liste sonuç interface'i
export interface IListQueryResult<T> {
  success: boolean;
  data: T[];
  error?: string;
  total: number;
}

// Pagination interface'i
export interface IPagination {
  page: number;
  limit: number;
}

// Filter interface'i
export interface IFilter {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains';
  value: unknown;
}

// Order interface'i
export interface IOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}


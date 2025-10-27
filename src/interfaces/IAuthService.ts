import { IAuthUser, IRegisterDto, ILoginDto, IAuthResult } from '../models/Auth.model';

export interface IAuthService {
  // Authentication metodları
  register(dto: IRegisterDto): Promise<IAuthResult>;
  login(dto: ILoginDto): Promise<IAuthResult>;
  logout(): Promise<IAuthResult>;
  getCurrentUser(): IAuthUser | null;
  
  // Observer
  onAuthStateChanged(callback: (user: IAuthUser | null) => void): () => void;
}


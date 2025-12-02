import { IAuthUser, IRegisterDto, ILoginDto, IAuthResult, IPasswordResetDto, IConfirmPasswordResetDto } from '../models/Auth.model';

export interface IAuthService {
  // Authentication metodları
  register(dto: IRegisterDto): Promise<IAuthResult>;
  login(dto: ILoginDto): Promise<IAuthResult>;
  logout(): Promise<IAuthResult>;
  getCurrentUser(): IAuthUser | null;
  
  // Password Reset metodları
  sendPasswordResetEmail(dto: IPasswordResetDto): Promise<IAuthResult>;
  confirmPasswordReset(dto: IConfirmPasswordResetDto): Promise<IAuthResult>;
  
  // Email Verification metodları
  sendEmailVerification(): Promise<IAuthResult>;
  
  // Observer
  onAuthStateChanged(callback: (user: IAuthUser | null) => void): () => void;
}


import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { IAuthUser, IRegisterDto, ILoginDto, IAuthResult } from '../models/Auth.model';

interface IAuthContext {
  user: IAuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (dto: IRegisterDto) => Promise<IAuthResult>;
  login: (dto: ILoginDto) => Promise<IAuthResult>;
  logout: () => Promise<IAuthResult>;
  clearError: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};


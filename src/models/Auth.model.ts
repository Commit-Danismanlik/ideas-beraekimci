// Auth User model
export interface IAuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
}

// Register DTO
export interface IRegisterDto {
  email: string;
  password: string;
  displayName?: string;
  birthDate?: Date;
}

// Login DTO
export interface ILoginDto {
  email: string;
  password: string;
}

// Auth Result
export interface IAuthResult {
  success: boolean;
  user?: IAuthUser;
  error?: string;
}

// Password Reset DTO
export interface IPasswordResetDto {
  email: string;
}

// Confirm Password Reset DTO
export interface IConfirmPasswordResetDto {
  oobCode: string;
  newPassword: string;
}


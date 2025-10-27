import { IBaseEntity } from '../types/base.types';

// User model interface
export interface IUser extends IBaseEntity {
  name: string;
  email: string;
  age?: number;
  birthDate?: Date;
  isActive: boolean;
}

// User oluşturma için DTO (Data Transfer Object)
export interface ICreateUserDto {
  name: string;
  email: string;
  age?: number;
  birthDate?: Date;
  isActive?: boolean;
}

// User güncelleme için DTO
export interface IUpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
  birthDate?: Date;
  isActive?: boolean;
}

// User model class
export class User implements IUser {
  public id: string;
  public name: string;
  public email: string;
  public age?: number;
  public birthDate?: Date;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: IUser) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.age = data.age;
    this.birthDate = data.birthDate;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  public getAge(): number | undefined {
    if (this.birthDate) {
      const today = new Date();
      const birthDate = new Date(this.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return undefined;
  }

  // Model metodları
  public getFullInfo(): string {
    return `${this.name} (${this.email})`;
  }

  public isAdult(): boolean {
    return this.age ? this.age >= 18 : false;
  }
}


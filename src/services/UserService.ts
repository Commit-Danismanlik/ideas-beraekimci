import { IUserService } from '../interfaces/IUserService';
import { UserRepository } from '../repositories/UserRepository';
import { IUser, ICreateUserDto, IUpdateUserDto } from '../models/User.model';
import { IQueryResult, IListQueryResult, IPagination, IOrderBy } from '../types/base.types';

// SOLID: Dependency Inversion Principle - Interface'e bağımlı
export class UserService implements IUserService {
  private userRepository: UserRepository;

  // Constructor'da interface kullanımı (UserRepository abstract BaseRepository'den türüyor)
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  // Create User
  public async createUser(dto: ICreateUserDto): Promise<IQueryResult<IUser>> {
    // Email validasyonu
    if (!this.isValidEmail(dto.email)) {
      return {
        success: false,
        error: 'Geçersiz email adresi',
      };
    }

    // Email benzersizlik kontrolü
    const emailExistsResult = await this.emailExists(dto.email);
    if (emailExistsResult) {
      return {
        success: false,
        error: 'Bu email adresi zaten kullanılıyor',
      };
    }

    // Varsayılan değerler
    const userData = {
      name: dto.name,
      email: dto.email,
      age: dto.age,
      isActive: dto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.userRepository.create(userData);
  }

  // Get User By Id
  public async getUserById(id: string): Promise<IQueryResult<IUser>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Geçersiz kullanıcı ID',
      };
    }
    return this.userRepository.getById(id);
  }

  // Get All Users
  public async getAllUsers(): Promise<IListQueryResult<IUser>> {
    return this.userRepository.getAll();
  }

  // Update User
  public async updateUser(
    id: string,
    dto: IUpdateUserDto
  ): Promise<IQueryResult<IUser>> {
    // ID validasyonu
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: 'Geçersiz kullanıcı ID',
      };
    }

    // Kullanıcı varlık kontrolü
    const exists = await this.userRepository.exists(id);
    if (!exists) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı',
      };
    }

    // Email değiştiriliyorsa validasyon
    if (dto.email) {
      if (!this.isValidEmail(dto.email)) {
        return {
          success: false,
          error: 'Geçersiz email adresi',
        };
      }

      // Email benzersizlik kontrolü (kendisi hariç)
      const existingUsers = await this.userRepository.getByEmail(dto.email);
      if (existingUsers.success && existingUsers.data.length > 0) {
        const existingUser = existingUsers.data[0];
        if (existingUser.id !== id) {
          return {
            success: false,
            error: 'Bu email adresi zaten kullanılıyor',
          };
        }
      }
    }

    return this.userRepository.update(id, dto);
  }

  // Delete User
  public async deleteUser(id: string): Promise<IQueryResult<boolean>> {
    if (!id || id.trim() === '') {
      return {
        success: false,
        data: false,
        error: 'Geçersiz kullanıcı ID',
      };
    }

    const exists = await this.userRepository.exists(id);
    if (!exists) {
      return {
        success: false,
        data: false,
        error: 'Kullanıcı bulunamadı',
      };
    }

    return this.userRepository.delete(id);
  }

  // Get User By Email
  public async getUserByEmail(email: string): Promise<IQueryResult<IUser>> {
    if (!this.isValidEmail(email)) {
      return {
        success: false,
        error: 'Geçersiz email adresi',
      };
    }

    const result = await this.userRepository.getByEmail(email);
    if (!result.success || result.data.length === 0) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı',
      };
    }

    return {
      success: true,
      data: result.data[0],
    };
  }

  // Get Active Users
  public async getActiveUsers(): Promise<IListQueryResult<IUser>> {
    return this.userRepository.getActiveUsers();
  }

  // Get Users With Pagination
  public async getUsersWithPagination(
    pagination: IPagination,
    orderBy?: IOrderBy
  ): Promise<IListQueryResult<IUser>> {
    return this.userRepository.getWithPagination(pagination, orderBy);
  }

  // Get Users By Age Range
  public async getUsersByAgeRange(
    minAge: number,
    maxAge: number
  ): Promise<IListQueryResult<IUser>> {
    if (minAge < 0 || maxAge < 0 || minAge > maxAge) {
      return {
        success: false,
        data: [],
        error: 'Geçersiz yaş aralığı',
        total: 0,
      };
    }

    return this.userRepository.getUsersByAgeRange(minAge, maxAge);
  }

  // Activate User
  public async activateUser(id: string): Promise<IQueryResult<IUser>> {
    return this.updateUser(id, { isActive: true });
  }

  // Deactivate User
  public async deactivateUser(id: string): Promise<IQueryResult<IUser>> {
    return this.updateUser(id, { isActive: false });
  }

  // Get Total User Count
  public async getTotalUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  // Get Active User Count
  public async getActiveUserCount(): Promise<number> {
    return this.userRepository.countActiveUsers();
  }

  // User Exists
  public async userExists(id: string): Promise<boolean> {
    return this.userRepository.exists(id);
  }

  // Email Exists
  public async emailExists(email: string): Promise<boolean> {
    const result = await this.userRepository.getByEmail(email);
    return result.success && result.data.length > 0;
  }

  // Private helper metodları
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}


// SOLID: Single Responsibility Principle - Sadece password validasyonundan sorumlu
export class PasswordValidator {
  private static readonly MIN_LENGTH = 6;

  public static isValid(password: string): boolean {
    if (!password || typeof password !== 'string') {
      return false;
    }
    return password.length >= this.MIN_LENGTH;
  }

  public static validate(password: string): { valid: boolean; error?: string } {
    if (!password || password.trim() === '') {
      return { valid: false, error: 'Şifre boş olamaz' };
    }

    if (password.length < this.MIN_LENGTH) {
      return {
        valid: false,
        error: `Şifre en az ${this.MIN_LENGTH} karakter olmalıdır`,
      };
    }

    return { valid: true };
  }

  public static getMinLength(): number {
    return this.MIN_LENGTH;
  }
}


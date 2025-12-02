// SOLID: Single Responsibility Principle - Sadece email validasyonundan sorumlu
export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public static isValid(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return this.EMAIL_REGEX.test(email.trim());
  }

  public static validate(email: string): { valid: boolean; error?: string } {
    if (!email || email.trim() === '') {
      return { valid: false, error: 'Email adresi boş olamaz' };
    }

    if (!this.isValid(email)) {
      return { valid: false, error: 'Geçersiz email adresi formatı' };
    }

    return { valid: true };
  }
}


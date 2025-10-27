# Proje Mimarisi ve Tasarım Prensipleri

Bu doküman projenin mimari yapısını, tasarım desenlerini ve SOLID prensiplerine nasıl uyduğunu açıklar.

## 📐 Mimari Genel Bakış

Proje, **Multilayer Architecture** (Çok Katmanlı Mimari) yaklaşımı ile tasarlanmıştır:

```
┌─────────────────────────────────────────┐
│     Presentation Layer (React)          │
│   (Components, Hooks)                   │
├─────────────────────────────────────────┤
│     Service Layer                       │
│   (Business Logic, Validation)          │
├─────────────────────────────────────────┤
│     Repository Layer                    │
│   (Data Access, CRUD Operations)        │
├─────────────────────────────────────────┤
│     Data Layer (Firestore)              │
└─────────────────────────────────────────┘
```

## 🏗️ Katman Detayları

### 1. Config Layer (Konfigürasyon Katmanı)

**Konum:** `src/config/`

**Sorumluluk:**
- Firebase başlatma ve yapılandırma
- Singleton pattern ile instance yönetimi
- Environment variable yönetimi

**Dosyalar:**
```typescript
src/config/
└── firebase.config.ts    // Firebase singleton service
```

**Örnek:**
```typescript
const db = getFirestoreDb(); // Singleton instance
```

### 2. Model Layer (Model Katmanı)

**Konum:** `src/models/`, `src/types/`, `src/interfaces/`

**Sorumluluk:**
- Domain modellerinin tanımlanması
- Data Transfer Objects (DTO)
- Type safety ve validation
- Interface tanımlamaları

**Dosyalar:**
```typescript
src/models/
└── User.model.ts         // IUser, ICreateUserDto, IUpdateUserDto, User class

src/types/
└── base.types.ts         // IBaseEntity, IQueryResult, IFilter, vb.

src/interfaces/
├── IRepository.ts        // Generic repository interface
└── IUserService.ts       // User service interface
```

**Neden böyle?**
- Type safety sağlar
- Validasyon kurallarını merkezi tutar
- DTO'lar ile API ve domain modellerini ayırır

### 3. Repository Layer (Veri Erişim Katmanı)

**Konum:** `src/repositories/`

**Sorumluluk:**
- Firestore CRUD operasyonları
- Veri dönüşümleri (toFirestore/fromFirestore)
- Query oluşturma ve yürütme
- Her query için ayrı metod

**Dosyalar:**
```typescript
src/repositories/
├── BaseRepository.ts     // Generic base repository (abstract)
└── UserRepository.ts     // User-specific repository
```

**Repository Pattern Avantajları:**
- Data access logic'i iş mantığından ayrılır
- Test edilebilirlik artar
- Database değişikliklerinde kolaylık
- Query'lerin merkezi yönetimi

**Örnek:**
```typescript
// BaseRepository - Generic, tüm entity'ler için temel
export abstract class BaseRepository<T extends IBaseEntity> {
  protected abstract toFirestore(data: Partial<T>): DocumentData;
  protected abstract fromFirestore(data: DocumentData): T;
  
  public async create(data: Omit<T, 'id'>): Promise<IQueryResult<T>> { }
  public async getById(id: string): Promise<IQueryResult<T>> { }
  // ... diğer CRUD metodları
}

// UserRepository - User-specific implementation
export class UserRepository extends BaseRepository<IUser> {
  constructor(firestore: Firestore) {
    super('users', firestore);
  }
  
  // Custom queries
  public async getByEmail(email: string) { }
  public async getActiveUsers() { }
}
```

### 4. Service Layer (İş Mantığı Katmanı)

**Konum:** `src/services/`

**Sorumluluk:**
- İş kurallarının uygulanması
- Validasyon
- Repository'leri koordine etme
- Complex operations

**Dosyalar:**
```typescript
src/services/
└── UserService.ts        // User business logic
```

**Service Layer Avantajları:**
- İş mantığı merkezi
- Repository'ler arası koordinasyon
- Tekrar kullanılabilir iş kuralları
- Test edilebilirlik

**Örnek:**
```typescript
export class UserService implements IUserService {
  private userRepository: UserRepository;
  
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  
  public async createUser(dto: ICreateUserDto) {
    // Validasyon
    if (!this.isValidEmail(dto.email)) {
      return { success: false, error: 'Geçersiz email' };
    }
    
    // Email benzersizlik kontrolü
    const exists = await this.emailExists(dto.email);
    if (exists) {
      return { success: false, error: 'Email zaten kullanılıyor' };
    }
    
    // Repository'yi çağır
    return this.userRepository.create(userData);
  }
}
```

### 5. Dependency Injection (DI) Container

**Konum:** `src/di/`

**Sorumluluk:**
- Service instance'larını yönetme
- Dependency injection (manuel, @injectable kullanmadan)
- Singleton pattern
- Lazy initialization

**Dosyalar:**
```typescript
src/di/
└── container.ts          // Service container
```

**Neden DI Container?**
- Loose coupling
- Test edilebilirlik
- Instance yönetimi
- SOLID: Dependency Inversion Principle

**Örnek:**
```typescript
export class ServiceContainer {
  private static instance: ServiceContainer;
  private userServiceInstance: IUserService | null = null;
  
  public getUserService(): IUserService {
    if (!this.userServiceInstance) {
      const userRepository = new UserRepository(this.firestore);
      this.userServiceInstance = new UserService(userRepository);
    }
    return this.userServiceInstance;
  }
}
```

### 6. Presentation Layer (Sunum Katmanı)

**Konum:** `src/components/`, `src/hooks/`

**Sorumluluk:**
- React components
- UI logic
- Custom hooks
- State management

**Dosyalar:**
```typescript
src/components/
├── UserList.tsx          // Kullanıcı listesi component
└── CreateUserForm.tsx    // Kullanıcı oluşturma formu

src/hooks/
└── useUserService.ts     // Custom hook for UserService
```

**Custom Hook Pattern:**
```typescript
export const useUserService = () => {
  const [userService] = useState<IUserService>(() => getUserService());
  const [loading, setLoading] = useState<boolean>(false);
  
  const createUser = useCallback(async (dto: ICreateUserDto) => {
    setLoading(true);
    const result = await userService.createUser(dto);
    setLoading(false);
    return result;
  }, [userService]);
  
  return { createUser, loading, ... };
};
```

## 🎯 SOLID Prensipleri

### 1. Single Responsibility Principle (SRP)

**Her sınıf tek bir sorumluluğa sahip:**

```typescript
// ✅ İYİ - Her sınıf tek sorumluluk
class UserRepository {
  // Sadece veri erişimi
}

class UserService {
  // Sadece iş mantığı
}

class UserList {
  // Sadece UI rendering
}

// ❌ KÖTÜ
class User {
  // Veri modeli + veri erişimi + iş mantığı + UI
  createUser() { }
  saveToDatabase() { }
  renderUI() { }
}
```

### 2. Open/Closed Principle (OCP)

**Genişlemeye açık, değişime kapalı:**

```typescript
// ✅ İYİ - BaseRepository genişletilebilir
abstract class BaseRepository<T> {
  public async create(data: T) { }
  public async getById(id: string) { }
  
  // Alt sınıflar implement etmeli
  protected abstract toFirestore(data: T): DocumentData;
  protected abstract fromFirestore(data: DocumentData): T;
}

// Yeni repository eklemek için BaseRepository'yi extend et
class ProductRepository extends BaseRepository<IProduct> {
  protected toFirestore(data: IProduct) { }
  protected fromFirestore(data: DocumentData) { }
  
  // Custom metodlar ekle
  public async getByCategory(category: string) { }
}
```

### 3. Liskov Substitution Principle (LSP)

**Alt sınıflar üst sınıfların yerine kullanılabilmeli:**

```typescript
// ✅ İYİ - UserRepository, BaseRepository yerine kullanılabilir
function processRepository<T>(repo: BaseRepository<T>) {
  const result = await repo.getAll();
  // UserRepository veya ProductRepository kullanılabilir
}

const userRepo = new UserRepository(db);
const productRepo = new ProductRepository(db);

processRepository(userRepo);      // ✅ Çalışır
processRepository(productRepo);   // ✅ Çalışır
```

### 4. Interface Segregation Principle (ISP)

**Küçük ve özel interface'ler:**

```typescript
// ✅ İYİ - Küçük, spesifik interface'ler
interface IRepository<T> {
  create(data: T): Promise<IQueryResult<T>>;
  getById(id: string): Promise<IQueryResult<T>>;
  // ... CRUD metodları
}

interface IUserService {
  createUser(dto: ICreateUserDto): Promise<IQueryResult<IUser>>;
  getUserById(id: string): Promise<IQueryResult<IUser>>;
  // ... User-specific metodlar
}

// ❌ KÖTÜ - Tek, büyük interface
interface IDataService {
  createUser(): void;
  updateUser(): void;
  createProduct(): void;
  updateProduct(): void;
  sendEmail(): void;
  uploadFile(): void;
  // ... çok fazla sorumluluk
}
```

### 5. Dependency Inversion Principle (DIP)

**Yüksek seviye modüller düşük seviye modüllere bağımlı olmamalı:**

```typescript
// ✅ İYİ - Service interface'e bağımlı
class UserService implements IUserService {
  constructor(private userRepository: UserRepository) {
    // Interface'e bağımlı (UserRepository, BaseRepository implement eder)
  }
}

// ❌ KÖTÜ - Concrete class'a bağımlı
class UserService {
  private db = getFirestore(); // Doğrudan Firestore'a bağımlı
  
  async createUser(data: User) {
    await addDoc(collection(this.db, 'users'), data); // Tight coupling
  }
}
```

## 📋 Design Patterns

### 1. Repository Pattern
- Veri erişim logic'ini soyutlar
- BaseRepository generic implementation

### 2. Singleton Pattern
- FirebaseService
- ServiceContainer

### 3. Dependency Injection
- Constructor injection
- Manuel DI (no @injectable)

### 4. Data Transfer Object (DTO)
- ICreateUserDto
- IUpdateUserDto

### 5. Factory Pattern
- ServiceContainer
- Service creation

## 🔄 Data Flow

```
User Interaction (Component)
    ↓
Custom Hook (useUserService)
    ↓
Service Layer (UserService)
    ↓ (validation, business logic)
Repository Layer (UserRepository)
    ↓ (data transformation)
Firestore Database
```

**Örnek Flow:**

```typescript
// 1. Component
const { createUser } = useUserService();
await createUser({ name: "Ahmet", email: "ahmet@test.com" });

// 2. Hook
const createUser = async (dto) => {
  return await userService.createUser(dto);
};

// 3. Service (Validation)
async createUser(dto) {
  if (!this.isValidEmail(dto.email)) return error;
  return this.userRepository.create(userData);
}

// 4. Repository (Data Access)
async create(data) {
  const firestoreData = this.toFirestore(data);
  const docRef = await addDoc(collection, firestoreData);
  return this.fromFirestore(docRef);
}
```

## ✅ Kod Kalite Kuralları

### 1. No Any Type
```typescript
// ✅ İYİ
function processUser(user: IUser): IQueryResult<IUser> { }

// ❌ KÖTÜ
function processUser(user: any): any { }
```

### 2. Access Modifiers
```typescript
// ✅ İYİ
class UserService {
  private userRepository: UserRepository;    // private
  public async createUser() { }              // public
  protected validateEmail() { }              // protected
}
```

### 3. Return Types
```typescript
// ✅ İYİ
public async getUser(id: string): Promise<IQueryResult<IUser>> { }

// ❌ KÖTÜ
public async getUser(id: string) { }  // Return type eksik
```

### 4. Interface Usage
```typescript
// ✅ İYİ
constructor(private service: IUserService) { }

// ❌ KÖTÜ
constructor(private service: UserService) { }  // Concrete class
```

## 🧪 Testing Strategy

### Unit Tests
- Service layer metodları
- Repository metodları
- Validation logic

### Integration Tests
- Service + Repository
- Complete data flow

### E2E Tests
- User interactions
- Full application flow

## 📚 Yeni Feature Ekleme

### Örnek: Product Entity Eklemek

```typescript
// 1. Model (src/models/Product.model.ts)
export interface IProduct extends IBaseEntity {
  name: string;
  price: number;
  stock: number;
}

// 2. Repository (src/repositories/ProductRepository.ts)
export class ProductRepository extends BaseRepository<IProduct> {
  constructor(firestore: Firestore) {
    super('products', firestore);
  }
  
  protected toFirestore(data: Partial<IProduct>): DocumentData { }
  protected fromFirestore(data: DocumentData): IProduct { }
  
  // Custom queries
  public async getByPriceRange(min: number, max: number) { }
}

// 3. Service Interface (src/interfaces/IProductService.ts)
export interface IProductService {
  createProduct(dto: ICreateProductDto): Promise<IQueryResult<IProduct>>;
  // ... diğer metodlar
}

// 4. Service (src/services/ProductService.ts)
export class ProductService implements IProductService {
  constructor(private productRepository: ProductRepository) { }
  
  public async createProduct(dto: ICreateProductDto) {
    // Validation
    if (dto.price < 0) return { success: false, error: 'Invalid price' };
    
    // Business logic
    return this.productRepository.create(dto);
  }
}

// 5. Container (src/di/container.ts)
public getProductService(): IProductService {
  if (!this.productServiceInstance) {
    const repo = new ProductRepository(this.firestore);
    this.productServiceInstance = new ProductService(repo);
  }
  return this.productServiceInstance;
}

// 6. Hook (src/hooks/useProductService.ts)
export const useProductService = () => {
  const [productService] = useState(() => getProductService());
  
  const createProduct = useCallback(async (dto: ICreateProductDto) => {
    return await productService.createProduct(dto);
  }, [productService]);
  
  return { createProduct };
};

// 7. Component (src/components/ProductList.tsx)
export const ProductList = () => {
  const { getAllProducts } = useProductService();
  // ... component logic
};
```

## 🎓 Best Practices

1. **Her zaman interface kullan**
2. **Any tipinden kaçın**
3. **Access modifiers ekle**
4. **Return type belirt**
5. **Her query için ayrı metod**
6. **Service layer'da validation**
7. **Repository layer'da sadece veri erişimi**
8. **DTO kullan**
9. **Error handling yap**
10. **Documentation ekle**

## 🔗 İlgili Dosyalar

- `README.md` - Genel proje bilgisi
- `FIREBASE_SETUP.md` - Firebase kurulum rehberi
- `firebase.env.example` - Environment variables örneği


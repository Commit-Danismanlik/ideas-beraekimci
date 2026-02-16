# Bir Fikrim Var

React + Vite + Tailwind CSS + Firebase (Firestore + Authentication) ile geliştirilmiş, SOLID prensiplerine uygun, multilayer mimariye sahip modern bir takım yönetim ve task tracking sistemi.

## 🎯 Özellikler

### Temel Özellikler
- 🔐 **Firebase Authentication** - Email/Password ile giriş ve kayıt
- 👥 **Takım Yönetimi** - Takım oluşturma, katılma ve yönetme
- ✅ **Task Tracking** - Görev takibi ve yönetimi
- 📦 **Repository** - (Yakında eklenecek)

### Teknik Özellikler
- ⚡️ **Vite** - Hızlı geliştirme ve build
- ⚛️ **React 18** - Modern React özellikleri
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📦 **TypeScript** - Tip güvenliği (No Any!)
- 🔥 **Firebase Firestore** - NoSQL veritabanı
- 🔒 **Firebase Authentication** - Kullanıcı yönetimi
- 🏗️ **Multilayer Architecture** - Repository, Service, Controller pattern
- 💉 **Dependency Injection** - Manuel DI container (No @injectable)
- ✨ **SOLID Principles** - Clean code prensipleri
- 🛣️ **React Router** - Sayfa yönlendirme ve protected routes

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Firebase Konfigürasyonu

**ÖNEMLİ:** Projenizde bir `.env` dosyası oluşturun ve Firebase bilgilerinizi ekleyin:

```bash
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain-here
VITE_FIREBASE_PROJECT_ID=your-project-id-here
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket-here
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id-here
VITE_FIREBASE_APP_ID=your-app-id-here
```

### 3. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Yeni bir proje oluşturun
3. **Firestore Database'i etkinleştirin** (Test mode'da başlatabilirsiniz)
4. **Authentication'ı etkinleştirin**:
   - Authentication > Sign-in method
   - Email/Password'ü enable edin
5. Web uygulaması ekleyin ve konfigürasyon bilgilerini alın
6. Bu bilgileri `.env` dosyanıza ekleyin


## 💻 Geliştirme

Geliştirme sunucusunu başlatmak için:

```bash
npm run dev
```


## 🎮 Kullanım

### İlk Kullanım

1. Uygulamayı açın (`http://localhost:5173`)
2. **Kayıt Ol** sayfasından yeni hesap oluşturun
3. Kayıt sonrası otomatik olarak giriş yapılacak ve Dashboard'a yönlendirileceksiniz
4. İlk girişte "Herhangi bir takımda değilsin" uyarısı göreceksiniz
5. **Takım Oluştur** veya **Takıma Katıl** butonlarından birini seçin

### Takım Oluşturma

1. Dashboard'da "Takım Oluştur" butonuna tıklayın
2. Takım adı ve açıklama girin
3. Takım ID'nizi diğer kullanıcılarla paylaşabilirsiniz

### Takıma Katılma

1. Dashboard'da "Takıma Katıl" butonuna tıklayın
2. Size verilen Takım ID'sini girin
3. Takıma katılın

### Dashboard Kullanımı

Dashboard'da iki ana bölüm bulunur:

**📦 Repositories**
- Yakında eklenecek

**✅ Tasks**
- Takımınıza ait görevleri görüntüleyin
- Görev durumlarını takip edin (Yapılacak, Devam Ediyor, Tamamlandı)
- Öncelik seviyelerini görün (Düşük, Orta, Yüksek)

## 📦 Build

Projeyi production için derlemek için:

```bash
npm run build
```

## 🔍 Lint

Kod kalitesini kontrol etmek için:

```bash
npm run lint
```

## 👁️ Preview

Build edilmiş projeyi önizlemek için:

```bash
npm run preview
```

## 🏗️ Mimari Prensipleri

### SOLID Prensipleri

- **Single Responsibility**: Her sınıf tek bir sorumluluğa sahip
- **Open/Closed**: Genişlemeye açık, değişime kapalı (BaseRepository)
- **Liskov Substitution**: Alt sınıflar üst sınıfların yerine kullanılabilir
- **Interface Segregation**: Küçük ve özel interface'ler (IRepository, IUserService)
- **Dependency Inversion**: Interface'lere bağımlılık (Constructor injection)

### Multilayer Architecture

1. **Config Layer**: Uygulama ve Firebase konfigürasyonları
2. **Model Layer**: Domain modelleri ve veri transfer objeleri
3. **Repository Layer**: Veri erişim katmanı, CRUD operasyonları
4. **Service Layer**: İş mantığı ve validasyon
5. **Presentation Layer**: React components ve hooks

### Repository Pattern

- Generic BaseRepository sınıfı
- Her entity için özel repository (UserRepository)
- Her query için ayrı metod
- Type-safe veri dönüşümleri

### Dependency Injection

- @injectable kullanmadan manuel DI
- ServiceContainer singleton pattern
- Constructor'da interface kullanımı
- Lazy initialization

## 🛠️ Teknolojiler

- **React 18** - UI kütüphanesi
- **Vite 5** - Build tool
- **Tailwind CSS 3** - CSS framework
- **TypeScript 5** - Type safety
- **Firebase 11** - Backend as a Service
- **Firestore** - NoSQL database
- **ESLint** - Code linting

## 📝 Kullanım Örneği

### Yeni Bir Entity Eklemek

1. **Model oluşturun** (`src/models/Product.model.ts`):
```typescript
export interface IProduct extends IBaseEntity {
  name: string;
  price: number;
}
```

2. **Repository oluşturun** (`src/repositories/ProductRepository.ts`):
```typescript
export class ProductRepository extends BaseRepository<IProduct> {
  constructor(firestore: Firestore) {
    super('products', firestore);
  }
  
  protected toFirestore(data: Partial<IProduct>): DocumentData { ... }
  protected fromFirestore(data: DocumentData): IProduct { ... }
}
```

3. **Service interface'i oluşturun** (`src/interfaces/IProductService.ts`)

4. **Service oluşturun** (`src/services/ProductService.ts`)

5. **Container'a ekleyin** (`src/di/container.ts`)

6. **Hook oluşturun** (`src/hooks/useProductService.ts`)


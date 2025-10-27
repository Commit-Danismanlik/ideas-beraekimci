# Firebase Firestore Kurulum Rehberi

Bu doküman, projenizde Firebase Firestore'u nasıl kuracağınızı adım adım anlatır.

## 1. Firebase Projesi Oluşturma

### Adım 1: Firebase Console'a Giriş
1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Google hesabınızla giriş yapın

### Adım 2: Yeni Proje Oluşturma
1. "Proje Ekle" veya "Add Project" butonuna tıklayın
2. Proje adını girin (örn: "bir-fikrim-var")
3. Google Analytics'i etkinleştirmek isteyip istemediğinizi seçin (opsiyonel)
4. "Proje Oluştur" butonuna tıklayın

## 2. Firebase Authentication Kurulumu

### Adım 1: Authentication'ı Etkinleştirme
1. Sol menüden "Authentication" seçeneğine tıklayın
2. "Get started" veya "Başla" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" seçeneğini bulun ve tıklayın
5. "Enable" veya "Etkinleştir" toggle'ını açın
6. "Save" veya "Kaydet" butonuna tıklayın

**Not:** Email link (passwordless sign-in) seçeneğini etkinleştirmenize gerek yok.

## 3. Firestore Database Kurulumu

### Adım 1: Firestore'u Etkinleştirme
1. Sol menüden "Firestore Database" seçeneğine tıklayın
2. "Veritabanı Oluştur" veya "Create Database" butonuna tıklayın

### Adım 2: Güvenlik Kurallarını Seçme
İki seçenek sunulacak:

**Test Modu (Geliştirme için):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 12, 31);
    }
  }
}
```

**Production Modu (Canlı ortam için):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Öneri:** Geliştirme aşamasında Test Modu'nu seçin.

### Adım 3: Konum Seçimi
- Veritabanınızın fiziksel konumunu seçin (örn: `europe-west3`)
- "Etkinleştir" veya "Enable" butonuna tıklayın

## 4. Web Uygulaması Ekleme

### Adım 1: Web App Oluşturma
1. Proje ayarlarına gidin (⚙️ ikonu)
2. "Genel" veya "General" sekmesine tıklayın
3. "Uygulamalarınız" bölümünde web ikonu (`</>`) tıklayın

### Adım 2: Uygulama Bilgilerini Girme
1. Uygulama için bir takma ad girin (örn: "web-app")
2. Firebase Hosting'i etkinleştirmek isteyip istemediğinizi seçin (opsiyonel)
3. "Uygulamayı Kaydet" butonuna tıklayın

### Adım 3: Konfigürasyon Bilgilerini Kopyalama
Firebase size şöyle bir konfigürasyon verecek:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## 5. .env Dosyasını Yapılandırma

### Adım 1: .env Dosyası Oluşturma
Proje kök dizininde `.env` dosyası oluşturun:

```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

**Önemli:** 
- `.env` dosyası `.gitignore`'a eklenmiştir ve git'e yüklenmeyecektir
- `VITE_` prefix'i Vite tarafından gereklidir
- Değerleri Firebase Console'dan aldığınız bilgilerle değiştirin

### Adım 2: .env Dosyasını Doğrulama
Dosyanın doğru oluşturulduğundan emin olun:
```bash
# Windows
type .env

# Linux/Mac
cat .env
```

## 6. Firestore Güvenlik Kurallarını Güncelleme

Geliştirme sonrasında, production için güvenlik kurallarını güncellemeyi unutmayın:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users koleksiyonu için kurallar
    match /users/{userId} {
      allow read: if true;  // Herkes okuyabilir
      allow create: if true;  // Herkes oluşturabilir
      allow update, delete: if request.auth != null;  // Sadece authenticated kullanıcılar
    }
  }
}
```

## 7. Test Etme

### Adım 1: Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```

### Adım 2: Uygulamayı Açma
Tarayıcınızda `http://localhost:5173` adresini açın

### Adım 3: Kullanıcı Oluşturma
1. Sol taraftaki formu doldurun
2. "Kullanıcı Oluştur" butonuna tıklayın
3. Sağ tarafta kullanıcının listelendiğini görmelisiniz

### Adım 4: Firebase Console'dan Doğrulama
1. Firebase Console'a gidin
2. Firestore Database'e tıklayın
3. `users` koleksiyonunu görmelisiniz
4. İçinde oluşturduğunuz kullanıcılar olmalı

## 8. Sorun Giderme

### Hata: "Firebase: Firebase App named '[DEFAULT]' already exists"
**Çözüm:** Tarayıcıyı yenileyin veya cache'i temizleyin

### Hata: "Missing or insufficient permissions"
**Çözüm:** Firestore güvenlik kurallarını kontrol edin ve Test Modu'nda olduğundan emin olun

### Hata: ".env dosyası okunmuyor"
**Çözüm:** 
1. `.env` dosyasının proje kök dizininde olduğundan emin olun
2. Tüm değişkenlerin `VITE_` prefix'i ile başladığından emin olun
3. Sunucuyu yeniden başlatın (`Ctrl+C` ve `npm run dev`)

### Hata: "Network request failed"
**Çözüm:**
1. İnternet bağlantınızı kontrol edin
2. Firebase proje ID'sinin doğru olduğundan emin olun
3. Firebase Console'da projenin aktif olduğunu kontrol edin

## 9. Koleksiyonlar ve İndeksler

### Koleksiyon Yapısı
Projede `users` koleksiyonu kullanılmaktadır:

```
users/
  ├── {userId1}/
  │   ├── id: string
  │   ├── name: string
  │   ├── email: string
  │   ├── age: number
  │   ├── isActive: boolean
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
```

### İndeks Ekleme
Bazı sorgular için indeks gerekebilir. Firebase Console'da hata mesajı alırsanız:

1. Hata mesajındaki link'e tıklayın
2. Otomatik olarak indeks oluşturulacaktır
3. İndeks hazır olana kadar bekleyin (genellikle birkaç dakika)

## 10. Ek Notlar

### Güvenlik
- Production'da mutlaka güvenlik kurallarını güncelleyin
- API key'leri asla git'e commit etmeyin
- `.env` dosyası `.gitignore`'a eklenmiştir

### Maliyet
- Firestore ücretsiz kotası: 50,000 read/20,000 write/day
- Detaylı fiyatlandırma: [Firebase Pricing](https://firebase.google.com/pricing)

### Yedekleme
- Firebase Console'dan otomatik yedekleme ayarlayabilirsiniz
- Export/Import işlemleri için Firebase CLI kullanabilirsiniz

## 11. Yararlı Linkler

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

## Destek

Sorun yaşarsanız:
1. Firebase Console'da Logs bölümünü kontrol edin
2. Tarayıcı Console'unu kontrol edin (F12)
3. `.env` dosyasının doğru olduğundan emin olun
4. Firestore güvenlik kurallarını kontrol edin


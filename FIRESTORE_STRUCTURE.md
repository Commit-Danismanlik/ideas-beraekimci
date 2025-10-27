# Firestore Database Yapısı

Bu doküman projenin Firestore veritabanı yapısını detaylı olarak açıklar.

## 📊 Collection Hiyerarşisi

```
Firestore Root
├── teams (Collection)
│   └── {teamId} (Document)
│       ├── Fields:
│       │   ├── id: string
│       │   ├── name: string
│       │   ├── description?: string
│       │   ├── ownerId: string
│       │   ├── memberCount: number
│       │   ├── isActive: boolean
│       │   ├── members: string[] (User ID array)
│       │   ├── taskIds: string[] (Task ID array)
│       │   ├── noteIds: string[] (Note ID array)
│       │   ├── todoIds: string[] (Todo ID array)
│       │   ├── createdAt: timestamp
│       │   └── updatedAt: timestamp
│       │
│       ├── tasks (Subcollection)
│       │   └── {taskId} (Document)
│       │       ├── id: string
│       │       ├── title: string
│       │       ├── description?: string
│       │       ├── assignedTo?: string (User ID)
│       │       ├── status: 'todo' | 'in-progress' | 'done'
│       │       ├── priority: 'low' | 'medium' | 'high'
│       │       ├── finishedAt?: timestamp
│       │       ├── createdAt: timestamp
│       │       └── updatedAt: timestamp
│       │
│       ├── notes (Subcollection)
│       │   └── {noteId} (Document)
│       │       ├── id: string
│       │       ├── title: string
│       │       ├── content: string
│       │       ├── category?: string
│       │       ├── tags?: string[]
│       │       ├── isPinned: boolean
│       │       ├── createdBy: string (User ID)
│       │       ├── createdAt: timestamp
│       │       └── updatedAt: timestamp
│       │
│       ├── todos (Subcollection)
│       │   └── {todoId} (Document)
│       │       ├── id: string
│       │       ├── title: string
│       │       ├── description?: string
│       │       ├── createdBy: string (User ID)
│       │       ├── assignedTo?: string (User ID)
│       │       ├── completed: boolean
│       │       ├── priority: 'low' | 'medium' | 'high'
│       │       ├── dueDate?: timestamp
│       │       ├── createdAt: timestamp
│       │       └── updatedAt: timestamp
│       │
│       ├── roles (Subcollection)
│       │   └── {roleId} (Document)
│       │       ├── id: string
│       │       ├── name: string
│       │       ├── permissions: Permission[]
│       │       ├── isCustom: boolean
│       │       ├── isDefault: boolean
│       │       ├── createdAt: timestamp
│       │       └── updatedAt: timestamp
│       │
│       └── members (Subcollection)
│           └── {memberId} (Document)
│               ├── id: string
│               ├── userId: string
│               ├── roleId: string
│               ├── addedBy: string (User ID)
│               ├── addedAt: timestamp
│               ├── createdAt: timestamp
│               └── updatedAt: timestamp
│
├── personalNotes (Collection)
│   └── {noteId} (Document)
│       ├── id: string
│       ├── userId: string
│       ├── title: string
│       ├── content: string
│       ├── category?: string
│       ├── tags?: string[]
│       ├── isPinned: boolean
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── personalTodos (Collection)
│   └── {todoId} (Document)
│       ├── id: string
│       ├── userId: string
│       ├── title: string
│       ├── description?: string
│       ├── completed: boolean
│       ├── priority: 'low' | 'medium' | 'high'
│       ├── dueDate?: timestamp
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── users (Collection) - Kullanıcı bilgileri (opsiyonel)
    └── {userId} (Document)
        ├── id: string
        ├── name: string
        ├── email: string
        ├── age?: number
        ├── isActive: boolean
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

## 🎯 Tasarım Kararları

### 1. Subcollection Kullanımı

**Neden subcollection?**
- ✅ Takım verisi ile ilgili tüm data bir arada
- ✅ Daha organize yapı
- ✅ Query performansı (takım bazlı sorgular)
- ✅ Izolasyon (her takımın kendi data'sı)
- ✅ Security rules daha kolay

**Yol:** `teams/{teamId}/tasks/{taskId}`

### 2. ID Array'leri

**Ana team document'inde ID array'leri:**
```typescript
{
  members: ['userId1', 'userId2'],      // Hızlı üyelik kontrolü
  taskIds: ['taskId1', 'taskId2'],      // Task ID'leri
  noteIds: ['noteId1', 'noteId2'],      // Note ID'leri
  todoIds: ['todoId1', 'todoId2']       // Todo ID'leri
}
```

**Avantajları:**
- Hızlı sayma (tasks.length yerine taskIds.length)
- Hızlı varlık kontrolü (array.includes())
- Ana document'ten özet bilgi

### 3. Dual Storage (Array + Subcollection)

**Task Örneği:**
```typescript
// Ana team document
team.taskIds = ['task1', 'task2', 'task3']  // ID referansları

// Subcollection
teams/{teamId}/tasks/task1  // Gerçek task verisi
teams/{teamId}/tasks/task2
teams/{teamId}/tasks/task3
```

**Neden her ikisi de?**
- Array: Hızlı count ve ID listesi
- Subcollection: Detaylı veri ve query

## 🔍 Query Örnekleri

### Team Tasks Getirme
```typescript
// Tüm taskları getir
const tasks = await taskService.getTasksByTeam(teamId);

// Firestore query:
teams/{teamId}/tasks  // Tüm dokümanlar
```

### Status'a Göre Filtreleme
```typescript
const doneTasks = await taskService.getTasksByStatus(teamId, 'done');

// Firestore query:
teams/{teamId}/tasks where status == 'done'
```

### Kullanıcıya Atanmış Tasklar
```typescript
const myTasks = await taskService.getTasksByAssignee(teamId, userId);

// Firestore query:
teams/{teamId}/tasks where assignedTo == userId
```

## 🔒 Security Rules Örneği

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Teams collection
    match /teams/{teamId} {
      // Herkes okuyabilir
      allow read: if true;
      
      // Sadece authenticated kullanıcılar oluşturabilir
      allow create: if request.auth != null;
      
      // Sadece owner veya admin düzenleyebilir
      allow update: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.members);
      
      // Tasks subcollection
      match /tasks/{taskId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
      }
      
      // Notes subcollection
      match /notes/{noteId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
      }
      
      // Todos subcollection
      match /todos/{todoId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
      }
      
      // Roles subcollection
      match /roles/{roleId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow write: if request.auth.uid == get(/databases/$(database)/documents/teams/$(teamId)).data.ownerId;
      }
      
      // Members subcollection
      match /members/{memberId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
        allow write: if request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.members;
      }
    }
    
    // Personal Notes
    match /personalNotes/{noteId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Personal Todos
    match /personalTodos/{todoId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

## 💾 Data Flow

### Task Oluşturma
```typescript
1. TaskService.createTask(dto)
2. TaskRepository.create(teamId, taskData)
   └── Firestore: teams/{teamId}/tasks/{newTaskId}
3. TeamRepository.update(teamId, { taskIds: [...oldIds, newTaskId] })
   └── Firestore: teams/{teamId}.taskIds array'ine ekle
4. Return task
```

### Task Silme
```typescript
1. TaskService.deleteTask(teamId, taskId)
2. TaskRepository.delete(teamId, taskId)
   └── Firestore: teams/{teamId}/tasks/{taskId} sil
3. TeamRepository.update(teamId, { taskIds: filteredIds })
   └── Firestore: teams/{teamId}.taskIds array'inden çıkar
4. Return success
```

## 📈 Performans Optimizasyonu

### Array Kullanımı
```typescript
// ❌ YAVAŞ - Subcollection query
const taskCount = (await getDocs(collection(db, 'teams', teamId, 'tasks'))).size;

// ✅ HIZLI - Array length
const taskCount = team.taskIds.length;
```

### Üyelik Kontrolü
```typescript
// ❌ YAVAŞ - Subcollection query
const members = await getDocs(collection(db, 'teams', teamId, 'members'));
const isMember = members.docs.some(doc => doc.data().userId === userId);

// ✅ HIZLI - Array includes
const isMember = team.members.includes(userId);
```

## 🎓 Best Practices

### 1. ID Senkronizasyonu
- Task eklendiğinde hem subcollection'a hem de taskIds array'ine ekle
- Task silindiğinde her ikisinden de sil

### 2. Array Limitleri
- Firestore array limiti: 1,000,000 elements
- Pratik limit: 10,000 - 20,000 (performans için)
- Daha fazla veri için pagination kullan

### 3. Transaction Kullanımı
```typescript
// Büyük operasyonlarda transaction kullan
const transaction = await runTransaction(db, async (t) => {
  // Task oluştur
  const taskRef = doc(collection(db, 'teams', teamId, 'tasks'));
  t.set(taskRef, taskData);
  
  // TaskIds array'ine ekle
  const teamRef = doc(db, 'teams', teamId);
  t.update(teamRef, {
    taskIds: arrayUnion(taskRef.id)
  });
});
```

## 🔄 Migration (Eski yapıdan yeniye)

Eğer eski flat collection yapısı varsa:

```typescript
// Eski: tasks (collection)
// Yeni: teams/{teamId}/tasks (subcollection)

// Migration script
async function migrateToSubcollections() {
  const oldTasks = await getDocs(collection(db, 'tasks'));
  
  for (const taskDoc of oldTasks.docs) {
    const task = taskDoc.data();
    
    // Yeni subcollection'a ekle
    await addDoc(
      collection(db, 'teams', task.teamId, 'tasks'),
      {
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }
    );
    
    // Eski task'ı sil
    await deleteDoc(taskDoc.ref);
  }
}
```

## 📝 Notlar

1. **Subcollection Avantajları:**
   - Organize yapı
   - Kolay data management
   - Security rules basitleşir
   - Team-scoped queries

2. **ID Array Avantajları:**
   - Hızlı count
   - Hızlı membership kontrolü
   - Özet bilgi

3. **Trade-offs:**
   - Array sync gerekir (create/delete)
   - Çift yazma (performance overhead)
   - Array size limitleri

## 🚀 Kullanım

Tüm subcollection işlemleri otomatik olarak yönetiliyor:

```typescript
// Task oluştur
await taskService.createTask({
  teamId: 'team123',
  title: 'Yeni Task',
  priority: 'high'
});
// ✅ Otomatik olarak:
// - teams/team123/tasks/{newId} oluşturulur
// - teams/team123.taskIds array'ine eklenir

// Task sil
await taskService.deleteTask('team123', 'task456');
// ✅ Otomatik olarak:
// - teams/team123/tasks/task456 silinir
// - teams/team123.taskIds array'inden çıkarılır
```

## 🔗 İlgili Dosyalar

- `src/repositories/SubcollectionRepository.ts` - Generic subcollection repository
- `src/repositories/TaskRepository.ts` - Task subcollection
- `src/repositories/TeamNoteRepository.ts` - Note subcollection
- `src/repositories/TeamTodoRepository.ts` - Todo subcollection
- `src/repositories/RoleRepository.ts` - Role subcollection
- `src/repositories/TeamMemberRepository.ts` - Member subcollection


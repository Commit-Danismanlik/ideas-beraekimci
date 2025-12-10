import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from '../config/firebase.config';
import { IAuthService } from '../interfaces/IAuthService';
import { IChatBotService } from '../interfaces/IChatBotService';
import { IChatConversationService } from '../interfaces/IChatConversationService';
import { IPersonalNoteService, IPersonalTodoService } from '../interfaces/IPersonalRepositoryService';
import { IRoleService } from '../interfaces/IRoleService';
import { ITaskService } from '../interfaces/ITaskService';
import { ITeamNoteService, ITeamTodoService } from '../interfaces/ITeamRepositoryService';
import { ITeamService } from '../interfaces/ITeamService';
import { IUserService } from '../interfaces/IUserService';
import { ChatConversationRepository } from '../repositories/ChatConversationRepository';
import { PersonalNoteRepository } from '../repositories/PersonalNoteRepository';
import { PersonalTodoRepository } from '../repositories/PersonalTodoRepository';
import { RoleRepository } from '../repositories/RoleRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { TeamMemberRepository } from '../repositories/TeamMemberRepository';
import { TeamNoteRepository } from '../repositories/TeamNoteRepository';
import { TeamRepository } from '../repositories/TeamRepository';
import { TeamTodoRepository } from '../repositories/TeamTodoRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/AuthService';
import { ChatBotService } from '../services/ChatBotService';
import { ChatConversationService } from '../services/ChatConversationService';
import { PersonalNoteService } from '../services/PersonalNoteService';
import { PersonalTodoService } from '../services/PersonalTodoService';
import { RoleService } from '../services/RoleService';
import { TaskService } from '../services/TaskService';
import { TeamMemberInfoService } from '../services/TeamMemberInfoService';
import { TeamNoteService } from '../services/TeamNoteService';
import { TeamService } from '../services/TeamService';
import { TeamTodoService } from '../services/TeamTodoService';
import { UserService } from '../services/UserService';

// SOLID: Dependency Inversion Principle - Manuel DI Container
// @injectable kullanmadan, new ile instance oluşturma

export class ServiceContainer {
  private static instance: ServiceContainer;
  private firestore: Firestore;
  private auth: Auth;
  
  private userServiceInstance: IUserService | null = null;
  private authServiceInstance: IAuthService | null = null;
  private teamServiceInstance: ITeamService | null = null;
  private taskServiceInstance: ITaskService | null = null;
  private personalNoteServiceInstance: IPersonalNoteService | null = null;
  private personalTodoServiceInstance: IPersonalTodoService | null = null;
  private roleServiceInstance: IRoleService | null = null;
  private teamNoteServiceInstance: ITeamNoteService | null = null;
  private teamTodoServiceInstance: ITeamTodoService | null = null;
  private teamMemberInfoServiceInstance: TeamMemberInfoService | null = null;
  private chatBotServiceInstance: IChatBotService | null = null;
  private chatConversationServiceInstance: IChatConversationService | null = null;

  private constructor() {
    this.firestore = getFirestoreDb();
    this.auth = getFirebaseAuth();
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  // User Service - Lazy initialization
  public getUserService(): IUserService {
    if (!this.userServiceInstance) {
      const userRepository = new UserRepository(this.firestore);
      this.userServiceInstance = new UserService(userRepository);
    }
    return this.userServiceInstance;
  }

  // Auth Service - Lazy initialization
  public getAuthService(): IAuthService {
    if (!this.authServiceInstance) {
      const userService = this.getUserService();
      this.authServiceInstance = new AuthService(this.auth, userService);
    }
    return this.authServiceInstance;
  }

  // Role Service - Lazy initialization
  public getRoleService(): IRoleService {
    if (!this.roleServiceInstance) {
      const roleRepository = new RoleRepository(this.firestore);
      const teamMemberRepository = new TeamMemberRepository(this.firestore);
      this.roleServiceInstance = new RoleService(roleRepository, teamMemberRepository);
    }
    return this.roleServiceInstance;
  }

  // Team Service - Lazy initialization
  public getTeamService(): ITeamService {
    if (!this.teamServiceInstance) {
      const teamRepository = new TeamRepository(this.firestore);
      const teamMemberRepository = new TeamMemberRepository(this.firestore);
      const roleService = this.getRoleService();
      this.teamServiceInstance = new TeamService(teamRepository, teamMemberRepository, roleService);
    }
    return this.teamServiceInstance;
  }

  // Task Service - Lazy initialization
  public getTaskService(): ITaskService {
    if (!this.taskServiceInstance) {
      const taskRepository = new TaskRepository(this.firestore);
      const teamRepository = new TeamRepository(this.firestore);
      this.taskServiceInstance = new TaskService(taskRepository, teamRepository);
    }
    return this.taskServiceInstance;
  }

  // Personal Note Service - Lazy initialization
  public getPersonalNoteService(): IPersonalNoteService {
    if (!this.personalNoteServiceInstance) {
      const noteRepository = new PersonalNoteRepository(this.firestore);
      this.personalNoteServiceInstance = new PersonalNoteService(noteRepository);
    }
    return this.personalNoteServiceInstance;
  }

  // Personal Todo Service - Lazy initialization
  public getPersonalTodoService(): IPersonalTodoService {
    if (!this.personalTodoServiceInstance) {
      const todoRepository = new PersonalTodoRepository(this.firestore);
      this.personalTodoServiceInstance = new PersonalTodoService(todoRepository);
    }
    return this.personalTodoServiceInstance;
  }

  // Team Note Service - Lazy initialization
  public getTeamNoteService(): ITeamNoteService {
    if (!this.teamNoteServiceInstance) {
      const noteRepository = new TeamNoteRepository(this.firestore);
      const teamRepository = new TeamRepository(this.firestore);
      const roleService = this.getRoleService();
      this.teamNoteServiceInstance = new TeamNoteService(noteRepository, teamRepository, roleService);
    }
    return this.teamNoteServiceInstance;
  }

  // Team Todo Service - Lazy initialization
  public getTeamTodoService(): ITeamTodoService {
    if (!this.teamTodoServiceInstance) {
      const todoRepository = new TeamTodoRepository(this.firestore);
      const teamRepository = new TeamRepository(this.firestore);
      const roleService = this.getRoleService();
      this.teamTodoServiceInstance = new TeamTodoService(todoRepository, teamRepository, roleService);
    }
    return this.teamTodoServiceInstance;
  }

  // Team Member Info Service - Lazy initialization
  public getTeamMemberInfoService(): TeamMemberInfoService {
    if (!this.teamMemberInfoServiceInstance) {
      const teamMemberRepository = new TeamMemberRepository(this.firestore);
      const roleService = this.getRoleService();
      const userService = this.getUserService();
      this.teamMemberInfoServiceInstance = new TeamMemberInfoService(
        teamMemberRepository,
        roleService,
        userService,
        this.firestore
      );
    }
    return this.teamMemberInfoServiceInstance;
  }

  // ChatBot Service - Lazy initialization
  public getChatBotService(): IChatBotService {
    if (!this.chatBotServiceInstance) {
      const teamService = this.getTeamService();
      this.chatBotServiceInstance = new ChatBotService(teamService);
    }
    return this.chatBotServiceInstance;
  }

  // ChatConversation Service - Lazy initialization
  public getChatConversationService(): IChatConversationService {
    if (!this.chatConversationServiceInstance) {
      const conversationRepository = new ChatConversationRepository(this.firestore);
      this.chatConversationServiceInstance = new ChatConversationService(conversationRepository);
    }
    return this.chatConversationServiceInstance;
  }
}

// Helper fonksiyonlar - Kolay erişim için (alfabetik sırada)
export const getAuthService = (): IAuthService => {
  return ServiceContainer.getInstance().getAuthService();
};

export const getChatBotService = (): IChatBotService => {
  return ServiceContainer.getInstance().getChatBotService();
};

export const getChatConversationService = (): IChatConversationService => {
  return ServiceContainer.getInstance().getChatConversationService();
};

export const getPersonalNoteService = (): IPersonalNoteService => {
  return ServiceContainer.getInstance().getPersonalNoteService();
};

export const getPersonalTodoService = (): IPersonalTodoService => {
  return ServiceContainer.getInstance().getPersonalTodoService();
};

export const getRoleService = (): IRoleService => {
  return ServiceContainer.getInstance().getRoleService();
};

export const getTaskService = (): ITaskService => {
  return ServiceContainer.getInstance().getTaskService();
};

export const getTeamMemberInfoService = (): TeamMemberInfoService => {
  return ServiceContainer.getInstance().getTeamMemberInfoService();
};

export const getTeamNoteService = (): ITeamNoteService => {
  return ServiceContainer.getInstance().getTeamNoteService();
};

export const getTeamService = (): ITeamService => {
  return ServiceContainer.getInstance().getTeamService();
};

export const getTeamTodoService = (): ITeamTodoService => {
  return ServiceContainer.getInstance().getTeamTodoService();
};

export const getUserService = (): IUserService => {
  return ServiceContainer.getInstance().getUserService();
};


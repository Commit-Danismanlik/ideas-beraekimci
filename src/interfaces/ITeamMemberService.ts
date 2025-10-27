import { IListQueryResult } from '../types/base.types';

// Team Member bilgilerini getirmek için service interface
export interface ITeamMemberInfo {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  roleId: string;
  roleName: string;
}

export interface ITeamMemberService {
  getTeamMembersWithDetails(teamId: string): Promise<IListQueryResult<ITeamMemberInfo>>;
}


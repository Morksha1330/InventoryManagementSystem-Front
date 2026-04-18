// src/app/models/employee.model.ts
export interface User {
  status: any;
  id: number;
  name: string;
  email: string;
  phone: string;
  username:string;
  active: string;
  roleId?: number;
  role : string
  epF_No?: string;
}

export interface AddUserDto {
  id?: number;
  name: string;
  username: string;
  email: string;
  epf_No?: string;
  roleId?: number;
  active?: boolean;
  password?: string;
}

export interface RoleOption {
  label: string;
  value: number | null;
}
 
export interface StatusOption {
  label: string;
  value: boolean | null;
}

export interface UserFilterDto {
  searchTerm?: string;
  roleId?: number;
  active?: boolean;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface PagedUsersResponse {
  success: boolean;
  responsCode: number;
  message: string;
  data: User[];
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface Role {
  id: number;
  name: string;
}
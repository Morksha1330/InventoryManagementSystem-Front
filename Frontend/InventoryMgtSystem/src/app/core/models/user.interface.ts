// src/app/models/employee.model.ts
export interface User {
status: any;
  id: number;
  name: string;
  email: string;
  phone: string;
  username:string;
  active: string;
  role : string
}

export interface AddUserDto {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  id? : number;
}
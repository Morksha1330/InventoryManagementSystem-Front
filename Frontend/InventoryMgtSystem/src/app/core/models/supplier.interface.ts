// src/app/core/models/supplier.interface.ts

export interface SupplierDto {
  id: number;
  supplierName: string;
  supplierEmail: string;
  address: string;
  phoneNumber: string;
  active: boolean;
}

export interface SupplierFilterDto {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  active?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface SupplierStatusOption {
  label: string;
  value: boolean | null;
}
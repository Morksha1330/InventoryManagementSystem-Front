// export interface Product {
//     id: number;
//     status: any;
//     product: string;
//     categoryId: number;
//     SKU: string;
//     UnitPrice: number;
//     Totalquantity: number;
// }

// src/app/core/models/product.interface.ts

export interface ProductDTO {
  id: number;
  sku: string;
  productName: string;
  categoryId: number;
  categoryName: string;
  totalQuantity: number;
  unitPrice: number;
  active: boolean;
  createdDate?: string;
}

export interface ProductFilterDto {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  categoryId?: number;
  active?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface CategoryOption {
  label: string;
  value: number | null;
}

export interface StatusOption {
  label: string;
  value: boolean | null;
}
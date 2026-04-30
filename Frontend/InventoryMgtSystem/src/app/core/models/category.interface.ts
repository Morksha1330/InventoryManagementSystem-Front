export interface CategoryDTO {
  id: number;
  categoryCode: string;
  categoryName: string;
  description: string;
  active: boolean;
  createdDate?: Date | string;
  productCount: number;
  subCategoryCount: number;
}

export interface CategoryFilterDto {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  active?: boolean;
  sortBy?: string;
  sortOrder?: string;
}
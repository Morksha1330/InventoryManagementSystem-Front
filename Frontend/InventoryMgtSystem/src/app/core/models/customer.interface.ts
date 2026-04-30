export interface CustomerDto {
  id: number;
  customerName: string;
  customerEmail: string;
  address: string;
  phoneNumber: string;
  active: boolean;
}

export interface CustomerFilterDto {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  active?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface StatusOption {
  label: string;
  value: boolean | null;
}
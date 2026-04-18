export interface DashboardKpi {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalExpense: number;
  totalSales: number;
}
 
export interface TopSellingProduct {
  productId: number;
  productName: string;
  categoryName: string;
  totalUnitsSold: number;
  totalRevenue: number;
}
 
export interface SalesTrend {
  trendDate: string;
  dayName: string;
  dailySales: number;
  dailyExpense: number;
}
 
export interface LowStockItem {
  productId: number;
  productName: string;
  categoryName: string;
  sku: string;
  quantityInStock: number;
  unitPrice: number;
}
 
export interface RecentUser {
  id: number;
  name: string;
  username: string;
  email: string;
  epf_No: string;
  roleName: string;
  active: boolean;
  createdDate: string;
}
 
export interface UserSplit {
  newUsers: number;
  subscribedUsers: number;
  totalUsers: number;
}
 
export interface DashboardSummary {
  kpi: DashboardKpi;
  topProducts: TopSellingProduct[];
  salesTrend: SalesTrend[];
  lowStockItems: LowStockItem[];
  recentUsers: RecentUser[];
  userSplit: UserSplit;
}
 
export interface DashboardQueryParams {
  lowStockThreshold?: number;
  recentUserCount?: number;
  topProductCount?: number;
  trendDays?: number;
}
// app.routes.ts
import { Routes } from '@angular/router';
import { Createuser } from './features/createuser/createuser';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { UserList } from './features/user-list/user-list';
import { CustomerList } from './features/customer-list/customer-list';
import { ProductList } from './features/product-list/product-list';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Unauthorized } from './shared/components/unauthorized/unauthorized';
import { EditUser } from './features/edit-user/edit-user';
import { GuestGuard } from './core/guards/guest.guard';
import { AuthGuard } from './core/guards/auth.guard';


// Auth Guards (you'll need to create these)
// import { AuthGuard } from './core/guards/auth.guard';
// import { GuestGuard } from './core/guards/guest.guard';
// import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Redirect root to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Auth route (only for non-authenticated users)
  {
    path: 'auth',
    component: Login,
    canActivate: [GuestGuard]
  },

  // Unauthorized access page
  {
    path: 'unauthorized',
    component: Unauthorized
  },

  // Main application routes with authentication
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        component: Dashboard,
        data: { 
          title: 'Dashboard',
          showHeader: true 
        }
      },

      // User Management Routes
      {
        path: 'user-list',
        component: UserList,
        data: { 
          title: 'Users',
          roles: ['Admin'],
          showHeader: true 
        }
        // canActivate: [RoleGuard]
      },
      {
        path: 'edit-users',
        component: EditUser,
        data: { 
          title: 'Edit Users',
          roles: ['Admin'],
          showHeader: true 
        }
        // canActivate: [RoleGuard]
      },
    //   {
    //     path: 'profile',
    //     component: Profile,
    //     data: { 
    //       title: 'My Profile',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },
      {
        path: 'createuser',
        component: Createuser,
        data: { 
          title: 'Register Users',
          roles: ['Admin'],
          showHeader: true 
        }
        // canActivate: [RoleGuard]
      },

      // Inventory Management Routes
      {
        path: 'products',
        component: ProductList,
        data: { 
          title: 'Product List',
          roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
          showHeader: true 
        }
      },
    //   {
    //     path: 'categories',
    //     component: CategoryList,
    //     data: { 
    //       title: 'Category List',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },
    //   {
    //     path: 'stock-history',
    //     component: StockHistory,
    //     data: { 
    //       title: 'Stock Transaction History',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },

      // Sales Management Routes
      {
        path: 'customers',
        component: CustomerList,
        data: { 
          title: 'Customers',
          roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
          showHeader: true 
        }
      },
    //   {
    //     path: 'sales-products',
    //     component: SalesProducts,
    //     data: { 
    //       title: 'Sales Products',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },

    //   // Supplier Management Routes
    //   {
    //     path: 'suppliers',
    //     component: SupplierList,
    //     data: { 
    //       title: 'Supplier List',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },
    //   {
    //     path: 'purchase-orders',
    //     component: PurchaseOrders,
    //     data: { 
    //       title: 'Purchase Orders',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },
    //   {
    //     path: 'create-purchase',
    //     component: CreatePurchase,
    //     data: { 
    //       title: 'Create Purchase',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },

    //   // Reports Routes
    //   {
    //     path: 'stock-report',
    //     component: StockReport,
    //     data: { 
    //       title: 'Stock Report',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },
    //   {
    //     path: 'sales-report',
    //     component: SalesReport,
    //     data: { 
    //       title: 'Sales Report',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },
    //   {
    //     path: 'purchase-report',
    //     component: PurchaseReport,
    //     data: { 
    //       title: 'Purchase Report',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },
    //   {
    //     path: 'profit-loss',
    //     component: ProfitLoss,
    //     data: { 
    //       title: 'Profit / Loss',
    //       roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
    //       showHeader: true 
    //     }
    //   },

      // Wildcard route for any unmatched routes within the main layout
      {
        path: '**',
        redirectTo: '/dashboard'
      }
    ]
  },

  // Wildcard route for 404 page (outside main layout)
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
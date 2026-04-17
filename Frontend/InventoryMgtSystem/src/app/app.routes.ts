import { Routes } from '@angular/router';
import { Createuser } from './features/createuser/createuser';
import { LowerCasePipe } from '@angular/common';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { UserList } from './features/user-list/user-list';
import { CustomerList } from './features/customer-list/customer-list';
import { ProductList } from './features/product-list/product-list';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'createuser', component: Createuser },
    { path: 'dashboard', component: Dashboard },
    { path: 'user-list', component: UserList },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'customer-list', component: CustomerList },
    { path: 'product-list', component: ProductList },

];

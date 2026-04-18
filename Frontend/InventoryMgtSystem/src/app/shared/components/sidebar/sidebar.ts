// sidebar.component.ts
import { Component, input, output } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.interface';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

interface SidebarSubItem {
  routeLink: string;
  icon: string;
  label: string;
  roles: string[];
}

interface SidebarItem {
  routeLink?: string;
  icon: string;
  label: string;
  roles: string[];
  children?: SidebarSubItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isLeftSidebarCollapsed = input.required<boolean>();
  changeIsLeftSidebarCollapsed = output<boolean>();

  items: SidebarItem[] = [];
  expandedMenus: { [key: string]: boolean } = {};

  currentUser$!: Observable<User | null>;

  constructor(public auth: AuthService) { }

  ngOnInit() {
    const allItems: SidebarItem[] = [
      {
        routeLink: 'dashboard',
        icon: 'pi pi-home',
        label: 'Dashboard',
        roles: ['Viewer', 'Admin', 'Manager', 'Operator']
      },
      {
        icon: 'pi pi-users',
        label: 'User Management',
        roles: ['Admin'],
        children: [
          { routeLink: 'user-list', icon: 'pi pi-users', label: 'Users', roles: ['Admin'] },
          { routeLink: 'edit-users', icon: 'pi pi-pencil', label: 'Edit Users', roles: ['Admin'] },
          { routeLink: 'profile', icon: 'pi pi-user', label: 'My Profile', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'createuser', icon: 'pi pi-plus', label: 'Register Users', roles: ['Admin'] }
        ]
      },
      {
        icon: 'pi pi-warehouse',
        label: 'Inventory Management',
        roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
        children: [
          { routeLink: 'products', icon: 'pi pi-box', label: 'Product List', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'categories', icon: 'pi pi-tags', label: 'Category List', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'stock-history', icon: 'pi pi-history', label: 'Stock Transaction History', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] }
        ]
      },
      {
        icon: 'pi pi-chart-line',
        label: 'Sales Management',
        roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
        children: [
          { routeLink: 'customers', icon: 'pi pi-users', label: 'Customers', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'sales-products', icon: 'pi pi-box', label: 'Products', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] }
        ]
      },
      {
        icon: 'pi pi-truck',
        label: 'Supplier Management',
        roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
        children: [
          { routeLink: 'suppliers', icon: 'pi pi-truck', label: 'Supplier List', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'purchase-orders', icon: 'pi pi-shopping-cart', label: 'Purchase Orders', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'create-purchase', icon: 'pi pi-plus', label: 'Create Purchase', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] }
        ]
      },
      {
        icon: 'pi pi-chart-bar',
        label: 'Reports',
        roles: ['Viewer', 'Admin', 'Manager', 'Operator'],
        children: [
          { routeLink: 'stock-report', icon: 'pi pi-chart-bar', label: 'Stock Report', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'sales-report', icon: 'pi pi-chart-line', label: 'Sales Report', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'purchase-report', icon: 'pi pi-file-alt', label: 'Purchase Report', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] },
          { routeLink: 'profit-loss', icon: 'pi pi-dollar-sign', label: 'Profit / Loss', roles: ['Viewer', 'Admin', 'Manager', 'Operator'] }
        ]
      }
    ];
    
    this.items = allItems.filter(item => this.auth.hasAnyRole(item.roles));
    // Initialize expanded state for all menus
    this.items.forEach(item => {
      if (item.children) {
        this.expandedMenus[item.label] = false;
      }
    });
  }

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed());
  }

  closeSidenav(): void {
    this.changeIsLeftSidebarCollapsed.emit(true);
  }

  toggleMenu(item: SidebarItem): void {
    if (!this.isLeftSidebarCollapsed()) {
      this.expandedMenus[item.label] = !this.expandedMenus[item.label];
    }
  }

  hasAnyRole(roles: string[]): boolean {
    return this.auth.hasAnyRole(roles);
  }
}
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ImportsModule } from '../../imports/imports';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{

activeMenu: string | null = null;
totalUsers: number = 0;
totProducts: number = 0;
totCategory: number = 0;
totCustomer: number = 0;
totExpense: number = 0;
totSales: number = 0;
topSellingProducts : string = '';

constructor(
    private dashboard: DashboardService,
    private router: Router,
    private cdr:ChangeDetectorRef
  ) { }

toggle(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
}

ngOnInit(): void {
  this.loadUserCount();
  this.loadProductCount();
  this.loadCategoryCount();
  this.loadCustomerCount();
  this.loadExpensesCount();
  this.loadTopSellingProducts();
}

onUserClick(){
   this.router.navigate(['/user-list']);
}

onCreateUser() {
  this.router.navigate(['/createuser']);
}

loadUserCount() {
    this.dashboard.TotalUserCount().subscribe({
      next: (totalUsers) => {
        this.totalUsers = totalUsers;
        console.log('Total Users:', totalUsers);
      },
      error: (err) => {
        console.error('Error loading user count', err);
      }
    });
  }

loadProductCount() {
    this.dashboard.TotalProductCount().subscribe({
      next: (totProducts) => {
        this.totProducts = totProducts;
         console.log('Total prods:', totProducts);
      },
      error: (err) => {
        console.error('Error loading product count', err);
      }
    });
  }

loadCategoryCount() {
    this.dashboard.TotalCategoryCount().subscribe({
      next: (totCats) => {
        this.totCategory = totCats;
        console.log('Total cats:', totCats);
},
      error: (err) => {
        console.error('Error loading category count', err);
      }
    });
  }

loadCustomerCount() {
    this.dashboard.TotalCustomerCount().subscribe({
      next: (totCustomer) => {
        this.totCustomer = totCustomer;
        console.log('Total customers:', totCustomer);
      },
      error: (err) => {
        console.error('Error loading Customer count', err);
      }
    });
  }

  loadExpensesCount() {
    this.dashboard.TotalExpenseCount().subscribe({
      next: (totExpense) => {
        this.totExpense = totExpense;},
      error: (err) => {
        console.error('Error loading expenses count', err);
      }
    });
  }

loadTopSellingProducts() {
    this.dashboard.TopSellingProducts().subscribe({
      next: (SellingProducts) => {
        this.topSellingProducts = SellingProducts;},
      error: (err) => {
        console.error('Error loading top selling products', err);
      }
    });
  }




}


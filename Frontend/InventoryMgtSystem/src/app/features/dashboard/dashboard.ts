// dashboard.ts — updated to consume the real API (replaces hardcoded data)
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { Subject, takeUntil } from 'rxjs';
import {DashboardService} from '../../core/services/dashboard.service';
import { TopSellingProduct, LowStockItem, RecentUser, DashboardSummary } from '../../core/models/dashboard.interface';

// Colour ramp cycling for top-product bars
const BAR_COLORS = ['cyan', 'purple', 'blue', 'green', 'amber'] as const;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  today = new Date();
  isLoading = true;
  hasError  = false;

  // ── KPI ─────────────────────────────────────────────────
  totalUsers      = 0;
  totProducts     = 0;
  totCategory     = 0;
  totCustomer     = 0;
  totExpense: number | string = 0;
  totSales:   number | string = 0;

  // ── Sections ─────────────────────────────────────────────
  topProducts:   (TopSellingProduct & { pct: number; color: string })[] = [];
  lowStockItems: LowStockItem[]  = [];
  recentUsers:   (RecentUser & { initials: string; avatarBg: string })[] = [];

  // ── User split ───────────────────────────────────────────
  newUsers        = 0;
  subscribedUsers = 0;
  donutData:    any;
  donutOptions: any;

  // ── Sales trend ──────────────────────────────────────────
  lineData:    any;
  lineOptions: any;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onUserClick(): void {
    this.router.navigate(['/user-list']);
  }

  // ── Data loading ─────────────────────────────────────────
  private loadDashboard(): void {
    this.isLoading = true;
    this.hasError  = false;

    this.dashboardService
      .getDashboardSummary({ lowStockThreshold: 10, recentUserCount: 5, topProductCount: 5, trendDays: 7 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.result) {
            this.mapData(response.result);
          } else {
            this.hasError = true;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.hasError  = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private mapData(data: DashboardSummary): void {

    // KPIs
    this.totalUsers  = data.kpi.totalUsers;
    this.totProducts = data.kpi.totalProducts;
    this.totCategory = data.kpi.totalCategories;
    this.totCustomer = data.kpi.totalCustomers;
    this.totExpense  = data.kpi.totalExpense;
    this.totSales    = data.kpi.totalSales;

    // Top products — normalise bar widths to the highest seller
    const maxUnits = data.topProducts[0]?.totalUnitsSold ?? 1;
    this.topProducts = data.topProducts.map((p, i) => ({
      ...p,
      pct:   Math.round((p.totalUnitsSold / maxUnits) * 100),
      color: BAR_COLORS[i % BAR_COLORS.length],
    }));

    // Low stock
    this.lowStockItems = data.lowStockItems;

    // Recent users — derive initials + deterministic avatar colour
    this.recentUsers = data.recentUsers.map((u) => ({
      ...u,
      initials: this.getInitials(u.name),
      avatarBg: this.avatarColor(u.name),
    }));

    // User split
    this.newUsers        = data.userSplit.newUsers;
    this.subscribedUsers = data.userSplit.subscribedUsers;
    this.buildDonutData();

    // Sales trend
    this.buildLineData(data);
  }

  // ── Chart builders ────────────────────────────────────────
  private buildDonutData(): void {
    this.donutData = {
      labels: ['New Users', 'Subscribed'],
      datasets: [{
        data: [this.newUsers, this.subscribedUsers],
        backgroundColor: ['#0d9488', '#f59e0b'],
        hoverBackgroundColor: ['#0f766e', '#d97706'],
        borderWidth: 0,
        hoverOffset: 4,
      }],
    };
  }

  private buildLineData(data: DashboardSummary): void {
    const labels  = data.salesTrend.map(t => t.dayName.slice(0, 3)); // Mon, Tue …
    const sales   = data.salesTrend.map(t => t.dailySales);
    const expense = data.salesTrend.map(t => t.dailyExpense);

    this.lineData = {
      labels,
      datasets: [
        {
          label: 'Sales',
          data: sales,
          fill: true,
          backgroundColor: 'rgba(13,148,136,0.08)',
          borderColor: '#0d9488',
          borderWidth: 2.5,
          tension: 0.4,
          pointBackgroundColor: '#0d9488',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Expenses',
          data: expense,
          fill: true,
          backgroundColor: 'rgba(239,68,68,0.06)',
          borderColor: '#ef4444',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: '#ef4444',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }

  private initChartOptions(): void {
    this.donutOptions = {
      cutout: '70%',
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      responsive: true,
      maintainAspectRatio: false,
    };

    this.lineOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { usePointStyle: true, pointStyleWidth: 8, boxHeight: 8, color: '#6b7280', font: { size: 12 } },
        },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: { grid: { display: false },                        ticks: { color: '#9ca3af', font: { size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' },            ticks: { color: '#9ca3af', font: { size: 11 } } },
      },
      responsive: true,
      maintainAspectRatio: false,
    };
  }

  // ── Helpers ──────────────────────────────────────────────
  private getInitials(name: string): string {
    return (name ?? '?')
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  /** Deterministic colour from name hash — same name always same colour */
  private avatarColor(name: string): string {
    const palette = ['#6366f1', '#0d9488', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  }
}
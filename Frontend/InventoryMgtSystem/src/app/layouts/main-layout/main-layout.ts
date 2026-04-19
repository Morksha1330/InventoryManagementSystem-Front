import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { ToastModule } from 'primeng/toast';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, Sidebar, Header, ToastModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
 isSidebarCollapsed = signal(false);
  isMobile = signal(false);
  showHeader = signal(true);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  @HostListener('window:resize')
  onResize() {
    if (!isPlatformBrowser(this.platformId)) return;

    const width = window.innerWidth;
    this.isMobile.set(width < 768);

    if (this.isMobile()) {
      this.isSidebarCollapsed.set(true);
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.onResize();
    }

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.resolveHeader());

    this.resolveHeader();
  }

  toggleSidebar(value: boolean) {
    this.isSidebarCollapsed.set(value);
  }

  private resolveHeader() {
    let r = this.route;
    while (r.firstChild) r = r.firstChild;
    this.showHeader.set(r.snapshot.data['showHeader'] !== false);
  }

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isSidebarCollapsed.set(isLeftSidebarCollapsed);
  }
}

import { Component, EventEmitter, inject, Input, input, Output, output } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.interface';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
@Input() collapsed = false;
@Output() toggle = new EventEmitter<boolean>();
  isLeftSidebarCollapsed = input<boolean>(false);
  toggleSidebar = output<boolean>();

  showDropdown = false;
  currentUser$!: Observable<User | null>;

  private authService = inject(AuthService);

  ngOnInit(): void {
   // this.currentUser$ = this.authService.currentUser$;
  //  console.log('Current User in Header:', this.currentUser$);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeDropdown();
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}

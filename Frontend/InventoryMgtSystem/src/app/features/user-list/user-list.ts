import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImportsModule } from '../../imports/imports';
import { User } from '../../core/models/user.interface';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  users: User[] = [];
  selectedUser: User = {} as User;
  isModalOpen: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  
  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
        console.log('Users Loaded:', data);
      },
      error: (err) => {
        console.error('Error loading users', err);
      }
    });
  }

 ClickEdit(user: User) {
  console.log("clicked on the edit button");
  this.selectedUser = { ...user }; // clone object
  this.isModalOpen = true;
}

closeModal() {
  this.isModalOpen = false;
}

updateUser() {
  this.userService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
    next: () => {
      console.log('User updated successfully');

      this.closeModal();
      this.loadUsers(); // refresh table
    },
    error: (err) => {
      console.error('Update failed', err);
    }
  });
}

ClickDelete() {
throw new Error('Method not implemented.');
}
}
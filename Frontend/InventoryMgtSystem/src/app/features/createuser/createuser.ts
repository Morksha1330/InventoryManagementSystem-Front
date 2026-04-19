import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-createuser',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './createuser.html',
  styleUrl: './createuser.css',
})
export class Createuser implements OnInit {

  UserForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  activeMenu: string | null = null;


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.UserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9+\\s()-]*$'), Validators.maxLength(20)]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}
toggle(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
}

onUserClick(){
   this.router.navigate(['/user-list']);
}

onCreateUser() {
  this.router.navigate(['/createuser']);
}

  onSubmit(): void {
    console.log('Form submitted with values:', this.UserForm.value);
    console.log('Calling API:', `${this.userService['baseUrl']}/register`);
    if (this.UserForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const UserData = {
        name: `${this.UserForm.value.firstName} ${this.UserForm.value.lastName}`,
        username: this.UserForm.value.username,
        email: this.UserForm.value.email,
        phone: this.UserForm.value.phone,
        role: this.UserForm.value.role
      };

      this.userService.addUser(UserData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = `User ${response.result.username} added successfully with ID: ${response.result.id}`;
          this.UserForm.reset();

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to add user. Please try again.';

          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      });
    } else {
      this.markFormGroupTouched(this.UserForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for easy access in HTML
  get firstName() { return this.UserForm.get('firstName'); }
  get lastName() { return this.UserForm.get('lastName'); }
  get username() { return this.UserForm.get('username'); }
  get email() { return this.UserForm.get('email'); }
  get phone() { return this.UserForm.get('phone'); }
  get role() { return this.UserForm.get('role'); }

}
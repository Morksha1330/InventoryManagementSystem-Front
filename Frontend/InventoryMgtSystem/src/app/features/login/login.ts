import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImportsModule } from '../../imports/imports';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  [x: string]: any;
  email: string = '';
  password: string = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    const payload = {
      username: this.email,
      password: this.password
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        console.log('Login success', res);
        localStorage.setItem('token', res.result.token);

        // alert('Login Successful');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        alert('Invalid credentials');
      }
    });
  }
}
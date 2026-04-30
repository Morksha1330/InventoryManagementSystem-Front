// src/app/features/profile/profile.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ImportsModule } from '../../imports/imports'; // adjust path as needed
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.interface';
import { Router } from '@angular/router';

/** Cross-field validator: newPassword must equal confirmPassword */
const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPw = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPw && confirm && newPw !== confirm ? { mismatch: true } : null;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule],
  templateUrl:'./profile.html',
  styleUrl:'./profile.css',
})
export class Profile implements OnInit, OnDestroy {

  // ── State ────────────────────────────────────────────────────────────────
  profile = signal<User | null>(null);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  changePasswordVisible = signal<boolean>(false);

  passwordForm!: FormGroup;

  skeletonRows = Array(6).fill(null);

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildPasswordForm();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadProfile(): void {
    this.loading.set(true);

    this.userService
      .getLoggedInUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.profile.set(res.result);
          } else {
            this.showError('Failed to load profile', res.message);
            this.profile.set(null);
          }
          this.loading.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not fetch profile. Please try again.');
          this.profile.set(null);
          this.loading.set(false);
        },
      });
  }

  // ── Password dialog ───────────────────────────────────────────────────────

  private buildPasswordForm(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
    );
  }

  openChangePassword(): void {
    this.buildPasswordForm();
    this.changePasswordVisible.set(true);
    this.router.navigate(['/change-password']);
  }

  closeChangePassword(): void {
    this.changePasswordVisible.set(false);
    this.passwordForm.reset();
  }

  submitChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Generate up to 2-letter initials from a full name */
  initials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /** Deterministic avatar background colour — same palette as product icons */
  avatarColor(name: string): string {
    const palette = [
      '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899',
      '#f59e0b', '#10b981', '#ef4444', '#14b8a6',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  }

  // ── Form validation helpers ────────────────────────────────────────────────

  pwFieldError(field: string): boolean {
    const ctrl = this.passwordForm?.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  pwFieldErrorMsg(field: string): string {
    const ctrl = this.passwordForm?.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return `${this.pwFieldLabel(field)} is required`;
    if (ctrl.errors['minlength'])
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  private pwFieldLabel(field: string): string {
    const map: Record<string, string> = {
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
    };
    return map[field] ?? field;
  }

  private showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail, life: 3000 });
  }

  private showError(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'error', summary, detail: detail ?? '', life: 4000 });
  }
}
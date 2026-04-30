// src/app/features/users/change-password/change-password.component.ts

import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AbstractControl,FormBuilder,FormGroup,FormsModule,ReactiveFormsModule,ValidationErrors,ValidatorFn,Validators,} from '@angular/forms';
import { ImportsModule } from '../../imports/imports';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

/** Custom validator: newPassword must not equal currentPassword */
const notSameAsCurrent: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const current = group.get('currentPassword')?.value;
  const next = group.get('newPassword')?.value;
  if (current && next && current === next) {
    group.get('newPassword')?.setErrors({ sameAsCurrent: true });
    return { sameAsCurrent: true };
  }
  return null;
};

/** Custom validator: confirmPassword must match newPassword */
const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (next && confirm && next !== confirm) {
    group.get('confirmPassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule, CurrencyPipe, DatePipe],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  saving = signal<boolean>(false);
  success = signal<boolean>(false);

  showCurrent = signal<boolean>(false);
  showNew = signal<boolean>(false);
  showConfirm = signal<boolean>(false);

  /** Password strength: 0–4 */
  passwordStrength = signal<number>(0);
  strengthLabel = signal<string>('');
  strengthClass = signal<string>('');

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(2)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: [notSameAsCurrent, passwordsMatch] }
    );

    // Watch new password for strength meter
    this.form.get('newPassword')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => this.updateStrength(val));
  }

  // ── Password strength ────────────────────────────────────────────────────

  private updateStrength(password: string): void {
    if (!password) {
      this.passwordStrength.set(0);
      this.strengthLabel.set('');
      this.strengthClass.set('');
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const capped = Math.min(score, 4);
    this.passwordStrength.set(capped);

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const classes = ['', 'strength--weak', 'strength--fair', 'strength--good', 'strength--strong'];
    this.strengthLabel.set(labels[capped]);
    this.strengthClass.set(classes[capped]);
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.getCurrentUserValue();
    if (!user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Unauthorized',
        detail: 'No authenticated user found.',
        life: 4000,
      });
      return;
    }

    this.saving.set(true);

    const payload = {
      userId: user.id,
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword,
    };

    this.userService
      .changePassword(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.success.set(true);
            this.form.reset();
            this.passwordStrength.set(0);
            this.messageService.add({
              severity: 'success',
              summary: 'Password Changed',
              detail: 'Your password has been updated successfully.',
              life: 4000,
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Failed',
              detail: res.message ?? 'Could not update password.',
              life: 5000,
            });
          }
          this.saving.set(false);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An unexpected error occurred. Please try again.',
            life: 5000,
          });
          this.saving.set(false);
        },
      });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  resetSuccess(): void {
    this.success.set(false);
  }

  fieldError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  fieldErrorMsg(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required';
    if (ctrl.errors['minlength'])
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters required`;
    if (ctrl.errors['sameAsCurrent']) return 'New password must differ from current password';
    if (ctrl.errors['mismatch']) return 'Passwords do not match';
    return 'Invalid value';
  }

  get strengthSegments(): number[] {
    return [1, 2, 3, 4];
  }
}
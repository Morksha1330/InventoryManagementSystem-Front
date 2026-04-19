import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImportsModule } from '../../imports/imports';
import { AddUserDto, RoleOption, StatusOption, User, UserFilterDto } from '../../core/models/user.interface';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule],
  providers: [ConfirmationService],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;

  // ── state ────────────────────────────────────────────────────────────────
  users = signal<User[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  editDialogVisible = signal<boolean>(false);
  addDialogVisible = signal<boolean>(false);
  saving = signal<boolean>(false);
  selectedUser = signal<User | null>(null);

  // ── filter state ─────────────────────────────────────────────────────────
  searchTerm = signal<string>('');
  selectedRoleFilter = signal<number | null>(null);
  selectedStatusFilter = signal<boolean | null>(null);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  sortField = signal<string>('id');
  sortOrder = signal<string>('ASC');

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ── form ─────────────────────────────────────────────────────────────────
  editForm!: FormGroup;
  addForm!: FormGroup;

  // ── options ──────────────────────────────────────────────────────────────
  roleOptions: RoleOption[] = [
    { label: 'All Roles', value: null },
    { label: 'Admin', value: 1 },
    { label: 'Store Keeper', value: 2 },
    { label: 'Sales Person', value: 3 },
    { label: 'Purchaser', value: 4 },
  ];

  roleFormOptions = [
    { label: 'Admin', value: 1 },
    { label: 'Store Keeper', value: 2 },
    { label: 'Sales Person', value: 3 },
    { label: 'Purchaser', value: 4 },
  ];

  statusOptions: StatusOption[] = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  pageSizeOptions = [
    { label: '10 / page', value: 10 },
    { label: '20 / page', value: 20 },
    { label: '50 / page', value: 50 },
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.buildAddForm();
    this.loadUsers();

    // Debounced search
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.currentPage.set(1);
        this.loadUsers();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── form helpers ─────────────────────────────────────────────────────────

  private buildForm(user?: User): void {
    this.editForm = this.fb.group({
      name: [user?.name ?? '', [Validators.required, Validators.minLength(2)]],
      username: [user?.username ?? '', [Validators.required, Validators.minLength(3)]],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      epF_No: [user?.epF_No ?? ''],
      roleId: [user?.roleId ?? null, Validators.required],
      active: [user?.active ?? true],
      phone: [user?.phone ?? ''],
    });
  }

  private buildAddForm(): void {
    this.addForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        epF_No: [''],
        roleId: [null, Validators.required],
        active: [null, Validators.required],
        phone: [''],

      }
    );
  }

  // ── data loading ─────────────────────────────────────────────────────────

  loadUsers(): void {
    this.loading.set(true);

    const filter: UserFilterDto = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined,
      roleId: this.selectedRoleFilter() ?? undefined,
      active: this.selectedStatusFilter() ?? undefined,
      sortBy: this.sortField(),
      sortOrder: this.sortOrder(),
    };

    this.userService
      .getPagedUsers(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.users.set(res.data);
            console.log('Loaded users:', res.data);
            this.totalRecords.set(res.pagination.totalCount);
          } else {
            this.showError('Failed to load users', res.message);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.showError('Error', 'Could not fetch users. Please try again.');
          this.loading.set(false);
        },
      });
  }

  // ── table events ─────────────────────────────────────────────────────────

  onPage(event: any): void {
    this.currentPage.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.loadUsers();
  }

  onSort(event: any): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 'ASC' : 'DESC');
    this.currentPage.set(1);
    this.loadUsers();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onRoleFilterChange(value: number | null): void {
    this.selectedRoleFilter.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onStatusFilterChange(value: boolean | null): void {
    this.selectedStatusFilter.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageSizeChange(value: number): void {
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedRoleFilter.set(null);
    this.selectedStatusFilter.set(null);
    this.currentPage.set(1);
    this.loadUsers();
  }

  // ── actions ───────────────────────────────────────────────────────────────

  openCreate(): void {
    this.buildAddForm();
    this.addDialogVisible.set(true);
  }

  closeAddDialog(): void {
    this.addDialogVisible.set(false);
    this.addForm.reset();
  }

  openEdit(user: User): void {
    this.selectedUser.set(user);
    this.buildForm(user);
    this.editDialogVisible.set(true);
  }

  closeDialog(): void {
    this.editDialogVisible.set(false);
    this.selectedUser.set(null);
    this.editForm.reset();
  }

  saveUser(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const user = this.selectedUser();
    if (!user) return;

    this.saving.set(true);

    const payload: AddUserDto = {
      id: user.id,
      ...this.editForm.value,
    };

    this.userService
      .updateUser(user.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('User updated successfully');
            this.closeDialog();
            this.loadUsers();
          } else {
            this.showError('Update failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not update user. Please try again.');
          this.saving.set(false);
        },
      });
  }

  createUser(): void {
    
    if (this.addForm.invalid == null) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload: AddUserDto = {
      ...this.addForm.value
    };
    console.log('Creating user with payload:', payload);
    this.userService
      .addUser(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
           console.log('API response:', res);
          if (res.success) {
            this.showSuccess('User created successfully');
            this.closeAddDialog();
            this.loadUsers();
          } else {
            this.showError('Create failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not create user. Please try again.');
          this.saving.set(false);
        },
      });
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete <strong>${user.name}</strong>? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteUser(user),
    });
  }

  private deleteUser(user: User): void {
    this.userService
      .deleteUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess(`${user.name} deleted successfully`);
            this.loadUsers();
          } else {
            this.showError('Delete failed', res.message);
          }
        },
        error: () => this.showError('Error', 'Could not delete user.'),
      });
  }

  toggleStatus(user: User): void {
    this.userService
      .toggleUserStatus(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            const status = res.result.active ? 'activated' : 'deactivated';
            this.showSuccess(`${user.name} ${status}`);
            this.loadUsers();
          } else {
            this.showError('Toggle failed', res.message);
          }
        },
        error: () => this.showError('Error', 'Could not toggle status.'),
      });
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  getRoleLabel(roleId: number): string {
    return this.roleFormOptions.find((r) => r.value === roleId)?.label ?? 'Unknown';
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm() ||
      this.selectedRoleFilter() !== null ||
      this.selectedStatusFilter() !== null
    );
  }

  private showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail, life: 3000 });
  }

  private showError(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'error', summary, detail: detail ?? '', life: 4000 });
  }

  // ── template helpers ──────────────────────────────────────────────────────

  skeletonRows = Array(8).fill(null);

  /** Deterministic avatar background colour from a name string */
  avatarColor(name: string): string {
    const palette = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
      '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  }

  fieldError(field: string, formType: 'edit' | 'add' = 'edit'): boolean {
    const ctrl = formType === 'edit' ? this.editForm.get(field) : this.addForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  fieldErrorMsg(field: string, formType: 'edit' | 'add' = 'edit'): string {
    const ctrl = formType === 'edit' ? this.editForm.get(field) : this.addForm.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return `${this.fieldLabel(field)} is required`;
    if (ctrl.errors['email']) return 'Enter a valid email address';
    if (ctrl.errors['minlength'])
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  private fieldLabel(field: string): string {
    const map: Record<string, string> = {
      name: 'Name', username: 'Username', email: 'Email',
      roleId: 'Role', epF_No: 'EPF No', statusId: 'Status'

    };
    return map[field] ?? field;
  }
}
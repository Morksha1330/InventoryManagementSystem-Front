// src/app/features/customers/customer-list/customer-list.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImportsModule } from '../../imports/imports';
import { CustomerDto, CustomerFilterDto, StatusOption } from '../../core/models/customer.interface';
import { CustomerService } from '../../core/services/customer.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule],
  providers: [ConfirmationService],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerList implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;

  // ── state ────────────────────────────────────────────────────────────────
  customers = signal<CustomerDto[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  editDialogVisible = signal<boolean>(false);
  addDialogVisible = signal<boolean>(false);
  saving = signal<boolean>(false);
  selectedCustomer = signal<CustomerDto | null>(null);

  // ── filter state ─────────────────────────────────────────────────────────
  searchTerm = signal<string>('');
  selectedStatusFilter = signal<boolean | null>(null);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  sortField = signal<string>('id');
  sortOrder = signal<string>('ASC');

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ── forms ─────────────────────────────────────────────────────────────────
  editForm!: FormGroup;
  addForm!: FormGroup;

  // ── options ──────────────────────────────────────────────────────────────
  statusOptions: StatusOption[] = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  statusFormOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  pageSizeOptions = [
    { label: '10 / page', value: 10 },
    { label: '20 / page', value: 20 },
    { label: '50 / page', value: 50 },
  ];

  skeletonRows = Array(8).fill(null);

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.buildEditForm();
    this.buildAddForm();
    this.loadCustomers();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.currentPage.set(1);
        this.loadCustomers();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── form builders ────────────────────────────────────────────────────────

  private buildEditForm(customer?: CustomerDto): void {
    this.editForm = this.fb.group({
      customerName: [customer?.customerName ?? '', [Validators.required, Validators.minLength(2)]],
      customerEmail: [customer?.customerEmail ?? '', [Validators.required, Validators.email]],
      address: [customer?.address ?? ''],
      phoneNumber: [customer?.phoneNumber ?? ''],
      active: [customer?.active ?? true],
    });
  }

  private buildAddForm(): void {
    this.addForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      address: [''],
      phoneNumber: [''],
      active: [null, Validators.required],
    });
  }

  // ── data loading ─────────────────────────────────────────────────────────

  loadCustomers(): void {
    this.loading.set(true);

    const filter: CustomerFilterDto = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined,
      active: this.selectedStatusFilter() ?? undefined,
      sortBy: this.sortField(),
      sortOrder: this.sortOrder(),
    };

    this.customerService
      .getPagedCustomers(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.customers.set(res.data);
            this.totalRecords.set(res.pagination.totalCount);
          } else {
            this.showError('Failed to load customers', res.message);
          }
          this.loading.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not fetch customers. Please try again.');
          this.loading.set(false);
        },
      });
  }

  // ── table events ─────────────────────────────────────────────────────────

  onPage(event: any): void {
    this.currentPage.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.loadCustomers();
  }

  onSort(event: any): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 'ASC' : 'DESC');
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onStatusFilterChange(value: boolean | null): void {
    this.selectedStatusFilter.set(value);
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onPageSizeChange(value: number): void {
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.loadCustomers();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatusFilter.set(null);
    this.currentPage.set(1);
    this.loadCustomers();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm() || this.selectedStatusFilter() !== null;
  }

  // ── CRUD actions ──────────────────────────────────────────────────────────

  openCreate(): void {
    this.buildAddForm();
    this.addDialogVisible.set(true);
  }

  closeAddDialog(): void {
    this.addDialogVisible.set(false);
    this.addForm.reset();
  }

  openEdit(customer: CustomerDto): void {
    this.selectedCustomer.set(customer);
    this.buildEditForm(customer);
    this.editDialogVisible.set(true);
  }

  closeEditDialog(): void {
    this.editDialogVisible.set(false);
    this.selectedCustomer.set(null);
    this.editForm.reset();
  }

  saveCustomer(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const customer = this.selectedCustomer();
    if (!customer) return;

    this.saving.set(true);

    const payload: CustomerDto = {
      id: customer.id,
      ...this.editForm.value,
    };

    this.customerService
      .updateCustomer(customer.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('Customer updated successfully');
            this.closeEditDialog();
            this.loadCustomers();
          } else {
            this.showError('Update failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not update customer. Please try again.');
          this.saving.set(false);
        },
      });
  }

  createCustomer(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload = { ...this.addForm.value };

    this.customerService
      .createCustomer(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('Customer created successfully');
            this.closeAddDialog();
            this.loadCustomers();
          } else {
            this.showError('Create failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not create customer. Please try again.');
          this.saving.set(false);
        },
      });
  }

  confirmDelete(customer: CustomerDto): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete <strong>${customer.customerName}</strong>? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteCustomer(customer),
    });
  }

  private deleteCustomer(customer: CustomerDto): void {
    // Note: Add a deleteCustomer method to the service if your backend supports DELETE.
    // For now we show a not-implemented message.
    this.showError('Not implemented', 'Delete endpoint not available in this backend.');
  }

  toggleStatus(customer: CustomerDto): void {
    this.customerService
      .toggleCustomerStatus(customer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            const status = res.result.active ? 'activated' : 'deactivated';
            this.showSuccess(`${customer.customerName} ${status}`);
            this.loadCustomers();
          } else {
            this.showError('Toggle failed', res.message);
          }
        },
        error: () => this.showError('Error', 'Could not toggle status.'),
      });
  }

  // ── template helpers ──────────────────────────────────────────────────────

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
      customerName: 'Customer Name',
      customerEmail: 'Email',
      address: 'Address',
      phoneNumber: 'Phone Number',
      active: 'Status',
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
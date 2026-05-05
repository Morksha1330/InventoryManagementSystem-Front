// src/app/features/suppliers/supplier-list/supplier-list.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImportsModule } from '../../imports/imports';
import { SupplierDto, SupplierFilterDto, SupplierStatusOption } from '../../core/models/supplier.interface';
import { SupplierService } from '../../core/services/supplier.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule],
  providers: [ConfirmationService],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.css',
})
export class SupplierList implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;

  // ── state ────────────────────────────────────────────────────────────────
  suppliers = signal<SupplierDto[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  editDialogVisible = signal<boolean>(false);
  addDialogVisible = signal<boolean>(false);
  saving = signal<boolean>(false);
  selectedSupplier = signal<SupplierDto | null>(null);

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
  statusOptions: SupplierStatusOption[] = [
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
    private supplierService: SupplierService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.buildEditForm();
    this.buildAddForm();
    this.loadSuppliers();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.currentPage.set(1);
        this.loadSuppliers();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── form builders ────────────────────────────────────────────────────────

  private buildEditForm(supplier?: SupplierDto): void {
    this.editForm = this.fb.group({
      supplierName: [supplier?.supplierName ?? '', [Validators.required, Validators.minLength(2)]],
      supplierEmail: [supplier?.supplierEmail ?? '', [Validators.required, Validators.email]],
      address: [supplier?.address ?? ''],
      phoneNumber: [supplier?.phoneNumber ?? ''],
      active: [supplier?.active ?? true],
    });
  }

  private buildAddForm(): void {
    this.addForm = this.fb.group({
      supplierName: ['', [Validators.required, Validators.minLength(2)]],
      supplierEmail: ['', [Validators.required, Validators.email]],
      address: [''],
      phoneNumber: [''],
      active: [null, Validators.required],
    });
  }

  // ── data loading ─────────────────────────────────────────────────────────

  loadSuppliers(): void {
    this.loading.set(true);

    const filter: SupplierFilterDto = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined,
      active: this.selectedStatusFilter() ?? undefined,
      sortBy: this.sortField(),
      sortOrder: this.sortOrder(),
    };

    this.supplierService
      .getPagedSuppliers(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.suppliers.set(res.data);
            this.totalRecords.set(res.pagination.totalCount);
          } else {
            this.showError('Failed to load suppliers', res.message);
          }
          this.loading.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not fetch suppliers. Please try again.');
          this.loading.set(false);
        },
      });
  }

  // ── table events ─────────────────────────────────────────────────────────

  onPage(event: any): void {
    this.currentPage.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.loadSuppliers();
  }

  onSort(event: any): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 'ASC' : 'DESC');
    this.currentPage.set(1);
    this.loadSuppliers();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onStatusFilterChange(value: boolean | null): void {
    this.selectedStatusFilter.set(value);
    this.currentPage.set(1);
    this.loadSuppliers();
  }

  onPageSizeChange(value: number): void {
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.loadSuppliers();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatusFilter.set(null);
    this.currentPage.set(1);
    this.loadSuppliers();
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

  openEdit(supplier: SupplierDto): void {
    this.selectedSupplier.set(supplier);
    this.buildEditForm(supplier);
    this.editDialogVisible.set(true);
  }

  closeEditDialog(): void {
    this.editDialogVisible.set(false);
    this.selectedSupplier.set(null);
    this.editForm.reset();
  }

  saveSupplier(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const supplier = this.selectedSupplier();
    if (!supplier) return;

    this.saving.set(true);

    const payload: SupplierDto = {
      id: supplier.id,
      ...this.editForm.value,
    };

    this.supplierService
      .updateSupplier(supplier.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('Supplier updated successfully');
            this.closeEditDialog();
            this.loadSuppliers();
          } else {
            this.showError('Update failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not update supplier. Please try again.');
          this.saving.set(false);
        },
      });
  }

  createSupplier(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload = { ...this.addForm.value };

    this.supplierService
      .createSupplier(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('Supplier created successfully');
            this.closeAddDialog();
            this.loadSuppliers();
          } else {
            this.showError('Create failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not create supplier. Please try again.');
          this.saving.set(false);
        },
      });
  }

  confirmDelete(supplier: SupplierDto): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete <strong>${supplier.supplierName}</strong>? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteSupplier(supplier),
    });
  }

  private deleteSupplier(supplier: SupplierDto): void {
    this.supplierService
      .deleteSupplier(supplier.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess(`${supplier.supplierName} deleted successfully`);
            this.loadSuppliers();
          } else {
            this.showError('Delete failed', res.message);
          }
        },
        error: () => this.showError('Error', 'Could not delete supplier. Please try again.'),
      });
  }

  toggleStatus(supplier: SupplierDto): void {
    this.supplierService
      .toggleSupplierStatus(supplier.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            const status = res.result.active ? 'activated' : 'deactivated';
            this.showSuccess(`${supplier.supplierName} ${status}`);
            this.loadSuppliers();
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
      '#10b981', '#0ea5e9', '#6366f1', '#8b5cf6',
      '#f59e0b', '#ec4899', '#ef4444', '#14b8a6',
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
      supplierName: 'Supplier Name',
      supplierEmail: 'Email',
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
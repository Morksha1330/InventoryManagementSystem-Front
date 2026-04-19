// src/app/features/products/product-list/product-list.component.ts

import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImportsModule } from '../../imports/imports'; // adjust path as needed
import { ProductService } from '../../core/services/product.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProductDTO, CategoryOption, ProductFilterDto } from '../../core/models/product.interface';
import { StatusOption } from '../../core/models/user.interface';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule, CurrencyPipe, DatePipe],
  providers: [ConfirmationService],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;

  // ── state ────────────────────────────────────────────────────────────────
  products = signal<ProductDTO[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  editDialogVisible = signal<boolean>(false);
  addDialogVisible = signal<boolean>(false);
  saving = signal<boolean>(false);
  selectedProduct = signal<ProductDTO | null>(null);

  // ── filter state ─────────────────────────────────────────────────────────
  searchTerm = signal<string>('');
  selectedCategoryFilter = signal<number | null>(null);
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
  // Replace with your real categories (or load from an API)
  categoryOptions: CategoryOption[] = [
    { label: 'All Categories', value: null },
    { label: 'Electronics', value: 1 },
    { label: 'Clothing', value: 2 },
    { label: 'Food & Beverages', value: 3 },
    { label: 'Stationery', value: 4 },
    { label: 'Hardware', value: 5 },
  ];

  categoryFormOptions = [
    { label: 'Electronics', value: 1 },
    { label: 'Clothing', value: 2 },
    { label: 'Food & Beverages', value: 3 },
    { label: 'Stationery', value: 4 },
    { label: 'Hardware', value: 5 },
  ];

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

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.buildEditForm();
    this.buildAddForm();
    this.loadProducts();

    // Debounced search
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.currentPage.set(1);
        this.loadProducts();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── form builders ─────────────────────────────────────────────────────────

  private buildEditForm(product?: ProductDTO): void {
    this.editForm = this.fb.group({
      sku: [product?.sku ?? '', [Validators.required, Validators.minLength(2)]],
      productName: [product?.productName ?? '', [Validators.required, Validators.minLength(2)]],
      categoryId: [product?.categoryId ?? null, Validators.required],
      unitPrice: [product?.unitPrice ?? null, [Validators.required, Validators.min(0)]],
      active: [product?.active ?? true],
    });
  }

  private buildAddForm(): void {
    this.addForm = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(2)]],
      productName: ['', [Validators.required, Validators.minLength(2)]],
      categoryId: [null, Validators.required],
      unitPrice: [null, [Validators.required, Validators.min(0)]],
      totalQuantity: [0, [Validators.required, Validators.min(0)]],
      active: [null, Validators.required],
    });
  }

  // ── data loading ─────────────────────────────────────────────────────────

  loadProducts(): void {
    this.loading.set(true);

    const filter: ProductFilterDto = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined,
      categoryId: this.selectedCategoryFilter() ?? undefined,
      active: this.selectedStatusFilter() ?? undefined,
      sortBy: this.sortField(),
      sortOrder: this.sortOrder(),
    };

    this.productService
      .getPagedProducts(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.products.set(res.data);
            this.totalRecords.set(res.pagination.totalCount);
          } else {
            this.showError('Failed to load products', res.message);
          }
          this.loading.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not fetch products. Please try again.');
          this.loading.set(false);
        },
      });
  }

  // ── table events ─────────────────────────────────────────────────────────

  onPage(event: any): void {
    this.currentPage.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.loadProducts();
  }

  onSort(event: any): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 'ASC' : 'DESC');
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onCategoryFilterChange(value: number | null): void {
    this.selectedCategoryFilter.set(value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onStatusFilterChange(value: boolean | null): void {
    this.selectedStatusFilter.set(value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onPageSizeChange(value: number): void {
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategoryFilter.set(null);
    this.selectedStatusFilter.set(null);
    this.currentPage.set(1);
    this.loadProducts();
  }

  // ── dialog actions ────────────────────────────────────────────────────────

  openCreate(): void {
    this.buildAddForm();
    this.addDialogVisible.set(true);
  }

  closeAddDialog(): void {
    this.addDialogVisible.set(false);
    this.addForm.reset();
  }

  openEdit(product: ProductDTO): void {
    this.selectedProduct.set(product);
    this.buildEditForm(product);
    this.editDialogVisible.set(true);
  }

  closeDialog(): void {
    this.editDialogVisible.set(false);
    this.selectedProduct.set(null);
    this.editForm.reset();
  }

  // ── CRUD operations ───────────────────────────────────────────────────────

  saveProduct(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const product = this.selectedProduct();
    if (!product) return;

    this.saving.set(true);

    const payload: ProductDTO = {
      ...product,           // keep id, totalQuantity, createdDate, categoryName
      ...this.editForm.value,
    };

    this.productService
      .updateProduct(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('Product updated successfully');
            this.closeDialog();
            this.loadProducts();
          } else {
            this.showError('Update failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not update product. Please try again.');
          this.saving.set(false);
        },
      });
  }

  createProduct(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload: ProductDTO = {
      id: 0,
      categoryName: '',
      createdDate: undefined,
      ...this.addForm.value,
    };

    this.productService
      .addProduct(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('Product created successfully');
            this.closeAddDialog();
            this.loadProducts();
          } else {
            this.showError('Create failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not create product. Please try again.');
          this.saving.set(false);
        },
      });
  }

  confirmDelete(product: ProductDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete <strong>${product.productName}</strong>? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteProduct(product),
    });
  }

  private deleteProduct(product: ProductDTO): void {
    this.productService
      .deleteProduct(product.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess(`"${product.productName}" deleted successfully`);
            this.loadProducts();
          } else {
            this.showError('Delete failed', res.message);
          }
        },
        error: () => this.showError('Error', 'Could not delete product.'),
      });
  }

  toggleStatus(product: ProductDTO): void {
    const updated: ProductDTO = { ...product, active: !product.active };

    this.productService
      .updateProduct(updated)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            const status = updated.active ? 'activated' : 'deactivated';
            this.showSuccess(`"${product.productName}" ${status}`);
            this.loadProducts();
          } else {
            this.showError('Toggle failed', res.message);
          }
        },
        error: () => this.showError('Error', 'Could not toggle product status.'),
      });
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm() ||
      this.selectedCategoryFilter() !== null ||
      this.selectedStatusFilter() !== null
    );
  }

  /** CSS class for qty cell based on stock level */
  stockClass(qty: number): string {
    if (qty === 0) return 'stock-out';
    if (qty <= 10) return 'stock-low';
    return 'stock-ok';
  }

  /** Deterministic background colour for product icon from product name */
  iconColor(name: string): string {
    const palette = [
      '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899',
      '#f59e0b', '#10b981', '#ef4444', '#14b8a6',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  }

  private showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail, life: 3000 });
  }

  private showError(summary: string, detail?: string): void {
    this.messageService.add({ severity: 'error', summary, detail: detail ?? '', life: 4000 });
  }

  skeletonRows = Array(8).fill(null);

  // ── form validation helpers ────────────────────────────────────────────────

  fieldError(field: string, formType: 'edit' | 'add' = 'edit'): boolean {
    const ctrl = formType === 'edit' ? this.editForm?.get(field) : this.addForm?.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  fieldErrorMsg(field: string, formType: 'edit' | 'add' = 'edit'): string {
    const ctrl = formType === 'edit' ? this.editForm?.get(field) : this.addForm?.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return `${this.fieldLabel(field)} is required`;
    if (ctrl.errors['min']) return `Value must be 0 or greater`;
    if (ctrl.errors['minlength'])
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  private fieldLabel(field: string): string {
    const map: Record<string, string> = {
      sku: 'SKU',
      productName: 'Product Name',
      categoryId: 'Category',
      unitPrice: 'Unit Price',
      totalQuantity: 'Quantity',
      active: 'Status',
    };
    return map[field] ?? field;
  }
}
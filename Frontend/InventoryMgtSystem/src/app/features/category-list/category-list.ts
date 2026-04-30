import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImportsModule } from '../../imports/imports'; // adjust path as needed
import { CategoryService } from '../../core/services/category.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CategoryDTO, CategoryFilterDto } from '../../core/models/category.interface';
import { StatusOption } from '../../core/models/user.interface';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule, DatePipe],
  providers: [ConfirmationService],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;

  // ── state ────────────────────────────────────────────────────────────────
  categories = signal<CategoryDTO[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);
  editDialogVisible = signal<boolean>(false);
  addDialogVisible = signal<boolean>(false);
  saving = signal<boolean>(false);
  selectedCategory = signal<CategoryDTO | null>(null);

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
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.buildEditForm();
    this.buildAddForm();
    this.loadCategories();

    // Debounced search
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.currentPage.set(1);
        this.loadCategories();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── form builders ─────────────────────────────────────────────────────────

  private buildEditForm(category?: CategoryDTO): void {
    this.editForm = this.fb.group({
      categoryCode: [category?.categoryCode ?? '', [Validators.required, Validators.minLength(2)]],
      categoryName: [category?.categoryName ?? '', [Validators.required, Validators.minLength(2)]],
      description: [category?.description ?? ''],
      active: [category?.active ?? true],
    });
  }

  private buildAddForm(): void {
    this.addForm = this.fb.group({
      categoryCode: ['', [Validators.required, Validators.minLength(2)]],
      categoryName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      active: [null, Validators.required],
    });
  }

  // ── data loading ─────────────────────────────────────────────────────────

  loadCategories(): void {
    this.loading.set(true);

    const filter: CategoryFilterDto = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: this.searchTerm() || undefined,
      active: this.selectedStatusFilter() ?? undefined,
      sortBy: this.sortField(),
      sortOrder: this.sortOrder(),
    };

    this.categoryService
      .getPagedCategories(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.categories.set(res.data);
            this.totalRecords.set(res.pagination.totalCount);
          } else {
            this.showError('Failed to load categories', res.message);
          }
          this.loading.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not fetch categories. Please try again.');
          this.loading.set(false);
        },
      });
  }

  // ── table events ─────────────────────────────────────────────────────────

  onPage(event: any): void {
    this.currentPage.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.loadCategories();
  }

  onSort(event: any): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 'ASC' : 'DESC');
    this.currentPage.set(1);
    this.loadCategories();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onStatusFilterChange(value: boolean | null): void {
    this.selectedStatusFilter.set(value);
    this.currentPage.set(1);
    this.loadCategories();
  }

  onPageSizeChange(value: number): void {
    this.pageSize.set(value);
    this.currentPage.set(1);
    this.loadCategories();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatusFilter.set(null);
    this.currentPage.set(1);
    this.loadCategories();
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

  openEdit(category: CategoryDTO): void {
    this.selectedCategory.set(category);
    this.buildEditForm(category);
    this.editDialogVisible.set(true);
  }

  closeDialog(): void {
    this.editDialogVisible.set(false);
    this.selectedCategory.set(null);
    this.editForm.reset();
  }

  // ── CRUD operations ───────────────────────────────────────────────────────

  saveCategory(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const category = this.selectedCategory();
    if (!category) return;

    this.saving.set(true);

    const payload: CategoryDTO = {
      ...category,           // keep id, productCount, subCategoryCount, createdDate
      ...this.editForm.value,
    };

    this.categoryService
      .updateCategory(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('Category updated successfully');
            this.closeDialog();
            this.loadCategories();
          } else {
            this.showError('Update failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not update category. Please try again.');
          this.saving.set(false);
        },
      });
  }

  createCategory(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload: CategoryDTO = {
      id: 0,
      productCount: 0,
      subCategoryCount: 0,
      createdDate: undefined,
      ...this.addForm.value,
    };

    this.categoryService
      .addCategory(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess('Category created successfully');
            this.closeAddDialog();
            this.loadCategories();
          } else {
            this.showError('Create failed', res.message);
          }
          this.saving.set(false);
        },
        error: () => {
          this.showError('Error', 'Could not create category. Please try again.');
          this.saving.set(false);
        },
      });
  }

  confirmDelete(category: CategoryDTO): void {
    if (category.productCount > 0) return; // guard: button is disabled, but safety check

    this.confirmationService.confirm({
      message: `Are you sure you want to delete <strong>${category.categoryName}</strong>? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteCategory(category),
    });
  }

  private deleteCategory(category: CategoryDTO): void {
    this.categoryService
      .deleteCategory(category.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showSuccess(`"${category.categoryName}" deleted successfully`);
            this.loadCategories();
          } else {
            this.showError('Delete failed', res.message);
          }
        },
        error: () => this.showError('Error', 'Could not delete category.'),
      });
  }

  toggleStatus(category: CategoryDTO): void {
    const updated: CategoryDTO = { ...category, active: !category.active };

    this.categoryService
      .updateCategory(updated)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            const status = updated.active ? 'activated' : 'deactivated';
            this.showSuccess(`"${category.categoryName}" ${status}`);
            this.loadCategories();
          } else {
            this.showError('Toggle failed', res.message);
          }
        },
        error: () => this.showError('Error', 'Could not toggle category status.'),
      });
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  get hasActiveFilters(): boolean {
    return !!this.searchTerm() || this.selectedStatusFilter() !== null;
  }

  /** Deterministic background colour for category icon from category name */
  iconColor(name: string): string {
    const palette = [
      '#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b',
      '#ec4899', '#6366f1', '#14b8a6', '#ef4444',
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

  // ── form validation helpers ────────────────────────────────────────────────

  fieldError(field: string, formType: 'edit' | 'add' = 'edit'): boolean {
    const ctrl = formType === 'edit' ? this.editForm?.get(field) : this.addForm?.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  fieldErrorMsg(field: string, formType: 'edit' | 'add' = 'edit'): string {
    const ctrl = formType === 'edit' ? this.editForm?.get(field) : this.addForm?.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return `${this.fieldLabel(field)} is required`;
    if (ctrl.errors['minlength'])
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  private fieldLabel(field: string): string {
    const map: Record<string, string> = {
      categoryCode: 'Category Code',
      categoryName: 'Category Name',
      description: 'Description',
      active: 'Status',
    };
    return map[field] ?? field;
  }
}
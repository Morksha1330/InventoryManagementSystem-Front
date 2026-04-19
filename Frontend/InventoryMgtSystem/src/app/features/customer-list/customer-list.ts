import { ImplicitReceiver } from '@angular/compiler';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { ImportsModule } from '../../imports/imports';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../core/models/user.interface';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImportsModule],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerList implements OnInit {

  @ViewChild('dt') dt!: Table;
  editForm!: FormGroup;
  addForm!: FormGroup;

  skeletonRows = Array(8).fill(null);

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






  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  ClickEdit() {
    throw new Error('Method not implemented.');
  }
  ClickDelete() {
    throw new Error('Method not implemented.');
  }
  clearFilters() {
    this.dt.clear();
  }
  toggleStatus(user: any) {
    // Implement status toggle logic here
    console.log('Toggling status for user:', user);
  }

  openEdit(user: any) {
    // Implement edit dialog logic here
    console.log('Opening edit dialog for user:', user);
  }

  getRoleLabel(roleId: number): string {
    const roleMap: { [key: number]: string } = {
      1: 'Admin',
      2: 'User',
      3: 'Manager',
      // Add more roles as needed
    };
    return roleMap[roleId] || 'Unknown';
  }
  onPage(event: any): void {
    this.currentPage.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
  }

    onSort(event: any): void {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order === 1 ? 'ASC' : 'DESC');
    this.currentPage.set(1);
  }

    get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm() ||
      this.selectedRoleFilter() !== null ||
      this.selectedStatusFilter() !== null
    );
  }

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
      roleId: 'Role', epf_No: 'EPF No', statusId: 'Status'

    };
    return map[field] ?? field;
  }



}

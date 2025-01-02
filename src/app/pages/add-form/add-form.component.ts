import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss']
})
export class AddFormComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  formTitle = 'Add User';
  showForm = true;
  isEditMode = false;
  isSubmitting = false;
  private destroy$ = new Subject<void>();
  userId: number | null = null;
  readonly roles = ['Admin', 'Editor', 'Viewer'] as const;
  readonly statuses = ['Active', 'Inactive'] as const;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      id: ['', [Validators.required, Validators.min(1)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['Active']
    });
  }

  private checkEditMode(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.isEditMode = true;
        this.formTitle = 'Edit User';
        this.userId = userId; 
        
        this.userService.getUserById(userId).subscribe({
          next: (user) => {
            this.userForm.setValue({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status
            });
          },
          error: (error) => {
            console.error('Error loading user:', error);
            this.router.navigate(['/user-list']);
          }
        });
      }
    });
  }

  saveUser(): void {
    if (this.userForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.isSubmitting = true;
    const userData = {
      ...this.userForm.value,
      userId: this.userId,
    };

    if (this.isEditMode) {
      debugger
      this.userService.updateUser(userData.userId, userData).subscribe({
        next: () => {
          alert('User updated successfully');
          this.router.navigate(['/user-list']);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert('Error updating user');
          this.isSubmitting = false;
        }
      });
    } else {
      this.userService.addUser(userData).subscribe({
        next: () => {
          alert('User added successfully');
          this.router.navigate(['/user-list']);
        },
        error: (error) => {
          console.error('Error adding user:', error);
          alert('Error adding user');
          this.isSubmitting = false;
        }
      });
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

  closeForm(): void {
    this.router.navigate(['/user-list']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    if (errors['email']) return 'Invalid email format';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    
    return 'Invalid value';
  }
}
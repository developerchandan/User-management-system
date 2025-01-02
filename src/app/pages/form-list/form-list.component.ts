import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit {
  users: any[] = [];
  paginatedUsers: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 3;
  pages: number[] = [];
  sortField: string = '';
  sortDirection: boolean = true;
  statusFilter: string = '';
  searchTerm: string = ''; 
  filteredUsers: any[] = [];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getUserList().subscribe(
      (users) => {
        this.users = users;
        this.filteredUsers = [...this.users];
        this.calculatePagination();
        this.updatePageData();
      },
      (error) => {
        console.error('Error fetching user list:', error);
      }
    );
  }

  calculatePagination(): void {
    const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  updatePageData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePageData();
  }

  sortData(field: string): void {
    this.sortField = field;
    this.sortDirection = !this.sortDirection;
    this.filteredUsers.sort((a, b) => {
      if (a[field] < b[field]) return this.sortDirection ? -1 : 1;
      if (a[field] > b[field]) return this.sortDirection ? 1 : -1;
      return 0;
    });
    this.updatePageData();
  }

  editUser(id: any): void {
    this.router.navigateByUrl(`edit-form/${id}`);
  }

  applyFilter(): void {
    let tempUsers = [...this.users];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      tempUsers = tempUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      tempUsers = tempUsers.filter(
        (user) => user.status === this.statusFilter
      );
    }

    this.filteredUsers = tempUsers;
    this.currentPage = 1; 
    this.calculatePagination();
    this.updatePageData();
  }

  deleteUser(id: any): void {
    this.userService.updateUserStatus(id, 'Inactive').subscribe(
      (res: any) => {
        if (res && res.user && res.user.status === 'Inactive') {
          alert('User status set to Inactive');
          
          const index = this.users.findIndex(user => user._id === id);
          if (index !== -1) {
            this.users[index] = res.user;
            this.applyFilter(); 
          }
        } else {
          alert('Failed to mark user as Inactive');
        }
      },
      (error: any) => {
        console.error('Error marking user as Inactive:', error);
        alert('Failed to mark user as Inactive');
      }
    );
  }
}
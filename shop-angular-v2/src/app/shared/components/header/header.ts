import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Observable, map } from 'rxjs';
import { DecodedToken } from '../../models/auth.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: DecodedToken | null = null;
  cartCount$!: Observable<number>;
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) { }

  searchQuery: string = '';

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
    }
  }

  ngOnInit(): void {
    this.cartCount$ = this.cartService.cartCount$;
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Load cart if user is logged in and is a regular user
      if (user && !this.isAdmin && !this.isStaff) {
        this.cartService.getCart().subscribe();
      }
    });
  }

  get userEmail(): string {
    return this.currentUser?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isStaff(): boolean {
    return this.authService.isStaff();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
  }
}

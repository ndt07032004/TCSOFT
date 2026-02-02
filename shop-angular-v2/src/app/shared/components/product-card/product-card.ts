import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { getColorLabel } from '../../models/enums';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss']
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  @Output() onAddToCart = new EventEmitter<number>();

  isInCart = false;
  private cartSubscription: Subscription | null = null;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      if (cart && cart.details && this.product) {
        this.isInCart = cart.details.some(item => item.idSP === this.product.idSP);
      } else {
        this.isInCart = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const prefix = cleanPath.startsWith('images/') ? '' : 'images/products/';
    return `${environment.imageBaseUrl}/${prefix}${cleanPath}`;
  }

  getSizeLabel(size: string): string {
    return size;
  }

  getColorLabel(color: string): string {
    return getColorLabel(color as any);
  }

  addToCart(): void {
    this.onAddToCart.emit(this.product.idSP);
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((x, i) => i + 1);
  }
}

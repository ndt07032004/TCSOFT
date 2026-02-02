import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../shared/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.html',
    styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    loading = false;
    quantity = 1;
    hoverSize: string | null = null;
    visibleImage: string | undefined;
    imageLoadError: boolean = false;

    // Reviews
    reviews: Review[] = [];
    loadingReviews = false;
    newReview = {
        rating: 5,
        comment: ''
    };
    hoverRating = 0;
    submittingReview = false;

    // Related Products
    relatedProducts: Product[] = [];

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService,
        private reviewService: ReviewService,
        private toastService: ToastService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            if (id) {
                this.loadProduct(id);
                this.loadReviews(id);
            }
        });
    }

    uniqueSizes: string[] = [];
    uniqueColors: string[] = [];

    // ...

    loadProduct(id: number): void {
        this.loading = true;
        this.productService.getProductById(id).subscribe({
            next: (res) => {
                this.product = res;
                this.loading = false;
                if (this.product) {
                    this.extractVariants();
                    this.loadRelatedProducts(this.product.category, id);
                }
            },
            error: (err) => {
                console.error('Error loading product:', err);
                this.loading = false;
            }
        });
    }

    extractVariants(): void {
        if (!this.product?.variants || this.product.variants.length === 0) {
            // Fallback if no variants (standalone product)
            this.uniqueSizes = [this.product?.size as unknown as string];
            this.uniqueColors = [this.product?.color as unknown as string];
            return;
        }

        // Extract unique sizes and colors
        this.uniqueSizes = [...new Set(this.product.variants.map(v => v.size as unknown as string))];
        this.uniqueColors = [...new Set(this.product.variants.map(v => v.color as unknown as string))];

        // Ensure current product's attributes are included (should be already)
    }

    selectVariant(type: 'size' | 'color', value: any): void {
        if (!this.product?.variants) return;

        // Find best match
        let targetSize = type === 'size' ? value : this.product.size;
        let targetColor = type === 'color' ? value : this.product.color;

        const match = this.product.variants.find(v => v.size == targetSize && v.color == targetColor);

        if (match) {
            // Navigate to the matched variant
            if (match.idSP !== this.product.idSP) {
                this.router.navigate(['/shop/product', match.idSP]);
            }
        } else {
            // Try to find ANY match with the new selection
            // If checking Color, find first available Size
            if (type === 'color') {
                const firstVariantWithColor = this.product.variants.find(v => v.color == value);
                if (firstVariantWithColor) {
                    this.router.navigate(['/shop/product', firstVariantWithColor.idSP]);
                }
            }
            // If checking Size, find first available Color
            else if (type === 'size') {
                const firstVariantWithSize = this.product.variants.find(v => v.size == value);
                if (firstVariantWithSize) {
                    this.router.navigate(['/shop/product', firstVariantWithSize.idSP]);
                }
            }
        }
    }

    loadRelatedProducts(category: string, currentProductId: number): void {
        this.productService.getProducts({ Category: category }).subscribe({
            next: (res) => {
                // Filter out current product and take top 4
                this.relatedProducts = res.items
                    .filter(p => p.idSP !== currentProductId)
                    .slice(0, 4);
            },
            error: (err) => {
                console.error('Error loading related products:', err);
            }
        });
    }

    loadReviews(productId: number): void {
        this.loadingReviews = true;
        this.reviewService.getAllReviews().subscribe({
            next: (allReviews) => {
                // Filter reviews for current product
                this.reviews = allReviews.filter(r => r.idSP === productId);
                this.loadingReviews = false;
            },
            error: (err) => {
                console.error('Error loading reviews:', err);
                this.loadingReviews = false;
            }
        });
    }

    submitReview(): void {
        if (!this.product || !this.newReview.comment.trim()) {
            this.toastService.warning('Vui lòng nhập nội dung đánh giá');
            return;
        }

        this.submittingReview = true;
        const review: Review = {
            idSP: this.product.idSP,
            rating: this.getRatingEnum(this.newReview.rating),
            comment: this.newReview.comment
        };

        this.reviewService.createReview(review).subscribe({
            next: () => {
                this.toastService.success('Đánh giá của bạn đã được gửi thành công!');
                this.newReview = { rating: 5, comment: '' };
                this.loadReviews(this.product!.idSP);
                this.submittingReview = false;
            },
            error: (err) => {
                this.toastService.error('Có lỗi khi gửi đánh giá: ' + (err.error?.message || err.message));
                this.submittingReview = false;
            }
        });
    }

    getRatingEnum(rating: number): string {
        const ratingMap: { [key: number]: string } = {
            1: 'ONE',
            2: 'TWO',
            3: 'THREE',
            4: 'FOUR',
            5: 'FIVE'
        };
        return ratingMap[rating] || 'FIVE';
    }

    getRatingNumber(ratingEnum: string): number {
        const ratingMap: { [key: string]: number } = {
            'ONE': 1,
            'TWO': 2,
            'THREE': 3,
            'FOUR': 4,
            'FIVE': 5
        };
        return ratingMap[ratingEnum] || 5;
    }

    setRating(rating: number): void {
        this.newReview.rating = rating;
    }

    addToCart(): void {
        if (!this.product) return;

        this.cartService.addToCart({
            idSP: this.product.idSP,
            quantity: this.quantity
        }).subscribe({
            next: () => {
                this.toastService.success('Đã thêm vào giỏ hàng thành công!');
            },
            error: (err) => {
                this.toastService.error('Có lỗi khi thêm vào giỏ hàng: ' + (err.error?.message || err.message));
            }
        });
    }

    buyNow(): void {
        if (!this.product) return;
        this.cartService.addToCart({
            idSP: this.product.idSP,
            quantity: this.quantity
        }).subscribe({
            next: () => {
                this.router.navigate(['/cart']);
            },
            error: (err) => {
                this.router.navigate(['/cart']);
            }
        });
    }

    getImageUrl(path: string | null | undefined): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const prefix = cleanPath.startsWith('images/') ? '' : 'images/products/';
        return `${environment.imageBaseUrl}/${prefix}${cleanPath}`;
    }

    handleImageError(): void {
        this.imageLoadError = true;
    }

    getStarArray(rating: number): number[] {
        return Array(5).fill(0).map((x, i) => i + 1);
    }

    getCategoryLabel(category: string): string {
        const map: { [key: string]: string } = {
            'AO_NAM': 'Áo Nam',
            'AO_NU': 'Áo Nữ',
            'QUAN_NAM': 'Quần Nam',
            'QUAN_NU': 'Quần Nữ',
            'PHU_KIEN': 'Phụ Kiện'
        };
        return map[category] || category;
    }

    getColorLabel(color: string): string {
        const map: { [key: string]: string } = {
            'HONG': 'Hồng',
            'DEN': 'Đen',
            'TRANG': 'Trắng',
            'XANH_DUONG': 'Xanh Dương',
            'XANH_LA': 'Xanh Lá',
            'DO': 'Đỏ',
            'VANG': 'Vàng'
        };
        return map[color] || color;
    }
}

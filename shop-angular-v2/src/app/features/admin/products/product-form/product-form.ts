import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Product, ProductCreate } from '../../../../shared/models/product.model';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.html',
    styleUrls: ['./product-form.scss']
})
export class ProductFormComponent implements OnInit {
    @Input() product: Product | null = null;
    @Input() variantTemplate: Product | null = null;
    @Output() onClose = new EventEmitter<void>();
    @Output() onSubmit = new EventEmitter<void>();

    productForm: FormGroup;
    loading = false;
    selectedFile: File | null = null;

    categories = [
        { value: 'AO_NAM', label: 'Áo Nam' },
        { value: 'AO_NU', label: 'Áo Nữ' },
        { value: 'QUAN_NAM', label: 'Quần Nam' },
        { value: 'QUAN_NU', label: 'Quần Nữ' },
        { value: 'PHU_KIEN', label: 'Phụ Kiện' },
        { value: 'GIAY_DEP', label: 'Giày Dép' }
    ];

    sizes = ['M', 'L', 'XL', 'XXL'];

    colors = [
        { value: 'DEN', label: 'Đen' },
        { value: 'TRANG', label: 'Trắng' },
        { value: 'DO', label: 'Đỏ' },
        { value: 'XANH_DUONG', label: 'Xanh Dương' },
        { value: 'XANH_LA', label: 'Xanh Lá' },
        { value: 'VANG', label: 'Vàng' },
        { value: 'CAM', label: 'Cam' },
        { value: 'TIM', label: 'Tím' },
        { value: 'HONG', label: 'Hồng' },
        { value: 'NAU', label: 'Nâu' },
        { value: 'XAM', label: 'Xám' },
        { value: 'BE', label: 'Be' }
    ];

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private toastService: ToastService
    ) {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            importPrice: [0, [Validators.required, Validators.min(0)]],
            stockQuantity: [0, [Validators.required, Validators.min(0)]],
            category: ['', Validators.required],
            size: ['M', Validators.required],
            color: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit(): void {
        if (this.product) {
            this.productForm.patchValue({
                name: this.product.name,
                price: this.product.price,
                importPrice: this.product.price * 0.8,
                stockQuantity: this.product.stockQuantity,
                category: this.product.category,
                size: this.product.size,
                color: this.product.color,
                description: this.product.description
            });
        }
        else if (this.variantTemplate) {
            this.productForm.patchValue({
                name: this.variantTemplate.name,
                price: this.variantTemplate.price,
                importPrice: this.variantTemplate.price * 0.8,
                stockQuantity: 0,
                category: this.variantTemplate.category,
                size: '',
                color: '',
                description: this.variantTemplate.description
            });
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    submit(): void {
        if (this.productForm.invalid) {
            this.toastService.warning('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        this.loading = true;
        const formValue = this.productForm.value;
        const productData: ProductCreate = {
            ...formValue,
            imageFile: this.selectedFile || undefined,
            styleId: this.variantTemplate ? this.variantTemplate.styleId : undefined
        };

        if (this.product) {
            // Update existing product
            this.productService.updateProduct(this.product.idSP, productData).subscribe({
                next: () => {
                    this.toastService.success('Đã cập nhật sản phẩm!');
                    this.onSubmit.emit();
                },
                error: (err: any) => {
                    console.error('Error updating product:', err);
                    const errorMsg = err.error?.message || err.error?.title || err.message || 'Lỗi không xác định';
                    this.toastService.error('Không thể cập nhật sản phẩm:\n' + errorMsg);
                    this.loading = false;
                }
            });
        } else {
            // Create new product
            this.productService.createProduct(productData).subscribe({
                next: () => {
                    this.toastService.success('Đã thêm sản phẩm!');
                    this.onSubmit.emit();
                },
                error: (err: any) => {
                    console.error('Error creating product:', err);
                    const errorMsg = err.error?.message || err.error?.title || err.message || 'Lỗi không xác định';
                    this.toastService.error('Không thể thêm sản phẩm:\n' + errorMsg);
                    this.loading = false;
                }
            });
        }
    }

    close(): void {
        this.onClose.emit();
    }
}

import { ProductCategory, ProductSize, ProductColor } from './enums';

// Map from ProductResponseDto
export interface Product {
    idSP: number;
    name: string;
    price: number;
    stockQuantity: number;
    category: ProductCategory;
    imageUrl: string;
    size: ProductSize;
    color: ProductColor;
    description: string;
    averageRating: number;
    styleId?: string;
    variants?: ProductVariant[];
}

export interface ProductVariant {
    idSP: number;
    size: ProductSize;
    color: ProductColor;
    stockQuantity: number;
    price: number;
}

// Map from ProductCreateDto (for admin)
export interface ProductCreate {
    name: string;
    price: number;
    importPrice: number;
    stockQuantity: number;
    category: ProductCategory;
    imageFile?: File;
    size: ProductSize;
    color: ProductColor;
    description: string;
    styleId?: string;
}

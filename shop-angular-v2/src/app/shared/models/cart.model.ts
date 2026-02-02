// Cart DTOs matching backend

export interface CartResult {
    idCart: number;
    status: number;
    details: CartDetailResult[];
    totalPrice: number;
}

export interface CartDetailResult {
    idCartDetail: number;
    idSP: number;
    productName: string;
    image: string | null;
    price: number;
    quantity: number;
    subTotal: number;
}

export interface AddToCartDto {
    idSP: number;
    quantity?: number;
}

export interface UpdateCartDto {
    idSP: number;
    quantity: number;
}

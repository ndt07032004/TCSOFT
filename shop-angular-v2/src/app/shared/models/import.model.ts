export interface Import {
    idImport: number;
    importDate: string;
    idAccount: number;
    email: string;
    totalCost: number;
    details: ImportDetail[];
}

export interface ImportDetail {
    idImportDetail: number;
    idSP: number;
    productName: string;
    quantity: number;
    importPrice: number;
    subTotal: number;
}

export interface ImportCreate {
    items: ImportItemCreate[];
}

export interface ImportItemCreate {
    idSP: number;
    quantity: number;
    importPrice: number;
}

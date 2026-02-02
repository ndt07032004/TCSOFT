// User & Staff DTOs

export interface User {
    idUser: number;
    email: string;
    fullName: string;
    phone: string;
    address: string;
}

export interface UserCreate {
    email: string;
    password?: string;
    fullName: string;
    phone: string;
    address: string;
}

export interface UserUpdate {
    fullName: string;
    phone: string;
    address: string;
    password?: string;
}

export interface Staff {
    idStaff: number;
    email: string;
    fullName: string;
    phone: string;
    address: string;
    salary: number;
    roleId: number;
    roleName: string;
}

export interface StaffCreate {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    address: string;
    salary: number;
    roleId: number;
}

export interface StaffUpdate {
    fullName: string;
    phone: string;
    address: string;
    password?: string;
    salary: number;
    roleId: number;
}

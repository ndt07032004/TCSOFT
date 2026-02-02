// Authentication DTOs

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    confirmPassword?: string;
    fullName?: string;
    phone?: string;
    address?: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Decoded JWT token interface
export interface DecodedToken {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string; // IdAccount
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;    // Email
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;          // RoleType
    RoleId?: string; // For Staff
    exp: number;
    jti: string;
}

export interface VerifyOtpDto {
    email: string;
    otpCode: string;
}

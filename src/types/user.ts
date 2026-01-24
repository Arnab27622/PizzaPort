export interface ExtendedUser {
    name?: string;
    email?: string;
    image?: string;
    address?: string;
    gender?: string;
    phone?: string;
    admin?: boolean;
}

export interface ProfileFormState {
    name: string;
    email: string;
    address: string;
    gender: string;
}

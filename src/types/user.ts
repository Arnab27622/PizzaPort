import { UseFormRegister, FieldErrors } from 'react-hook-form';

export interface IUser {
    name: string;
    email: string;
    password?: string;
    admin: boolean;
    banned: boolean;
    image?: string;
    address?: string;
    gender?: string;
}

export interface User extends IUser {
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export interface IUserDoc extends IUser {
    comparePassword(candidate: string): Promise<boolean>;
}

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

export interface ProfileFormProps {
    form: ProfileFormState;
    errors: FieldErrors<ProfileFormState>;
    register: UseFormRegister<ProfileFormState>;
    userImage?: string;
    preview: string | null;
    saving: boolean;
    uploadingImage: boolean;
    isFetchingLocation: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFetchLocation: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

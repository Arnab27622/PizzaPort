/**
 * This file defines the types for everything related to Users and their Profiles.
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form';

/**
 * The basic structure of a User.
 */
export interface IUser {
    name: string;
    email: string;
    password?: string;
    admin: boolean;  // True if the user is an administrator
    banned: boolean; // True if the user has been blocked
    image?: string;  // Profile picture URL
    address?: string; // Default delivery address
    gender?: string;
    phone?: string;
}

/**
 * A user as they appear on the website (with an ID and timestamps).
 */
export interface User extends IUser {
    _id: string;      // Unique ID from the database
    createdAt: string; // Account creation date
    updatedAt: string; // Last time profile was changed
}

/**
 * Extra functions used in the Database model.
 */
export interface IUserDoc extends IUser {
    comparePassword(candidate: string): Promise<boolean>; // Checks if typed password is correct
}

/**
 * A simpler version of the user object used in various places.
 */
export interface ExtendedUser {
    name?: string;
    email?: string;
    image?: string;
    address?: string;
    gender?: string;
    phone?: string;
    admin?: boolean;
}

/**
 * The structure of the data inside the "Edit Profile" form.
 */
export interface ProfileFormState {
    name: string;
    email: string;
    address: string;
    gender: string;
    phone: string;
}

/**
 * Props for the "Profile Form" component.
 */
export interface ProfileFormProps {
    form: ProfileFormState;
    errors: FieldErrors<ProfileFormState>;
    register: UseFormRegister<ProfileFormState>;
    userImage?: string;
    preview: string | null;      // Temporary link for image preview
    saving: boolean;             // Is the "Save" button loading?
    uploadingImage: boolean;     // Is the image currently uploading?
    isFetchingLocation: boolean; // Is the GPS working?
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFetchLocation: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

/**
 * The information needed to create a new account.
 */
export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}


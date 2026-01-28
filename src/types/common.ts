export interface NavLink {
    href: string;
    label: string;
}

export interface CustomConfirmProps {
    message: string;
}

export interface SectionHeaderProps {
    subHeader: string;
    mainHeader: string;
}

export interface ConfirmDeleteProps {
    onConfirm: () => void;
    onCancel: () => void;
    itemName: string;
    isDeleting?: boolean;
}

export interface ConfirmAdminProps {
    onConfirm: () => void;
    onCancel: () => void;
    userName: string;
    isAdmin: boolean;
    isUpdating?: boolean;
}

export interface BackButtonProps {
    className?: string;
    label?: string;
    href?: string;
}

export interface LoadingSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}

export interface ConfirmModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

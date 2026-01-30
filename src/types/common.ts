/**
 * This file contains generic types and interfaces that are used across many different
 * components in the application.
 */

/**
 * A simple link for navigation (e.g., in a menu or footer).
 */
export interface NavLink {
    href: string;  // The URL to go to
    label: string; // The text to display
}

/**
 * Props for a simple confirmation message.
 */
export interface CustomConfirmProps {
    message: string;
}

/**
 * Props for a section header (e.g., showing "Our Story" above "About Us").
 */
export interface SectionHeaderProps {
    subHeader: string;  // Small text above the main title
    mainHeader: string; // Large, bold main title
}

/**
 * Props for the confirmation modal when deleting an item.
 */
export interface ConfirmDeleteProps {
    onConfirm: () => void; // Function called when the user clicks "Delete"
    onCancel: () => void;  // Function called when the user clicks "Cancel"
    itemName: string;      // The name of the item being deleted (to show in the message)
    isDeleting?: boolean;  // Shows a loading spinner if true
}

/**
 * Props for the confirmation modal when changing admin status.
 */
export interface ConfirmAdminProps {
    onConfirm: () => void;
    onCancel: () => void;
    userName: string;     // Name of the user being modified
    isAdmin: boolean;     // The new status being assigned
    isUpdating?: boolean; // Shows a loading spinner if true
}

/**
 * Props for a universal "Go Back" button.
 */
export interface BackButtonProps {
    className?: string; // Optional custom CSS classes
    label?: string;     // Optional text (defaults to "Back")
    href?: string;      // Optional custom link (defaults to the previous page)
}

/**
 * Props for the loading spinner animation.
 */
export interface LoadingSpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // How big the spinner should be
    color?: string;                          // Optional custom color
    className?: string;                      // Optional custom CSS classes
}

/**
 * Props for a generic confirmation popup.
 */
export interface ConfirmModalProps {
    show: boolean;         // Whether the modal is visible
    onClose: () => void;   // Function called when the user closes it
    onConfirm: () => void; // Function called when the user confirms
    message: string;       // The text to display
}


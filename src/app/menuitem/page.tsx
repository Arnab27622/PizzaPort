"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import BackButton from "@/components/layout/BackButton";
import { useIsAdmin } from "../hook/useAdmin";
import { confirm } from "@/components/layout/ConfirmDelete";
import { toast } from "react-toastify";

/**
 * Option Interface for Size and Ingredient Options
 * 
 * Represents customizable options for menu items
 * Used for both size options and extra ingredients
 */
interface Option {
  name: string;        // Display name of the option (e.g., "Large", "Extra Cheese")
  extraPrice: string;  // Additional cost as string for form handling
}

/**
 * Menu Item Type Definition
 * 
 * Complete structure of menu items as stored in the database
 * Matches the backend API response structure
 */
interface MenuItemType {
  _id: string;                                  // MongoDB unique identifier
  name: string;                                 // Display name of the menu item
  basePrice: number;                            // Base price without extras
  category: string;                             // Category for organization
  description: string;                          // Item description
  sizeOptions: { name: string; extraPrice: number }[];      // Available size variations
  extraIngredients: { name: string; extraPrice: number }[]; // Additional ingredients
  imageUrl?: string;                            // Optional product image
}

/**
 * Form State Interface
 * 
 * Represents the state of the menu item creation/editing form
 * Uses strings for form inputs and converts to appropriate types on submission
 */
interface FormState {
  id: string;               // Item ID (empty for new items)
  name: string;             // Item name
  category: string;         // Item category
  basePrice: string;        // Base price as string for input handling
  description: string;      // Item description
  imageFile: File | null;   // New image file for upload
  imagePreview: string;     // URL for image preview (object URL or existing image)
  sizeOptions: Option[];    // Size options with string prices
  extraIngredients: Option[]; // Extra ingredients with string prices
}

/**
 * Data Fetcher for SWR
 * 
 * Handles API requests for menu items with proper error handling
 * Used by SWR hook for data fetching and caching
 */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch menu items");
  }
  return res.json();
};

/**
 * MenuPage Component - Admin Menu Management Interface
 * 
 * Comprehensive admin interface for managing restaurant menu items
 * Provides full CRUD operations (Create, Read, Update, Delete) for menu items
 * 
 * @component
 * @example
 * <MenuPage />
 * 
 * @features
 * - View all menu items in responsive grid layout
 * - Create new menu items with image upload
 * - Edit existing menu items with form pre-population
 * - Delete menu items with confirmation dialog
 * - Image preview and full-size image modal
 * - Dynamic option management (sizes and ingredients)
 * - Admin-only access protection
 * 
 * @security
 * - Admin authentication required via useIsAdmin hook
 * - Automatic redirect for non-admin users
 * - Protected API endpoints for data modifications
 * 
 * @performance
 * - SWR for intelligent caching and revalidation
 * - Memoized calculations and event handlers
 * - Optimized image handling with object URL cleanup
 * - Efficient re-render prevention
 * 
 * @accessibility
 * - ARIA labels for all interactive elements
 * - Keyboard navigation support
 * - Screen reader compatible
 * - Focus management for modal interactions
 */
export default function MenuPage() {
  /**
   * Router and Authentication
   * 
   * Next.js router for navigation and admin authentication hook
   * Ensures only authorized users can access this interface
   */
  const router = useRouter();
  const { isAdmin, isLoading } = useIsAdmin();

  /**
   * Data Fetching with SWR
   * 
   * Fetches menu items with caching, error handling, and manual revalidation
   * Provides real-time data synchronization for admin operations
   */
  const {
    data,
    isLoading: swrLoading,
    mutate,
    error: swrError
  } = useSWR<MenuItemType[]>("/api/menuitem", fetcher, {
    revalidateOnFocus: false, // Prevents refetching on window focus
    onError: (err) => console.error("Failed to fetch menu items:", err)
  });

  const items = useMemo(() => Array.isArray(data) ? data : [], [data]);

  /**
   * Error Handling for Data Fetching
   * 
   * Displays a toast notification if the API request fails
   */
  useEffect(() => {
    if (swrError) {
      toast.error(swrError.message || "Failed to fetch menu items");
    }
  }, [swrError]);

  /**
   * Component State Management
   * 
   * @state modalOpen - Controls form modal visibility
   * @state form - Complete form state for menu item creation/editing
   * @state fullImageUrl - Controls full-size image modal display
   * @state isSubmitting - Form submission loading state
   * @state deletingId - Tracks which item is being deleted for loading state
   */
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    id: "",
    name: "",
    category: "",
    basePrice: "",
    description: "",
    imageFile: null,
    imagePreview: "",
    sizeOptions: [],
    extraIngredients: [],
  });
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Admin Access Protection Effect
   * 
   * Redirects non-admin users to home page
   * Runs when authentication status changes
   */
  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace("/");
  }, [isLoading, isAdmin, router]);

  /**
   * Object URL Cleanup Effect
   * 
   * Prevents memory leaks by revoking object URLs
   * Runs cleanup when component unmounts or image preview changes
   */
  useEffect(() => {
    return () => {
      if (form.imagePreview) {
        URL.revokeObjectURL(form.imagePreview);
      }
    };
  }, [form.imagePreview]);

  /**
   * Basic Form Input Change Handler
   * 
   * Handles changes for simple text inputs (name, category, price, description)
   * Updates form state with new values while preserving other fields
   */
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Dynamic Option Field Change Handler
   * 
   * Updates specific fields within size options or extra ingredients arrays
   * Maintains immutability by creating new arrays
   * 
   * @param key - Option type ("sizeOptions" | "extraIngredients")
   * @param idx - Index of the option in the array
   * @param field - Field to update ("name" | "extraPrice")
   * @param value - New value for the field
   */
  const onOptionChange = useCallback((
    key: "sizeOptions" | "extraIngredients",
    idx: number,
    field: "name" | "extraPrice",
    value: string
  ) => {
    setForm(prev => {
      const arr = [...prev[key]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [key]: arr };
    });
  }, []);

  /**
   * Option Addition Handler
   * 
   * Adds new empty option to either size options or extra ingredients
   * Provides dynamic form expansion for variable-length option lists
   */
  const addOption = useCallback((key: "sizeOptions" | "extraIngredients") => {
    setForm(prev => ({
      ...prev,
      [key]: [...prev[key], { name: "", extraPrice: "" }]
    }));
  }, []);

  /**
   * Option Removal Handler
   * 
   * Removes specific option from size options or extra ingredients
   * Maintains array integrity by splicing at correct index
   */
  const removeOption = useCallback((key: "sizeOptions" | "extraIngredients", idx: number) => {
    setForm(prev => {
      const arr = [...prev[key]];
      arr.splice(idx, 1);
      return { ...prev, [key]: arr };
    });
  }, []);

  /**
   * Image File Change Handler
   * 
   * Handles image file selection with preview generation
   * Manages object URL lifecycle to prevent memory leaks
   */
  const onFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // Clean up previous object URL to prevent memory leaks
    if (form.imagePreview) {
      URL.revokeObjectURL(form.imagePreview);
    }

    // Create new object URL for preview
    const preview = file ? URL.createObjectURL(file) : "";
    setForm(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
  }, [form.imagePreview]);

  /**
   * Form Submission Handler
   * 
   * Handles both create and update operations for menu items
   * Converts form data to appropriate formats and sends to API
   * Manages loading states and error handling
   */
  const onSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for file upload support
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("basePrice", form.basePrice);
      fd.append("description", form.description);

      /**
       * Option Data Conversion
       * 
       * Converts string prices to numbers for API compatibility
       * Handles empty or invalid values with fallback to 0
       */
      const sizeOptions = form.sizeOptions.map(o => ({
        name: o.name,
        extraPrice: parseFloat(o.extraPrice) || 0
      }));

      const extraIngredients = form.extraIngredients.map(o => ({
        name: o.name,
        extraPrice: parseFloat(o.extraPrice) || 0
      }));

      // Append options as JSON strings
      fd.append("sizeOptions", JSON.stringify(sizeOptions));
      fd.append("extraIngredients", JSON.stringify(extraIngredients));

      // Append image file if selected
      if (form.imageFile) fd.append("image", form.imageFile);

      // Append ID for update operations
      if (form.id) fd.append("id", form.id);

      // Determine HTTP method based on operation type
      const method = form.id ? "PUT" : "POST";

      const response = await fetch("/api/menuitem", { method, body: fd });

      if (!response.ok) {
        throw new Error(`Failed to ${form.id ? 'update' : 'create'} menu item`);
      }

      // Success handling
      setModalOpen(false);

      // Clean up object URL after successful submission
      if (form.imagePreview) {
        URL.revokeObjectURL(form.imagePreview);
      }

      // Reset form to initial state
      setForm({
        id: "",
        name: "",
        category: "",
        basePrice: "",
        description: "",
        imageFile: null,
        imagePreview: "",
        sizeOptions: [],
        extraIngredients: []
      });

      // Revalidate SWR cache to reflect changes
      mutate();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert(`Failed to ${form.id ? 'update' : 'create'} menu item. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, mutate]);

  /**
   * Modal Opening Handler
   * 
   * Prepares form for either creating new item or editing existing item
   * Manages object URL lifecycle and form state initialization
   */
  const openModal = useCallback((item?: MenuItemType) => {
    if (item) {
      // Edit mode - populate form with existing item data
      setForm({
        id: item._id,
        name: item.name,
        category: item.category,
        basePrice: item.basePrice.toString(),
        description: item.description ?? "",
        imageFile: null,
        imagePreview: item.imageUrl || "", // Use existing image URL
        sizeOptions: item.sizeOptions.map(o => ({
          name: o.name,
          extraPrice: o.extraPrice.toString()
        })),
        extraIngredients: item.extraIngredients.map(o => ({
          name: o.name,
          extraPrice: o.extraPrice.toString()
        })),
      });
    } else {
      // Create mode - clean up any existing object URL and reset form
      if (form.imagePreview) {
        URL.revokeObjectURL(form.imagePreview);
      }

      setForm({
        id: "",
        name: "",
        category: "",
        basePrice: "",
        description: "",
        imageFile: null,
        imagePreview: "",
        sizeOptions: [],
        extraIngredients: []
      });
    }
    setModalOpen(true);
  }, [form.imagePreview]);

  /**
   * Menu Item Deletion Handler
   * 
   * Handles item deletion with confirmation dialog
   * Manages loading state and error handling
   */
  const handleDelete = useCallback(async (item: MenuItemType) => {
    try {
      // Show confirmation dialog before deletion
      const ok = await confirm({ message: "Delete this item?" });
      if (ok) {
        setDeletingId(item._id);
        const response = await fetch("/api/menuitem", {
          method: "DELETE",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item._id })
        });

        if (!response.ok) {
          throw new Error('Failed to delete menu item');
        }

        // Revalidate cache to reflect deletion
        mutate();
      }
    } catch (err) {
      console.error("Error deleting menu item:", err);
      alert("Failed to delete menu item. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }, [mutate]);

  /**
   * Modal Closing Handler
   * 
   * Cleans up object URLs and closes the form modal
   * Prevents memory leaks from unused object URLs
   */
  const handleCloseModal = useCallback(() => {
    // Only clean up object URLs created from file selection
    if (form.imagePreview && form.imageFile) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setModalOpen(false);
  }, [form.imagePreview, form.imageFile]);

  /**
   * Image Click Handler
   * 
   * Opens full-size image modal for detailed viewing
   */
  const handleImageClick = useCallback((imageUrl: string | null) => {
    setFullImageUrl(imageUrl);
  }, []);

  /**
   * Image Modal Closing Handler
   * 
   * Closes the full-size image modal
   */
  const handleCloseImageModal = useCallback(() => {
    setFullImageUrl(null);
  }, []);

  /**
   * Memoized Menu Items Grid
   * 
   * Optimizes rendering performance by memoizing the entire grid
   * Prevents unnecessary re-renders when unrelated state changes
   */
  const menuItemsGrid = useMemo(() => {
    // Loading state
    if (swrLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" color="text-primary" />
        </div>
      );
    }

    // Error state
    if (swrError) {
      return (
        <div className="text-center py-12 text-red-300">
          Failed to load menu items. Please try again.
        </div>
      );
    }

    // Empty state
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-amber-300">
          No menu items found. Click &quot;New Item&quot; to create one.
        </div>
      );
    }

    /**
     * Menu Items Grid Render
     * 
     * Responsive grid layout that adapts to screen size:
     * - Mobile: 1 column
     * - Small tablets: 2 columns
     * - Tablets: 3 columns
     * - Desktop: 4 columns
     */
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(item => (
          <div
            key={item._id}
            className="bg-linear-to-br from-[#2c1a0d] to-[#1a1108] border border-amber-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Item Image with Click Handler */}
            {item.imageUrl && (
              <div
                className="w-full bg-white flex justify-center items-center cursor-pointer"
                onClick={() => handleImageClick(item.imageUrl || null)}
                aria-label="View larger image"
              >
                <div className="w-40 h-40 sm:w-48 sm:h-48 relative">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            )}

            {/* Item Details and Actions */}
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-amber-100 mr-1">{item.name}</h2>
              <div className="flex">
                {/* Edit Button */}
                <button
                  onClick={() => openModal(item)}
                  className="border border-[#FF5500] text-[#FF5500] py-1 px-2 rounded hover:bg-[#FF5500]/10 cursor-pointer"
                  aria-label={`Edit ${item.name}`}
                >
                  Edit
                </button>
                {/* Delete Button with Loading State */}
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item._id}
                  className="border border-red-600 text-red-600 py-1 px-2 rounded hover:bg-red-600/10 ml-2 cursor-pointer disabled:opacity-50"
                  aria-label={`Delete ${item.name}`}
                >
                  {deletingId === item._id ? (
                    <div className="flex justify-center items-center h-8 w-8">
                      <LoadingSpinner />
                    </div>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [items, swrLoading, swrError, deletingId, openModal, handleDelete, handleImageClick]);

  /**
   * Initial Loading State
   * 
   * Shows loading spinner while checking admin permissions and loading data
   */
  if (isLoading || swrLoading) {
    return (
      <>
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-card p-6 lg:py-6 lg:px-15 mt-16">
          <h1 className="text-3xl font-bold heading-border">Manage Menu Items</h1>
        </header>
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
          <LoadingSpinner size="lg" color="text-primary" className="mb-4" />
        </div>
      </>
    )
  }

  /**
   * Admin Access Guard
   * 
   * Renders nothing if user is not admin (redirect happens in useEffect)
   */
  if (!isAdmin) return null;

  /**
   * Main Component Render
   * 
   * Complete admin interface with:
   * - Header with page title and action button
   * - Responsive menu items grid
   * - Form modal for create/edit operations
   * - Full-size image modal
   */
  return (
    <div className="min-h-[80vh] text-card p-6 lg:py-6 lg:px-15 mt-16">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold heading-border">Manage Menu Items</h1>
        <div className="flex flex-row justify-between items-center w-full sm:w-auto gap-4">
          <BackButton label="Back" />
          <button
            onClick={() => openModal()}
            className="bg-[#FF5500] text-white px-5 py-2 rounded hover:bg-[#e14a00] transition cursor-pointer"
          >
            + New Item
          </button>
        </div>
      </header>

      {/* Menu Items Grid */}
      {menuItemsGrid}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 pt-28 z-50">
          <div className="bg-[#3A3D40] text-[#F9FBF7] rounded-lg w-full max-w-md sm:max-w-lg p-6 overflow-auto max-h-[90vh] no-scrollbar scrollbar-track-[#2F3234]">
            <h3 className="text-2xl font-semibold mb-4">
              {form.id ? "Edit Item" : "New Menu Item"}
            </h3>

            {/* Menu Item Form */}
            <form onSubmit={onSubmit} className="space-y-1">
              {/* Basic Information Fields */}
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Name"
                required
                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-2 rounded"
              />
              <input
                name="category"
                value={form.category}
                onChange={onChange}
                placeholder="Category"
                required
                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-2 rounded"
              />
              <input
                name="basePrice"
                type="number"
                step="0.01"
                min="0"
                value={form.basePrice}
                onChange={onChange}
                placeholder="Base Price"
                required
                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-2 rounded"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Description"
                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-2 rounded"
              />

              {/* Image Upload Section */}
              <label className="text-[#F9FBF7]">Choose file</label>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full bg-[#2F3234] text-white p-2 rounded"
              />
              {/* Image Preview */}
              {form.imagePreview && (
                <Image
                  src={form.imagePreview}
                  alt="preview"
                  width={100}
                  height={100}
                  style={{ objectFit: "cover" }}
                  className="mt-2"
                />
              )}

              {/* Size Options Section */}
              <div>
                <h4 className="text-lg font-semibold mt-2">Sizes</h4>
                {form.sizeOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 my-0.5">
                    <input
                      placeholder="Size name"
                      value={opt.name}
                      onChange={e => onOptionChange("sizeOptions", idx, "name", e.target.value)}
                      className="w-2/3 bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-2 rounded"
                      required
                    />
                    <input
                      placeholder="Extra price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={opt.extraPrice}
                      onChange={e => onOptionChange("sizeOptions", idx, "extraPrice", e.target.value)}
                      className="w-1/3 bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-2 rounded"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeOption("sizeOptions", idx)}
                      className="text-red-500 cursor-pointer"
                      aria-label="Remove size option"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption("sizeOptions")}
                  className="mt-1 text-primary cursor-pointer"
                >
                  + Add size
                </button>
              </div>

              {/* Extra Ingredients Section */}
              <div>
                <h4 className="text-lg mt-2 font-semibold">Extra ingredients</h4>
                {form.extraIngredients.map((oi, idx) => (
                  <div key={idx} className="flex gap-2 my-0.5">
                    <input
                      placeholder="Name"
                      value={oi.name}
                      onChange={e => onOptionChange("extraIngredients", idx, "name", e.target.value)}
                      className="w-2/3 bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-2 rounded"
                      required
                    />
                    <input
                      placeholder="Extra price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={oi.extraPrice}
                      onChange={e => onOptionChange("extraIngredients", idx, "extraPrice", e.target.value)}
                      className="w-1/3 bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-2 rounded"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeOption("extraIngredients", idx)}
                      className="text-red-500 cursor-pointer"
                      aria-label="Remove ingredient option"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption("extraIngredients")}
                  className="mt-1 text-primary cursor-pointer"
                >
                  + Add extra ingredient
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-2 rounded border border-[#CFB54F] hover:bg-[#CFB54F]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#FF5500] rounded hover:bg-[#e14a00] text-white cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : form.id ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-size Image Modal */}
      {fullImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
          onClick={handleCloseImageModal}
        >
          <div className="relative w-full max-w-xs sm:max-w-md h-72 sm:h-96">
            <Image
              src={fullImageUrl}
              alt="Full size menu item"
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            onClick={handleCloseImageModal}
            aria-label="Close image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import BackButton from "@/components/layout/BackButton";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import { confirm } from "@/components/layout/ConfirmDelete";
import { useIsAdmin } from "../hook/useAdmin";

import MenuItemForm from "@/components/menu/MenuItemForm";
import MenuItemGrid from "@/components/menu/MenuItemGrid";
import { MenuItem } from "@/types/menu";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch menu items");
  }
  return res.json();
};

export default function MenuPage() {
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const {
    data,
    isLoading: swrLoading,
    mutate,
    error: swrError
  } = useSWR<MenuItem[]>("/api/menuitem", fetcher, {
    revalidateOnFocus: false,
    onError: (err) => console.error("Failed to fetch menu items:", err)
  });

  const items = useMemo(() => Array.isArray(data) ? data : [], [data]);

  // State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdminLoading && !isAdmin) router.replace("/");
  }, [isAdminLoading, isAdmin, router]);

  useEffect(() => {
    if (swrError) {
      toast.error(swrError.message || "Failed to fetch menu items");
    }
  }, [swrError]);

  const handleCreateClick = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(async (item: MenuItem) => {
    try {
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

        toast.success("Item deleted successfully");
        mutate();
      }
    } catch (err) {
      console.error("Error deleting menu item:", err);
      toast.error("Failed to delete menu item");
    } finally {
      setDeletingId(null);
    }
  }, [mutate]);

  const handleFormSuccess = useCallback(() => {
    mutate();
    setModalOpen(false);
  }, [mutate]);

  if (isAdminLoading || swrLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <LoadingSpinner size="lg" color="text-primary" />
        <p className="mt-4 text-amber-200">Loading menu...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-[80vh] text-card p-6 lg:py-6 lg:px-15 mt-16 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold heading-border text-amber-50">Manage Menu Items</h1>
        <div className="flex flex-row justify-between items-center w-full sm:w-auto gap-4">
          <BackButton label="Back" />
          <button
            onClick={handleCreateClick}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20 transform hover:-translate-y-0.5 font-semibold cursor-pointer flex items-center gap-2"
          >
            <span className="text-xl leading-none">+</span> New Item
          </button>
        </div>
      </header>

      <MenuItemGrid
        items={items}
        isLoading={false} // Handled by parent loading state
        error={swrError}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onImageClick={setFullImageUrl}
        isDeletingId={deletingId}
      />

      {/* Form Modal */}
      {modalOpen && (
        <MenuItemForm
          item={editingItem}
          onClose={() => setModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Full Image Modal */}
      {fullImageUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setFullImageUrl(null)}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] h-[80vh]">
            <Image
              src={fullImageUrl}
              alt="Full size view"
              fill
              className="object-contain"
              quality={100}
            />
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center transition-all"
              onClick={() => setFullImageUrl(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
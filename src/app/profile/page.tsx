/**
 * This is the Profile Page.
 * 
 * It shows the logged-in user's details (Name, Email, Address, etc.).
 * It uses the <ProfileForm> component to let them edit and save changes.
 */

'use client';

import React from 'react';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import BackButton from '@/components/layout/BackButton';
import ProfileForm from '@/components/profile/ProfileForm';
import { useProfile } from '@/hooks/useProfile';
import { ExtendedUser } from '@/types/user';

export default function ProfilePage() {
    const {
        form,
        errors,
        register,
        preview,
        saving,
        uploadingImage,
        isFetchingLocation,
        session,
        status,
        handleFileChange,
        fetchUserLocation,
        handleSubmit
    } = useProfile();

    if (status === 'loading' && !session) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <LoadingSpinner size="lg" color="text-primary" />
            </div>
        );
    }

    if (!session?.user) return null;

    const user = session.user as ExtendedUser;

    return (
        <main className="min-h-screen pb-12 pt-20 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="relative mb-8 overflow-hidden rounded-3xl bg-linear-to-r from-amber-900/40 to-primary/20 p-8 md:p-12 border border-white/5 shadow-2xl backdrop-blur-md">
                    <div className="relative z-10">
                        <div className="mb-4">
                            <BackButton />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                            Account <span className="text-primary">Settings</span>
                        </h1>
                        <p className="text-amber-100/70 text-lg max-w-md">
                            Manage your personal information, address, and profile preferences.
                        </p>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
                </div>

                {/* Main Content Card */}
                <div className="bg-[#151515]/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/5 shadow-2xl">
                    <ProfileForm
                        form={form}
                        errors={errors}
                        register={register}
                        userImage={user.image}
                        preview={preview}
                        saving={saving}
                        uploadingImage={uploadingImage}
                        isFetchingLocation={isFetchingLocation}
                        onFileChange={handleFileChange}
                        onFetchLocation={fetchUserLocation}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </main>
    );
}

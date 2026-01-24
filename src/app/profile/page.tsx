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

    if (status === 'loading') {
        return (
            <div className="max-w-xl mx-auto mt-20 mb-8 p-6 flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" color="text-primary" />
            </div>
        );
    }

    if (!session?.user) return null;

    const user = session.user as ExtendedUser;

    return (
        <section className="max-w-xl mx-auto mt-20 mb-8 p-6 md:bg-[#1a1108]/60 md:rounded-2xl md:shadow-lg bg-transparent backdrop-blur-xs border border-transparent md:border-amber-900/30">
            <div className="mb-6">
                <BackButton />
            </div>

            <h1 className="text-3xl font-semibold text-primary mb-6 heading-border">Your Profile</h1>

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
        </section>
    );
}

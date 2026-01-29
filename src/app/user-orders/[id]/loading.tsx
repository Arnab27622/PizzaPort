import LoadingSpinner from "@/components/icons/LoadingSpinner";

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 min-h-[80vh]">
            <div className="flex flex-col items-center justify-center mt-32">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-200">Loading your order details...</p>
            </div>
        </div>
    );
}

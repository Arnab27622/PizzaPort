import LoadingSpinner from '@/components/icons/LoadingSpinner';

export default function BackgroundLoader() {
    return (
        <div className="fixed inset-0 bg-linear-to-b from-orange-500 to-red-700 z-50 flex items-center justify-center pt-15">
            <div className="text-center flex flex-col items-center justify-center">
                <div className="min-h-40 flex items-center justify-center">
                    <LoadingSpinner size="lg" color="text-yellow-400" />
                </div>
                <p className="text-white font-semibold mt-4 text-xl">Preparing your pizza experience...</p>
            </div>
        </div>
    );
}
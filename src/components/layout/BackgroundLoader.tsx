export default function BackgroundLoader() {
    return (
        // Full-screen overlay container with gradient background
        // Uses fixed positioning to cover entire viewport
        // High z-index to ensure it appears above other content
        // Flex container to center content vertically and horizontally
        <div className="fixed inset-0 bg-gradient-to-b from-orange-500 to-red-700 z-50 flex items-center justify-center pt-15">
            <div className="text-center">
                {/* Spinning loader animation */}
                {/* Circular element with border styling
                 Transparent top border creates the "gap" for spinner effect
                 Rounded-full makes it circular
                 animate-spin class provides the rotation animation
                */}
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>

                {/* Loading text */}
                {/* White text with semi-bold font weight
                 Top margin for spacing from the spinner
                 Larger text size for better visibility
                */}
                <p className="text-white font-semibold mt-4 text-xl">Preparing your pizza experience...</p>
            </div>
        </div>
    );
}
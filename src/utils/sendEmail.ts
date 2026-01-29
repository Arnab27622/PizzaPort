import emailjs from "@emailjs/browser";

/**
 * Email utility function for sending contact form messages
 * 
 * @function sendEmail
 * @async
 * @description 
 * - Sends email messages using EmailJS service
 * - Formats date and time for the email template
 * - Uses predefined template with contact form data
 * - Handles both sender and recipient information
 * 
 * @param {Object} params - Email parameters object
 * @param {string} params.name - Sender's name
 * @param {string} params.email - Sender's email address
 * @param {string} params.message - Message content
 * 
 * @returns {Promise<emailjs.EmailJSResponseStatus>} EmailJS response object
 * 
 * @throws {Error} When EmailJS service fails or environment variables are missing
 * 
 * @example
 * try {
 *   await sendEmail({
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     message: 'Hello, I have a question about...'
 *   });
 *   console.log('Email sent successfully');
 * } catch (error) {
 *   console.error('Failed to send email:', error);
 * }
 */
export const sendEmail = async ({ name, email, message }: {
    name: string;
    email: string;
    message: string
}) => {
    /**
     * Current timestamp for email tracking
     * @constant {Date}
     */
    const now = new Date();

    /**
     * Formatted date string in locale-specific format
     * @constant {string}
     */
    const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    /**
     * Formatted time string in 12-hour format
     * @constant {string}
     */
    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    /**
     * Send email using EmailJS service
     * @description
     * - Uses environment variables for service configuration
     * - Populates template with form data and timestamps
     * - Includes reply-to header for easy response handling
     */
    return emailjs.send(
        // EmailJS service ID from environment variables
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        // EmailJS template ID from environment variables
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        // Template parameters
        {
            from_name: name,
            to_name: "Pizza Delivery Support",
            from_email: email,
            to_email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@pizzadelivery.com",
            message,
            reply_to: email,
            date,
            time,
        },
        // EmailJS public key from environment variables
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
};
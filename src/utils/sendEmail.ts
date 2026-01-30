import emailjs from "@emailjs/browser";

/**
 * Sends an email using the EmailJS service.
 * This is used when someone fills out the contact form on the website.
 * It takes their name, email, and message, and sends it to our support team.
 */
export const sendEmail = async ({ name, email, message }: {
    name: string;
    email: string;
    message: string
}) => {
    // Get the current date and time
    const now = new Date();

    // Format the date nicely (e.g., "January 30, 2026")
    const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Format the time nicely (e.g., "12:30 PM")
    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Send the email using EmailJS
    return emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
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
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
};
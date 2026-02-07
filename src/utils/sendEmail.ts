
/**
 * Sends an email using the backend API route.
 * This is used when someone fills out the contact form on the website.
 * It takes their name, email, and message, and sends it via Nodemailer on the server.
 */
export const sendEmail = async ({ name, email, message }: {
    name: string;
    email: string;
    message: string
}) => {
    const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
    });

    if (!response.ok) {
        throw new Error('Failed to send email');
    }

    return response.json();
};
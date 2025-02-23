import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

export async function sendWithSendGrid(email, token) {
    if (!process.env.SENDGRID_API_KEY) {
        console.error("SENDGRID_API_KEY is missing!");
        return;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const verificationLink = `http://localhost:3000/api/users/verify/${token}`;

    const msg = {
        to: email,
        from: 'anca.sab@outlook.com',
        subject: 'Verify your email',
        text: `Click the link to verify your email: ${verificationLink}`,
        html: `
            <p>Hello from <strong>ProductApp</strong>!</p>
            <p>Click the link below to verify your account:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${verificationLink}</p>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error.response?.body || error);
    }
}



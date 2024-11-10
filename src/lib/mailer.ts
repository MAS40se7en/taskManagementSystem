import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.APP_PASSWORD,
    }
});

export async function sendVerificationEmail(to: any, code: any) {
    const mailOptions = {
        from: `"Task Manager App" <${process.env.GMAIL_USER}`,
        to,
        subject: 'Verify you email address',
        text: `Thank you for registering. Use this verification code to complete you registration: ${code}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}
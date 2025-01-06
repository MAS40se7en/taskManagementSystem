import { json } from "@sveltejs/kit";
import { prisma } from "$lib/prisma.js";
import { sendPaymentConfirmationEmail } from "$lib/mailer.js";

export async function POST({ request, locals }) {
    const { userEmail, invoiceUrl } = await request.json();
    const { user } = locals;

    if (!user) {
        return json({ message: 'unauthorized' });
    }

    try {
        if (userEmail) {
            const updateduser = await prisma.user.update({
                where: { email: userEmail },
                data: { upgraded: true },
            });

            console.log(`User ${userEmail} upgraded successfully!`);

            sendPaymentConfirmationEmail(updateduser.email, invoiceUrl);

            return json({ message: 'subscription integrated' });
        } else {
            return json({ message: 'error getting your data' });
        }
    } catch (error) {
        console.error(error);
        return json({ message: 'error occurred' });
    }
}

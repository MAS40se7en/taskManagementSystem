import { json } from "@sveltejs/kit";
import Stripe from "stripe";
import { prisma } from "$lib/prisma.js";
import { stripe } from "$lib/server/stripe";
import { sendPaymentConfirmationEmail } from "$lib/mailer.js";

export async function POST({ request }) {
    const signature = request.headers.get('stripe-signature') ?? '';
    const body = await request.text(); // Keep the raw body as-is.
    const whSecret = `${process.env.STRIPE_WEBHOOK}`;

    console.log("request headers:", request.headers);
    console.log("signature", signature)
    console.log("body: ", body);

    const event = stripe.webhooks.constructEvent(body, signature, whSecret);
    console.log(event);
    if (event.type === 'checkout.session.completed') {
        const sessionWithCustomer = await stripe.checkout.sessions.retrieve(
            event.data.object.id,
            { expand: ['customer', 'invoice'] }
        );

        const invoice = sessionWithCustomer.invoice as Stripe.Invoice;
        const invoiceUrl = invoice.hosted_invoice_url as string;
        const orderId = sessionWithCustomer.payment_intent as string;

        console.log('orderId: ', orderId);

        const userEmail = sessionWithCustomer.customer_email as string;
        if (userEmail) {
            const updateduser = await prisma.user.update({
                where: { email: userEmail },
                data: { upgraded: true },
            });

            console.log(`User ${userEmail} upgraded successfully!`);

            sendPaymentConfirmationEmail(updateduser.email, invoiceUrl);
        }
    }

    return json({ response: "All good" });
}

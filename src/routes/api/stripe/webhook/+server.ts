import { json } from "@sveltejs/kit";
import Stripe from "stripe";
import { prisma } from "$lib/prisma.js";
import { stripe } from "$lib/server/stripe";

export async function POST({ request }) {
    const signature = request.headers.get('stripe-signature') ?? '';
    const body = await request.text(); // Keep the raw body as-is.
    const whSecret = `${process.env.STRIPE_WEBHOOK}`;

    console.log("request headers:", request.headers);
    console.log("signature", signature)
    console.log("body: ", body);

    try {
        if (!signature) {
            console.error('Missing signature');
            return new Response(JSON.stringify({ message: 'Missing signature' }), { status: 400 });
        }

        // Verify the webhook signature
        const event = stripe.webhooks.constructEvent(body, signature, whSecret);

        // Handle the event
        const eventType = event.type;

        if (eventType === 'checkout.session.completed') {
            const sessionWithCustomer = await stripe.checkout.sessions.retrieve(
                event.data.object.id,
                { expand: ['customer', 'invoice'] }
            );

            const customer = sessionWithCustomer.customer as Stripe.Customer;
            const invoice = sessionWithCustomer.invoice as Stripe.Invoice;

            const userEmail = sessionWithCustomer.customer_email as string;
            if (userEmail) {
                const updateduser = await prisma.user.update({
                    where: { email: userEmail },
                    data: { upgraded: true },
                });

                console.log(`User ${userEmail} upgraded successfully!`);

                await prisma.upgradedUsers.create({
                    data: {
                        customerId: customer.id,
                        orderId: sessionWithCustomer.payment_intent as string,
                        userId: updateduser.id,
                        sessionId: sessionWithCustomer.id,
                        invoiceUrl: invoice.hosted_invoice_url as string,
                    },
                });
            }
        }

        return json({ received: true });
    } catch (err) {
        console.error('Webhook error: ', err);
        return json({ error: 'Webhook verification failed' }, { status: 400 });
    }
}

import { stripe } from "$lib/server/stripe";
import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
    const { user } = locals;
    const priceId = `${process.env.STRIPE_PRICE_ID}`;

    if (!user || !user.isVerified) {
        return json({ message: 'unauthorized' });
    }

    try {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name
        });

        const ephemeralKey = await stripe.ephemeralKeys.create(
            {
                customer: customer.id
            },
            { apiVersion: '2024-11-20.acacia' },
        )

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }], // Use the recurring price ID from Stripe
            payment_behavior: 'default_incomplete', // Ensure payment is collected
            expand: ['latest_invoice.payment_intent'], // Expand to access the PaymentIntent
            metadata: {
                userId: user.id // Add metadata for tracking
            }
        });

        const invoiceUrl = subscription.latest_invoice?.hosted_invoice_url;
        const payment_intent = subscription.latest_invoice?.payment_intent;

        console.log(subscription, ephemeralKey, customer.id, payment_intent);

        return json({
            invoiceUrl,
            paymentIntent: payment_intent.client_secret,
            user
        })
    } catch (error) {
        console.error(error);
        return json({ message: 'error' })
    }

}
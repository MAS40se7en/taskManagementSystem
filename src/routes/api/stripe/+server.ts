import { stripe } from "$lib/server/stripe";
import { json, redirect } from "@sveltejs/kit";

export async function POST({ url, locals, request }) {
    const { user } = locals;
    const { mode } = await request.json();

    if (!user || !user.isVerified) {
        return json({ message: 'unauthorized' });
    }


    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1
            }
        ],
        mode,
        success_url: `${url.origin}/protected/upgrade/checkout/success`,
        cancel_url: `${url.origin}/protected/upgrade/checkout/failure`
    });

    return json({ sessionId: session.id });

}
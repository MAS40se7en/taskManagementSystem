import { stripe } from "$lib/server/stripe";
import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
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
        success_url: "https://task-management-system-steel.vercel.app/protected/upgrade/checkout/success",
        cancel_url: "https://task-management-system-steel.vercel.app/protected/upgrade/checkout/failure"
    });

    return json({ checkoutUrl: session.url });

}
import { json } from "@sveltejs/kit";
import Stripe from "stripe";
import { prisma } from "$lib/prisma.js";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

export async function POST({ request }) {
    const sig = request.headers.get('stripe-signature');
    const rawBody = await request.text();

    try {
        if (!sig) {
            console.log('error occurred, sig:', sig);
            return new Response(JSON.stringify({
                message: 'error Occurred'
            }), 
                { status: 400 }
            )
        }
        const event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            `${process.env.STRIPE_WEBHOOK_SECRET}`
        )

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            const userId = session.metadata?.userId;
            if (userId) {
                await prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        upgraded: true
                    }
                });
                console.log(`User ${userId} upgraded successfully!`);
            }
        }

        return json({ received: true });
    } catch (error) {
        console.log('Webhook error: ', error);
        return json({ error: 'Webhook verification failed' }, { status: 400 });
    }
}
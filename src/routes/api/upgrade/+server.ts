import { json } from "@sveltejs/kit";
import Stripe from "stripe";
import { prisma } from "$lib/prisma.js";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

export async function POST({request, locals}) {
    const { user } = locals;
    const { priceId, mode } = await request.json();

    if (!user) {
        return json({ message: 'unauthorized' });
    }

    console.log(priceId)
    console.log(mode)

    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }
        })
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            mode,
            success_url: `${process.env.BASE_URL}/protected/upgrade/checkout/success`,
            cancel_url: `${process.env.BASE_URL}/protected/upgrade/checkout/failure`
        });

        if (session.status === 'complete') {
            await prisma.user.update({
                where: {
                    id: currentUser?.id
                },
                data: {
                    upgraded: true
                }
            })
        }

        return json({ sessionId: session.id });
    } catch(error) {
        console.error(error);
        return json({error});
    }
}
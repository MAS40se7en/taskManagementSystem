import { stripe } from "$lib/server/stripe";
import { json } from "@sveltejs/kit";

export async function POST({ locals }) {
    const { user } = locals;
    //const { mode } = await request.json();

    if (!user || !user.isVerified) {
        return json({ message: 'unauthorized' });
    }

    try {
        const customer = await stripe.customers.create();
        const ephemeralKey = await stripe.ephemeralKeys.create(
            {
                customer: customer.id
            },
            {apiVersion: '2024-11-20.acacia'}
        )

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 399,
            currency: 'eur',
            customer: customer.id,
            payment_method_types: ['card']
        })
    

        console.log(paymentIntent, ephemeralKey, customer.id);



    /*const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1
            }
        ],
        mode,
        success_url: `${process.env.STRIPE_SUCCESS_URL}`,
        cancel_url: `${process.env.STRIPE_FAILURE_URL}`
    });*/

    //return json({ checkoutUrl: session.url });
    return json({ 
        paymentIntent: paymentIntent.client_secret, 
        ephemeralKey: ephemeralKey.secret, 
        customerId: customer.id
    })
    } catch(error) {
        console.error(error);
        return json({ message: 'error' })
    }

}
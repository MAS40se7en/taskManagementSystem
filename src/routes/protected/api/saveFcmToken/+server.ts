import { prisma } from "$lib/prisma";

export async function POST({ request }) {
    const data = await request.json();

    const user = data.user;
    const token = data.token

    try {
        const newUser = await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            deviceFcmToken: token
          }
        })
    
        console.log('token saved successfully');
        return new Response(JSON.stringify({ message: 'token saved!', newUser }), { status: 200 });
      } catch (error) {
        console.error(error);
      }
}
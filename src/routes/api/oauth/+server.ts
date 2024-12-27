import { lucia } from "$lib/server/auth";
import { OAuth2RequestError } from "arctic";
import { prisma } from "$lib/prisma.js";

export async function POST({ request, cookies }) {
    const { response, accessToken, refreshToken } = await request.json();


    const user = response.user;
    console.log(user);


    try {
        const userData = {
            name: user.displayName,
            email: user.email,
            image: user.photoURL,
            googleId: user.uid,
            refreshToken,
            accessToken
        }

        console.log("User data:", userData);

        const existingGoogleUser = await prisma.user.findUnique({
            where: {
                googleId: userData.googleId
            }
        });

        const existingUserEmail = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        })

        let newUserData;
        if (existingGoogleUser) {
            newUserData = await prisma.user.update({
                where: {
                    email: existingGoogleUser.email
                },
                data: {
                    refreshToken: userData.refreshToken,
                    accessToken: userData.accessToken
                }
            });
        } else if (existingUserEmail) {
            newUserData = await prisma.user.update({
                where: {
                    email: userData.email
                },
                data: {
                    googleId: userData.googleId,
                    refreshToken: userData.refreshToken,
                    accessToken: userData.accessToken
                }
            });
        } else {
            newUserData = await prisma.user.create({
                data: {
                    email: userData.email, // Using email as username
                    googleId: userData.googleId,
                    name: userData.name, // Name field may not always be present, handle accordingly
                    refreshToken: userData.refreshToken,
                    accessToken: userData.accessToken
                }
            });
        }

        if (newUserData) {
            const session = await lucia.createSession(newUserData.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes
            });
            console.log(newUserData)

            return new Response(JSON.stringify({ newUserData }), {
                status: 302,
                headers: {
                    location: '/protected'
                }
            });
        }
    } catch (e) {
        if (e instanceof OAuth2RequestError) {
            console.error(e);
            return new Response(null, {
                status: 400
            });
        }
        console.log(e)
        return new Response(null, {
            status: 500
        });
    }
}
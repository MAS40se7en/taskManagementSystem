import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { google } from 'googleapis';
import { prisma } from '$lib/prisma';

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const { tasks, user } = data;

    if (!user.accessToken) {
        return json(
            { message: 'Access token or refresh token missing.' },
            { status: 400 }
        );
    }

    if (!tasks?.length) {
        return json({ message: 'No tasks or projects provided.' }, { status: 400 });
    }

    try {
        // Initialize OAuth2Client
        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        // Set the user's access and refresh tokens
        oAuth2Client.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.accessToken
        });

        console.log('oauth client initialised: ', oAuth2Client.credentials);

        if (!oAuth2Client.credentials.expiry_date || oAuth2Client.credentials.expiry_date < Date.now()) {
            const tokens = await oAuth2Client.refreshAccessToken();
            const newAccessToken = tokens.credentials.access_token;
      
            // Update the user's access token in the database
            await prisma.user.update({
              where: { id: user.id },
              data: { accessToken: newAccessToken },
            });
      
            // Update the OAuth2 client credentials
            oAuth2Client.setCredentials({
              access_token: newAccessToken,
            });
          }

        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

        const taskResponses: any[] = [];

        // Process tasks
        for (const task of tasks || []) {
            const eventTask = await prisma.task.findUnique({
                where: { id: task.id },
                include: { createdBy: true },
            });

            if (!eventTask) {
                return json({ message: `Task with ID ${task.id} not found` }, { status: 404 });
            }

            const startDateTime = eventTask.startsAt || eventTask.deadline || new Date();
            const endDateTime =
                eventTask.endsAt || new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000);

            const timeZone =
                Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';

            const event = {
                summary: eventTask.title,
                description: eventTask.description,
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: timeZone,
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: timeZone,
                },
                attendees: [{ email: eventTask.createdBy?.email }], // Optional attendees
            };

            const taskResponse = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });

            taskResponses.push(taskResponse.data); // Access the resolved `data`

            await prisma.task.update({
                where: {
                    id: eventTask.id
                },
                data: {
                    googleCalendar: true
                }
            })
        }

        return json({
            message: 'Events created successfully!',
            taskEvents: taskResponses,
        });
    } catch (error) {
        console.error('Error creating calendar event:', error);
        return json({ message: 'Error creating event', error: error }, { status: 500 });
    }
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { google } from 'googleapis';
import { prisma } from '$lib/prisma';

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const { task, user } = data;

  if (!user.accessToken || !user.refreshToken) {
    return json(
      { message: 'Access token or refresh token missing. Please reauthorize.' },
      { status: 400 }
    );
  }

  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    oAuth2Client.setCredentials({
      access_token: user.accessToken,
    });

    // Refresh the access token if expired
    if (!oAuth2Client.credentials.expiry_date || oAuth2Client.credentials.expiry_date < Date.now()) {
      const { token } = await oAuth2Client.getAccessToken();
      if (!token) throw new Error('Failed to refresh access token.');

      // Update the user's access token in the database
      await prisma.user.update({
        where: { id: user.id },
        data: { accessToken: token },
      });

      // Update OAuth2 client credentials
      oAuth2Client.setCredentials({
        access_token: token,
      });
    }

    // Fetch task details
    const eventTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: { createdBy: true },
    });

    if (!eventTask) {
      return json({ message: 'Task not found' }, { status: 404 });
    }

    const startDateTime = eventTask.startsAt || eventTask.deadline || new Date();
    const endDateTime =
      eventTask.endsAt || eventTask.deadline || new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';

    // Create a calendar event
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const event = {
      summary: eventTask.title,
      description: eventTask.description,
      start: { dateTime: startDateTime.toISOString(), timeZone },
      end: { dateTime: endDateTime.toISOString(), timeZone },
      attendees: [{ email: eventTask.createdBy?.email }],
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    await prisma.task.update({
      where: {
        id: eventTask.id
      },
      data: {
        googleCalendar: true
      }
    })

    return json({ message: 'Event created successfully!', event: response.data });
  } catch (error: any) {
    console.error('Error creating calendar event:', JSON.stringify(error, null, 2));
    return json({ message: 'Error creating event', error: error.message }, { status: 500 });
  }
};

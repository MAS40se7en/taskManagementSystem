<<<<<<< HEAD
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

export async function GET({ locals }) {
	if (!locals.session) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	const user = locals.user;

	return new Response(
		JSON.stringify({
      message: 'data retrieved',
			user
		}),
		{ status: 200 }
	);
}

export async function POST({ request, locals }) {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const data = await request.formData();
	const image = data.get('image') as string | null;

	if (!image) {
		return json({ message: 'No image provided' }, { status: 401 });
	}

	let savedImagePath: string | null = null;

	if (image) {
		const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
		const buffer = Buffer.from(base64Data, 'base64');

		const fileName = `${Date.now()}-task-image.png`;
		const filePath = path.join('static/uploads/pfp', fileName);

		fs.writeFileSync(filePath, buffer);

		savedImagePath = `/uploads/pfp/${fileName}`;
	}

	// Update the user record with the new image path
	await prisma.user.update({
		where: { id: locals.user.id },
		data: { image: savedImagePath }
	});

	return new Response(JSON.stringify({ message: 'New image added!' }), { status: 200 });
}
=======
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';

export async function GET({ locals }) {
	if (!locals.session) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	const user = locals.user;

	return new Response(
		JSON.stringify({
      message: 'data retrieved',
			user
		}),
		{ status: 200 }
	);
}

export async function POST({ request, locals }) {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const data = await request.formData();
	const image = data.get('image') as string | null;

	if (!image) {
		return json({ message: 'No image provided' }, { status: 401 });
	}

	let savedImagePath: string | null = null;

	if (image) {
		const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
		const buffer = Buffer.from(base64Data, 'base64');

		const fileName = `${Date.now()}-task-image.png`;
		const filePath = path.join('static/uploads/pfp', fileName);

		fs.writeFileSync(filePath, buffer);

		savedImagePath = `/uploads/pfp/${fileName}`;
	}

	// Update the user record with the new image path
	await prisma.user.update({
		where: { id: locals.user.id },
		data: { image: savedImagePath }
	});

	return new Response(JSON.stringify({ message: 'New image added!' }), { status: 200 });
}
>>>>>>> 2689b32a279db71525fba4df4c3d46aae9075f8c

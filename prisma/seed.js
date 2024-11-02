import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { Argon2id } from 'oslo/password';

const prisma = new PrismaClient();

async function main() {
	const hashedPassword = await new Argon2id().hash('141970as');

	const adminUser = await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: {},
		create: {
			name: 'Admin',
			email: 'admin@example.com',
			password: hashedPassword,
			role: 'admin',
			image: faker.image.avatar()
		}
	});

	const commonUser = await prisma.user.upsert({
		where: { email: 'user@example.com' },
		update: {},
		create: {
			name: 'user',
			email: 'user@example.com',
			password: hashedPassword,
			role: 'user',
			image: faker.image.avatar()
		}
	});

	const users = await prisma.user.createMany({
		data: Array.from({ length: 10 }).map(() => ({
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
			image: faker.image.avatar()
		}))
	});

	const allUsers = await prisma.user.findMany();

	const projects = await prisma.project.createMany({
		data: allUsers.map((user) => ({
			title: faker.company.name(),
			description: faker.lorem.sentence(),
			createdById: user.id,
			completed: faker.datatype.boolean(),
			startsAt: faker.date.future(),
			endsAt: faker.date.future()
		}))
	});

	const allProjects = await prisma.project.findMany();

	for (const project of allProjects) {
		const createdById = project.createdById;

		await prisma.task.createMany({
			data: Array.from({ length: 3 }).map(() => ({
				title: faker.lorem.words(3),
				description: faker.lorem.sentence(),
				completed: faker.datatype.boolean(),
				deadline: faker.date.future(),
				projectId: project.id,
				createdById: createdById,
				urgency: faker.helpers.arrayElement(['normal', 'important', 'urgent', 'very urgent'])
			}))
		});
	}

	const tasks = await prisma.task.createMany({
		data: allUsers.map((user) => ({
			title: faker.lorem.words(3),
			description: faker.lorem.sentence(),
			createdById: user.id,
			completed: faker.datatype.boolean(),
			deadline: faker.date.future(),
			urgency: faker.helpers.arrayElement(['normal', 'important', 'urgent', 'very urgent'])

		}))
	});

	// Create conversations and messages
	const numConversations = 10;
	for (let i = 0; i < numConversations; i++) {
		// Randomly select participants for the conversation
		const participants = faker.helpers.arrayElements(allUsers, { min: 2, max: 2 });

		// Log the participants array
		console.log(
			'Participants for Conversation:',
			participants.map((user) => ({ id: user.id, name: user.name }))
		);

		// Create the conversation
		const conversation = await prisma.conversation.create({
			data: {
				participants: {
					connect: participants.map((user) => ({ id: user.id }))
				}
			}
		});

		console.log('Created Conversation ID:', conversation.id);

		// Create messages for the conversation
		const numMessages = faker.number.int({ min: 5, max: 15 });
		for (let j = 0; j < numMessages; j++) {
			const sender = faker.helpers.arrayElement(participants); // Random sender from participants

			// Log selected sender details
			console.log(`Selected Sender:`, sender);

			if (sender && sender.id) {
				console.log(
					`Creating message from sender ID ${sender.id} for conversation ID ${conversation.id}`
				);
				await prisma.message.create({
					data: {
						content: faker.lorem.sentence(),
						senderId: sender.id, // Correctly set senderId
						conversationId: conversation.id
					}
				});
			} else {
				console.error('Invalid sender:', sender); // Log if sender is invalid
			}
		}
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

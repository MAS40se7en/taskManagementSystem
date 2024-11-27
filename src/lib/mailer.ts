import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { prisma } from './prisma';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	secure: true,
	port: 465,
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.APP_PASSWORD
	}
});

cron.schedule('0 * * * *', async () => {
	console.log('Running task deadline email check...');
	await checkAndSendDeadlineEmails();
});

export async function sendVerificationEmail(to: any, code: any) {
	const mailOptions = {
		from: `"Task Manager App" <${process.env.GMAIL_USER}`,
		to,
		subject: 'Verify you email address',
		text: `Thank you for registering. Use this verification code to complete you registration: ${code}`
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Verification email sent successfully');
	} catch (error) {
		console.error('Error sending verification email:', error);
		throw error;
	}
}

export async function sendPasswordResetEmail(to: any, link: any) {
	const mailOptions = {
		from: `"Task Manager App" <${process.env.GMAIL_USER}>`,
		to,
		subject: 'Reset your Password',
		html: `
            <p>If you did not request a password reset email, please ignore this email.</p>
            <p>To reset your password, click the following link:</p>
            <a href="${link}">Reset your Password!</a>
        `
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('password reset email sent successfully');
	} catch (error) {
		console.error('Error email:', error);
		throw error;
	}
}

export async function checkAndSendDeadlineEmails() {
	const now = new Date();
	const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

	const tasks = await prisma.task.findMany({
		where: {
			OR: [
				{
					deadline: {
						gte: now,
						lte: oneDayLater
					}
				},
				{
					endsAt: {
						gte: now,
						lte: oneDayLater
					}
				}
			],
			completed: false,
			emailNotificationSent: false
		},
		include: {
			createdBy: true
		}
	});

	for (const task of tasks) {
		if (task.createdBy?.email) {
			const taskLink = `${process.env.BASE_URL}/protected/tasks/${task.id}`;
			await sendTaskDeadlineEmail(task.createdBy?.email, taskLink, task);
		} else {
			console.warn(`No email found for user associated with task ID: ${task.id}`);
		}
	}
}

export async function sendTaskDeadlineEmail(to: any, link: any, task: any) {
	const mailOptions = {
		from: `"Task Manager App" <${process.env.GMAIL_USER}>`,
		to,
		subject: 'Task Aproaching deadline',
		html: `
            <p>Task ${task.title} is aproaching it's deadline or end date: ${task.deadline ? task.deadline : task.endsAt}</p>
            <p>Click the link below to open the task page:</p>
            <a href="${link}">${task.title}</a>
        `
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Task aproaching deadline notification email sent successfully!');
	} catch (error) {
		console.error('Error email:', error);
		throw error;
	}
}

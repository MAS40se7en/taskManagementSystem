import nodemailer from 'nodemailer';

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

export async function sendPasswordEmail(to: any, link: any) {
	const mailOptions = {
		from: `"Task Manager App" <${process.env.GMAIL_USER}>`,
		to,
		subject: 'Create a Password',
		html: `
            <p>If you did not request for a password, please ignore this email.</p>
            <p>To create your password, click the following link:</p>
            <a href="${link}">add a password!</a>
        `
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('password email sent successfully');
	} catch (error) {
		console.error('Error email:', error);
		throw error;
	}
}

export async function sendTaskDeadlineEmail(to: any, tasks: any) {

	const taskListHTML = tasks
		.map(
			(task: any) => {
				const url = new URL(`/protected/tasks/${task.id}`, process.env.BASE_URL);
				return `
					<li>
						<p>Task: <a href="${url}"><strong>${task.title}</strong></a> </p>
					</li>
				`;
			}
		)
	
	const mailOptions = {
		from: `"Task Manager App" <${process.env.GMAIL_USER}>`,
		to,
		subject: 'Task Aproaching deadline',
		html: `
            <h1><strong>Tasks Aproaching Deadline</strong></h1>
			<br />
			<p>These tasks are aproaching their deadline or end dates within a week:</p>
			<ul>
				${taskListHTML}
			</ul>
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

export async function ProjectDeadlineEmail(to: any, projects: any) {

	const projectListHTML = projects
		.map(
			(project: any) => {
				const url = new URL(`/protected/projects/${project.id}`, process.env.BASE_URL);
				return `
					<li>
						<p>Project: <a href="${url}"><strong>${project.title}</strong></a> </p>
					</li>
				`;
			}
		)
	
	const mailOptions = {
		from: `"Task Manager App" <${process.env.GMAIL_USER}>`,
		to,
		subject: 'Project Aproaching deadline',
		html: `
            <h1><strong>Projects Aproaching Deadline</strong></h1>
			<br />
			<p>These projects are aproaching their deadline or end dates within a week:</p>
			<ul>
				${projectListHTML}
			</ul>
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
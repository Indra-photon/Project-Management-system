import Mailgen from 'mailgen'
import nodemailer from 'nodemailer'

const mailgen = async (options) => {
    var mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://mailgen.js/'
        }
    });

// Generate the plaintext version of the e-mail (for clients that do not support HTML)
var emailText = mailGenerator.generatePlaintext(options.mailgenContent);
var emailBody = mailGenerator.generate(options.mailgenContent);

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
    },
});

const mailOptions = {
    from: 'indranilmaiti1@gmail.com', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: emailText,
    html: emailBody
}

try {
    await transporter.sendMail(mailOptions)
} catch (error) {
    console.error("Email failed", error)
}
}

const emailVerificationmailgenContent = (username, verificationUrl) => {
    return {
        body : {
            name: username,
            intro: 'Welcome to Mailgen! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with Our App, please click here:',
                button: {
                    color: '#22BC66', 
                    text: 'Verify your email',
                    link: verificationUrl
                } 
        },
         outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
}
}

const forgotPasswordmailgenContent = (username, passwordresetUrl) => {
    return {
        body : {
            name: username,
            intro: 'Reset your password',
            action: {
                instructions: 'To change your password click the button',
                button: {
                    color: '#22BC66', 
                    text: 'reset password',
                    link: passwordresetUrl
                } 
        },
         outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
}
}


export {
    mailgen,
    emailVerificationmailgenContent,
    forgotPasswordmailgenContent
}

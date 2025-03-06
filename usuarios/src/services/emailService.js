const nodemailer = require('nodemailer');

const sendConfirmationEmail = async (email, nombre, link, password) => {
    try {
        // 🔄 **Evitar envío real de correos en tests**
        if (process.env.NODE_ENV === 'test') {
            console.log(`📌 Simulando envío de correo a ${email}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verifica tu cuenta',
            text: `Hola ${nombre},\n\nGracias por registrarte. Aquí están tus credenciales:\nCorreo: ${email}\nContraseña: ${password}\n\nVerifica tu cuenta:\n${link}\n\nEste enlace expira en 1 hora.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Correo de verificación enviado a ${email}`);
    } catch (error) {
        console.error('Error al enviar el correo:', error.message);
        throw new Error('No se pudo enviar el correo de verificación');
    }
};


module.exports = { sendConfirmationEmail };

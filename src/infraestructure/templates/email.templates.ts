export const EmailTemplates = {
  baseTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 30px;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
          .code {
            background-color: #f3f4f6;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            text-align: center;
            margin: 20px 0;
            color: #2563eb;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
        </div>
      </body>
      </html>
    `;
  },

  forgotPasswordEmail(name: string, resetLink: string): string {
    const content = `
      <div class="header">
        <div class="logo">🔗 AllLinks</div>
      </div>
      <div class="content">
        <h1>Restablecer contraseña</h1>
        <p>Hola ${name},</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <div style="text-align: center;">
          <a href="${resetLink}" class="button">Restablecer contraseña</a>
        </div>
        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
        <div class="warning">
          <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
        </div>
        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu contraseña actual permanecerá sin cambios.</p>
      </div>
      <div class="footer">
        <p>Este correo fue enviado automáticamente, por favor no respondas.</p>
        <p>&copy; ${new Date().getFullYear().toString()} AllLinks. Todos los derechos reservados.</p>
      </div>
    `;

    return EmailTemplates.baseTemplate(content);
  },

  forgotPasswordEmailText(name: string, resetLink: string): string {
    return `
      Restablecer contraseña

      Hola ${name},

      Recibimos una solicitud para restablecer la contraseña de tu cuenta.

      Para crear una nueva contraseña, visita el siguiente enlace:

      ${resetLink}

      Este enlace expirará en 1 hora por motivos de seguridad.

      Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.

      ---
      AllLinks
    `.trim();
  },

  passwordResetConfirmationEmail(name: string): string {
    const content = `
      <div class="header">
        <div class="logo">🔗 AllLinks</div>
      </div>
      <div class="content">
        <h1>Contraseña actualizada</h1>
        <p>Hola ${name},</p>
        <p>Tu contraseña ha sido actualizada exitosamente.</p>
        <p>Si realizaste este cambio, no necesitas hacer nada más.</p>
        <div class="warning">
          <strong>⚠️ ¿No fuiste tú?</strong> Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.
        </div>
      </div>
      <div class="footer">
        <p>Este correo fue enviado automáticamente, por favor no respondas.</p>
        <p>&copy; ${new Date().getFullYear().toString()} AllLinks. Todos los derechos reservados.</p>
      </div>
    `;

    return EmailTemplates.baseTemplate(content);
  },

  passwordResetConfirmationEmailText(name: string): string {
    return `
      Contraseña actualizada

      Hola ${name},

      Tu contraseña ha sido actualizada exitosamente.

      Si realizaste este cambio, no necesitas hacer nada más.

      Si no fuiste tú quien realizó este cambio, contacta inmediatamente a nuestro equipo de soporte.

      ---
      AllLinks
    `.trim();
  },

  verificationCodeEmail(name: string, code: string): string {
    const content = `
      <div class="header">
        <div class="logo">🔗 AllLinks</div>
      </div>
      <div class="content">
        <h1>Tu código de verificación</h1>
        <p>Hola ${name},</p>
        <p>Usa el siguiente código para verificar tu identidad:</p>
        <div class="code">${code}</div>
        <div class="warning">
          <strong>⚠️ Importante:</strong> Este código expirará en 10 minutos.
        </div>
        <p>Si no solicitaste este código, puedes ignorar este correo.</p>
      </div>
      <div class="footer">
        <p>Este correo fue enviado automáticamente, por favor no respondas.</p>
        <p>&copy; ${new Date().getFullYear().toString()} AllLinks. Todos los derechos reservados.</p>
      </div>
    `;

    return EmailTemplates.baseTemplate(content);
  },

  verificationCodeEmailText(name: string, code: string): string {
    return `
      Tu código de verificación

      Hola ${name},

      Usa el siguiente código para verificar tu identidad:

      ${code}

      Este código expirará en 10 minutos.

      Si no solicitaste este código, puedes ignorar este correo.

      ---
      AllLinks
    `.trim();
  },

  welcomeEmail(name: string, verificationLink: string): string {
    const content = `
      <div class="header">
        <div class="logo">🔗 AllLinks</div>
      </div>
      <div class="content">
        <h1>¡Bienvenido, ${name}!</h1>
        <p>Gracias por registrarte en nuestra plataforma. Estamos emocionados de tenerte con nosotros.</p>
        <p>Para completar tu registro y verificar tu cuenta, haz clic en el siguiente botón:</p>
        <div style="text-align: center;">
          <a href="${verificationLink}" class="button">Verificar mi cuenta</a>
        </div>
        <p>O copia y pega el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #2563eb;">${verificationLink}</p>
        <div class="warning">
          <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas.
        </div>
        <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
      </div>
      <div class="footer">
        <p>Este correo fue enviado automáticamente, por favor no respondas.</p>
        <p>&copy; ${new Date().getFullYear().toString()} AllLinks. Todos los derechos reservados.</p>
      </div>
    `;

    return EmailTemplates.baseTemplate(content);
  },

  welcomeEmailText(name: string, verificationLink: string): string {
    return `
      ¡Bienvenido, ${name}!

      Gracias por registrarte en AllLinks. Para verificar tu cuenta, visita el siguiente enlace:

      ${verificationLink}

      Este enlace expirará en 24 horas.

      Si no creaste esta cuenta, puedes ignorar este correo.

      ---
      AllLinks
    `.trim();
  },
};

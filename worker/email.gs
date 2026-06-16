/**
 * GREATLY — Vos retours · Emails
 *
 * Templates et envoi d'emails via Gmail.
 */

/** Envoie le magic link de connexion */
function sendMagicLinkEmail(email, firstname, link) {
  const name = firstname || 'Bonjour';

  const subject = 'Votre lien de connexion — Greatly Vos retours';

  const htmlBody = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:0;color:#1A1A1A">
    <div style="padding:32px 28px;background:#F7F4EF;border-radius:16px">
      <div style="font-size:12px;letter-spacing:3px;font-weight:700;color:#4f5e42;text-transform:uppercase;margin-bottom:20px">GREATLY</div>

      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px;color:#1A1A1A">${name}, votre espace vous attend</h1>

      <p style="font-size:15px;line-height:1.6;color:#6B6460;margin:0 0 24px">
        Cliquez sur le bouton ci-dessous pour accéder à votre tableau de bord. Ce lien est personnel, valable 15 minutes et utilisable une seule fois.
      </p>

      <a href="${link}" style="display:inline-block;background:#6B7D5C;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;margin-bottom:24px">
        Accéder à mes retours →
      </a>

      <p style="font-size:13px;line-height:1.5;color:#6B6460;margin:24px 0 0">
        Si vous n'avez pas demandé ce lien, ignorez simplement cet email.<br>
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
        <span style="font-size:12px;color:#9B9590;word-break:break-all">${link}</span>
      </p>
    </div>

    <div style="text-align:center;padding:20px 0;font-size:11px;color:#9B9590;letter-spacing:0.5px">
      GREATLY · 10 rue de Lambersart, Verlinghem
    </div>
  </div>`;

  const textBody = name + ', votre espace vous attend.\n\n'
    + 'Cliquez sur ce lien pour accéder à votre tableau de bord :\n'
    + link + '\n\n'
    + 'Ce lien est valable 15 minutes et utilisable une seule fois.\n\n'
    + 'GREATLY · Verlinghem';

  GmailApp.sendEmail(email, subject, textBody, {
    htmlBody: htmlBody,
    name: 'Greatly · Vos retours',
    noReply: true,
  });
}

/** Envoie un email d'invitation à une nouvelle personne */
function sendInviteEmail(email, firstname, invitedBy) {
  const name = firstname || 'Bonjour';
  const link = BASE_URL;

  const subject = 'Vous êtes invité — Greatly Vos retours';

  const htmlBody = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:0;color:#1A1A1A">
    <div style="padding:32px 28px;background:#F7F4EF;border-radius:16px">
      <div style="font-size:12px;letter-spacing:3px;font-weight:700;color:#4f5e42;text-transform:uppercase;margin-bottom:20px">GREATLY</div>

      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px;color:#1A1A1A">${name}, bienvenue dans l'espace retours</h1>

      <p style="font-size:15px;line-height:1.6;color:#6B6460;margin:0 0 24px">
        ${invitedBy} vous a donné accès au tableau de bord "Vos retours". Cet espace rassemble les ressentis partagés par les membres et les intervenants — de façon 100 % anonyme.
      </p>

      <a href="${link}" style="display:inline-block;background:#6B7D5C;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px;margin-bottom:24px">
        Découvrir mon espace →
      </a>

      <p style="font-size:13px;line-height:1.5;color:#6B6460;margin:24px 0 0">
        Lors de votre première visite, entrez votre adresse email pour recevoir un lien de connexion. Pas de mot de passe à retenir.
      </p>
    </div>

    <div style="text-align:center;padding:20px 0;font-size:11px;color:#9B9590;letter-spacing:0.5px">
      GREATLY · 10 rue de Lambersart, Verlinghem
    </div>
  </div>`;

  GmailApp.sendEmail(email, subject, 'Bienvenue ! Accédez à votre espace : ' + link, {
    htmlBody: htmlBody,
    name: 'Greatly · Vos retours',
    noReply: true,
  });
}

/** Notifie les admins d'une nouvelle demande d'accès */
function notifyAdminsNewRequest(request) {
  const adminEmail = getProperty('ADMIN_EMAIL');
  if (!adminEmail) return;

  const subject = 'Nouvelle demande d\'accès — ' + request.firstname + ' ' + request.lastname;

  const htmlBody = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:0;color:#1A1A1A">
    <div style="padding:32px 28px;background:#F7F4EF;border-radius:16px">
      <div style="font-size:12px;letter-spacing:3px;font-weight:700;color:#4f5e42;text-transform:uppercase;margin-bottom:20px">GREATLY</div>

      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px;color:#1A1A1A">Nouvelle demande d'accès</h1>

      <p style="font-size:15px;line-height:1.6;color:#6B6460;margin:0 0 16px">
        <strong>${request.firstname} ${request.lastname}</strong><br>
        ${request.email}<br>
        Fonction : ${request.role || '—'}<br>
        ${request.message ? 'Message : ' + request.message : ''}
      </p>

      <a href="${BASE_URL}" style="display:inline-block;background:#6B7D5C;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:10px">
        Gérer dans l'administration →
      </a>
    </div>
  </div>`;

  GmailApp.sendEmail(adminEmail, subject, 'Nouvelle demande : ' + request.email, {
    htmlBody: htmlBody,
    name: 'Greatly · Vos retours',
  });
}

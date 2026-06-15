/* ============================================
   Greatly — Vos retours · Chat communauté
   ============================================ */

const CHAT_KEY = 'greatly_retours_chat';
let currentChannel = 'general';

// Canaux et descriptions
const CHANNELS = {
  general:  { name: '💬 Échanges',       desc: 'Discussion libre entre membres de l\'équipe' },
  energie:  { name: '⛷️ Énergie',        desc: 'Retours et discussions sur les séances Énergie' },
  lucidite: { name: '🦉 Lucidité',       desc: 'Échanges autour des ateliers Lucidité' },
  lieux:    { name: '🏡 Greatly House',   desc: 'Tout ce qui concerne les lieux et le cadre' },
};

// Couleurs d'avatar variées (palette Greatly)
const AVATAR_COLORS = [
  { bg: '#CDD8BE', color: '#4f5e42' },  // sage
  { bg: '#F0DFCC', color: '#9a6235' },  // énergie
  { bg: '#D3E2E4', color: '#3b6166' },  // lucidité
  { bg: '#EDE4D8', color: '#6B5139' },  // prospect
  { bg: '#E7E1D7', color: '#6B6460' },  // gris
];

// Messages de démo (pré-remplis)
const DEMO_MESSAGES = {
  general: [
    { name: 'Arnaud Przybylski', date: '2026-06-10T09:15:00', text: 'Bienvenue dans l\'espace communauté ! N\'hésitez pas à partager vos observations et vos idées ici.' },
    { name: 'Sophie Lefebvre', date: '2026-06-10T09:42:00', text: 'Super initiative. J\'ai remarqué que le NPS Énergie a bien progressé ce trimestre, les ajustements sur le format court semblent payer.' },
    { name: 'Marc Dupont', date: '2026-06-10T14:20:00', text: 'Je vois que le brunch Lucidité est le temps le moins bien noté. On pourrait peut-être allonger le créneau de 15 minutes ?' },
    { name: 'Claire Martin', date: '2026-06-11T08:30:00', text: 'Bonjour à tous ! Les verbatims de cette semaine sont très riches, notamment sur le yoga. Les membres parlent beaucoup du retour au calme en fin de séance.' },
    { name: 'Thomas Bernard', date: '2026-06-12T11:05:00', text: 'Question : est-ce qu\'on a un objectif de taux de réponse à atteindre ? On est à 72% là, c\'est bien mais on peut faire mieux.' },
    { name: 'Arnaud Przybylski', date: '2026-06-12T11:18:00', text: 'Bonne question Thomas. L\'objectif est 80% d\'ici septembre. On va relancer un rappel après chaque séance.' },
    { name: 'Sophie Lefebvre', date: '2026-06-13T16:40:00', text: 'Je partage un retour positif d\'un intervenant : "Le groupe est de plus en plus soudé, les échanges en fin de séance sont spontanés et authentiques." 🌱' },
    { name: 'Julie Moreau', date: '2026-06-14T09:55:00', text: 'Les prospects qui ont rempli le formulaire "futurs membres" mentionnent souvent le bouche-à-oreille comme source. Notre meilleur canal d\'acquisition c\'est nos membres actuels !' },
  ],
  energie: [
    { name: 'Thomas Bernard', date: '2026-06-10T10:00:00', text: 'Le coach padel a proposé une nouvelle variante d\'échauffement, les notes de la phase "échauffement" ont remonté de 0.3 points ce mois-ci.' },
    { name: 'Claire Martin', date: '2026-06-11T14:15:00', text: 'Plusieurs membres mentionnent que le vestiaire du club padel pourrait être amélioré. C\'est un point récurrent dans les verbatims.' },
    { name: 'Marc Dupont', date: '2026-06-13T09:30:00', text: 'Yoga : le "plaisir à bouger" est à 8.6/10, c\'est notre meilleur score toutes questions confondues. Le format est vraiment adapté.' },
  ],
  lucidite: [
    { name: 'Sophie Lefebvre', date: '2026-06-10T15:00:00', text: 'L\'atelier "Le cadre" a eu le meilleur NPS de la série. Le contenu sur les frontières pro/perso a vraiment résonné.' },
    { name: 'Julie Moreau', date: '2026-06-12T10:20:00', text: 'Idée pour le prochain atelier : intégrer un temps de partage en binôme avant le debrief collectif. Plusieurs membres l\'ont suggéré.' },
    { name: 'Arnaud Przybylski', date: '2026-06-14T11:00:00', text: 'La note "élan après la rencontre" progresse bien : +0.4 depuis le début. Les défis d\'intersession fonctionnent.' },
  ],
  lieux: [
    { name: 'Claire Martin', date: '2026-06-10T11:30:00', text: 'La Greatly House reste notre meilleur score lieu (8.9/10). L\'accueil et l\'atmosphère sont systématiquement mentionnés dans les verbatims positifs.' },
    { name: 'Marc Dupont', date: '2026-06-12T16:00:00', text: 'On a un écart de 1.3 points entre la Greatly House et les lieux sportifs. Normal vu que c\'est chez nous, mais on peut améliorer le confort des salles extérieures.' },
    { name: 'Thomas Bernard', date: '2026-06-14T08:45:00', text: 'Bonne nouvelle : le club padel a rénové ses vestiaires. Ça devrait se voir dans les prochains retours.' },
  ],
};

/** Charge les messages d'un canal (demo + localStorage) */
function getMessages(channel) {
  const demo = DEMO_MESSAGES[channel] || [];
  try {
    const stored = JSON.parse(localStorage.getItem(CHAT_KEY) || '{}');
    const userMsgs = stored[channel] || [];
    return [...demo, ...userMsgs].sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (_) {
    return demo;
  }
}

/** Sauvegarde un message utilisateur */
function storeMessage(channel, msg) {
  try {
    const stored = JSON.parse(localStorage.getItem(CHAT_KEY) || '{}');
    if (!stored[channel]) stored[channel] = [];
    stored[channel].push(msg);
    localStorage.setItem(CHAT_KEY, JSON.stringify(stored));
  } catch (_) {}
}

/** Initiales d'un nom */
function chatInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Couleur d'avatar basée sur le nom (déterministe) */
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Formater l'heure */
function fmtTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Formater la date */
function fmtDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Aujourd\'hui';
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Affiche les messages du canal courant */
function renderChat() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const messages = getMessages(currentChannel);
  let html = '';
  let lastDate = '';

  messages.forEach(msg => {
    const msgDate = new Date(msg.date).toDateString();
    if (msgDate !== lastDate) {
      html += `<div class="chat-date-sep">${fmtDate(msg.date)}</div>`;
      lastDate = msgDate;
    }

    const col = avatarColor(msg.name);
    html += `<div class="chat-msg">
      <div class="chat-msg-avatar" style="background:${col.bg};color:${col.color}">${chatInitials(msg.name)}</div>
      <div class="chat-msg-body">
        <div class="chat-msg-header">
          <span class="chat-msg-name">${msg.name}</span>
          <span class="chat-msg-time">${fmtTime(msg.date)}</span>
        </div>
        <div class="chat-msg-text">${escapeHtml(msg.text)}</div>
      </div>
    </div>`;
  });

  if (messages.length === 0) {
    html = '<div style="text-align:center;padding:40px;color:var(--warm-grey);font-size:.9rem">Aucun message dans ce canal. Soyez le premier à écrire !</div>';
  }

  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

/** Échapper le HTML */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Envoyer un message */
function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const profile = getProfile();
  const name = [profile.firstname, profile.lastname].filter(Boolean).join(' ') || 'Anonyme';

  const msg = {
    name,
    date: new Date().toISOString(),
    text,
  };

  storeMessage(currentChannel, msg);
  input.value = '';
  renderChat();
}

/** Changer de canal */
function switchChannel(channel) {
  currentChannel = channel;
  document.querySelectorAll('#chat-channels button').forEach(b =>
    b.classList.toggle('on', b.dataset.ch === channel)
  );
  renderChat();
}

// Bind canaux
document.querySelectorAll('#chat-channels button').forEach(btn => {
  btn.addEventListener('click', () => switchChannel(btn.dataset.ch));
});

// Envoi par Entrée
document.getElementById('chat-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

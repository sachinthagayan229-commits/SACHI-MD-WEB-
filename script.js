
const DEFAULTS = {
  siteName: "SACHINTHA",
  profileTitle: "Creator · Tech Enthusiast",
  bio: "I'm Sachintha. This website is where you can learn a little about me, find my social links, join my community, and access handy tools.",
  welcomeText: "Welcome to my little corner of the internet. Find my links, connect with me, and explore useful social media tools.",
  whatsappNumber: "94778936490",
  whatsappMessage: "Hi Sachintha! I found your website.",
  whatsappGroup: "https://chat.whatsapp.com/KHLoN4Chzag2YPvehbmjm8",
  instagram: "https://www.instagram.com/sachintha5275?stkn=MWtkb3FrZTF1OTI1Zw==",
  tiktok: "https://www.tiktok.com/@sachinthagayan915?_r=1&_t=ZS-9AKvMaQj8Y1",
  facebook: "https://www.facebook.com/share/1KR7Xbrjcn/",
  facebookDownloader: "",
  tiktokDownloader: "",
  instagramDownloader: "",
  showAbout: "true",
  showTools: "true",
  showContact: "true"
};

function applySettings(s) {
  const name = s.siteName || DEFAULTS.siteName;

  document.querySelectorAll('.brand').forEach(el => {
    el.textContent = name;
    const dot = document.createElement('span');
    dot.textContent = '.';
    el.appendChild(dot);
  });

  const heroName = document.querySelector('.hero h1 span');
  if (heroName) heroName.textContent = name + '.';

  const profileName = document.querySelector('.profile-card h2');
  if (profileName) profileName.textContent = name;

  const profileTitle = document.querySelector('.profile-card > p');
  if (profileTitle) profileTitle.textContent = s.profileTitle || DEFAULTS.profileTitle;

  const about = document.querySelector('.about-card p');
  if (about) about.textContent = s.bio || DEFAULTS.bio;

  const welcome = document.querySelector('.hero .lead');
  if (welcome && s.welcomeText) welcome.textContent = s.welcomeText;

  const avatar = document.querySelector('.avatar');
  if (avatar && s.profileImage) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${String(s.profileImage).replace(/["\\]/g,'')}")`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
  }

  document.title = `${name} | Personal Website`;

  const phone = String(s.whatsappNumber || DEFAULTS.whatsappNumber).replace(/\D/g, '');

  setLink('whatsapp-link', phone ? `https://wa.me/${phone}?text=${encodeURIComponent(s.whatsappMessage || DEFAULTS.whatsappMessage)}` : '');
  setLink('group-link', s.whatsappGroup || DEFAULTS.whatsappGroup);
  setLink('instagram-link', s.instagram || DEFAULTS.instagram);
  setLink('tiktok-link', s.tiktok || DEFAULTS.tiktok);
  setLink('facebook-link', s.facebook || DEFAULTS.facebook);

  setVisible('#about', s.showAbout);
  setVisible('#tools', s.showTools);
  setVisible('#contact', s.showContact);
}

function setVisible(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.hidden = value === 'false';
}

function setLink(id, url) {
  const el = document.getElementById(id);
  if (el && url) el.href = url;
}

document.getElementById('year').textContent = new Date().getFullYear();

(async function loadPublicSettings() {
  let settings = {...DEFAULTS};

  try {
    const client = window.supabase.createClient(
      window.SACHI_SUPABASE_URL,
      window.SACHI_SUPABASE_KEY
    );

    const {data, error} = await client
      .from('site_settings')
      .select('key,value');

    if (!error && data) {
      data.forEach(row => settings[row.key] = row.value);
    }
  } catch (e) {}

  applySettings(settings);
})();

document.querySelectorAll('.download-form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();

    const input = form.querySelector('input');
    const status = form.parentElement.querySelector('.tool-status');
    const url = input.value.trim();

    if (!url) return;

    status.textContent =
      'Downloader backend is not connected yet. Ask the site administrator to configure a secure backend.';
  });
});

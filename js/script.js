const renderPrimaryNav = () => {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  const onHomePage = !window.location.pathname.includes('/pages/');
  const onJackudaPage = window.location.pathname.endsWith('/pages/jackuda.html');
  const onStablePage = window.location.pathname.endsWith('/pages/stable.html');
  const prefix = onHomePage ? 'pages/' : '';
  const homeLink = onHomePage ? '#about' : '../index.html#about';
  const stableActivityLinks = `
        <a href="${prefix}riding-lessons.html">Riding Lessons</a>
        <a href="${prefix}adopt-a-horse.html">Adopt a Horse</a>
        <a href="${prefix}lease-a-horse.html">Lease a Horse</a>`;
  const activityLinks = onStablePage ? stableActivityLinks : `
        <a href="${prefix}birthday-party.html">Birthday Parties</a>
        <a href="${prefix}jackuda.html">Camps/Workshops</a>
        <a href="${prefix}events.html">Corporate/Group Events</a>
        <a href="${prefix}activities.html">Learning Journey</a>
        <a href="${prefix}birthday-party.html">Outdoor Pony Hire</a>
        <a href="${prefix}photoshoot.html">Photoshoots</a>
        <a href="${prefix}activities.html">Pony Rides/Feeding</a>
        <a href="${prefix}riding.html">Trail/Track Rides</a>
        ${onJackudaPage ? '' : stableActivityLinks}`;
  const activitiesMenu = onStablePage || onJackudaPage ? `
    <div class="nav-dropdown">
      <button class="nav-dropdown-toggle" type="button">Activities</button>
      <div class="nav-dropdown-menu activities-menu">
        ${activityLinks}
      </div>
    </div>` : '';

  nav.innerHTML = `
    <a href="${homeLink}">Home</a>
    ${activitiesMenu}
    <a href="${prefix}promotions.html">Promotions</a>
    <a href="${prefix}gallop-care.html">Gallop Cares</a>
    <a href="${prefix}join.html">Join the Team</a>
    <a href="${prefix}faq.html">FAQs</a>
    <a href="${prefix}contact.html">Contact Us</a>
  `;
};

renderPrimaryNav();

const renderSiteFooter = () => {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  if (footer.hasAttribute('data-home-footer')) {
    footer.innerHTML = `
      <div class="footer-main">
        <div class="footer-heading footer-heading-visit">
          <h2>Visit Us</h2>
        </div>
        <div class="footer-heading footer-heading-hours">
          <h2>Opening Hours</h2>
        </div>

        <div class="footer-location-list">
          <article class="footer-location-card">
            <div class="footer-location-details">
              <h3>Admiralty</h3>
              <p>8 Admiralty Rd East, Singapore 759991</p>
              <a href="tel:+6564636012">6463 6012</a>
              <span aria-hidden="true"> / </span>
              <a href="tel:+6583836425">8383 6425</a>
            </div>
            <div class="footer-location-hours">
              <p class="footer-days">Daily</p>
              <p>7:00 AM - 7:00 PM</p>
            </div>
          </article>

          <article class="footer-location-card footer-carpark-card">
            <div class="footer-location-details">
              <h3>Carpark</h3>
              <p>Find the nearest carpark before your visit.</p>
            </div>
            <div class="footer-location-hours">
              <a class="footer-carpark-link" href="https://maps.app.goo.gl/P71RDQeCA8QNJVCfA" target="_blank" rel="noopener noreferrer">View Carpark on Google Maps</a>
            </div>
          </article>
        </div>
      </div>
    `;
    return;
  }

  footer.innerHTML = `
    <div class="footer-main">
      <div class="footer-heading footer-heading-visit">
        <h2>Visit Us</h2>
      </div>
      <div class="footer-heading footer-heading-hours">
        <h2>Opening Hours</h2>
      </div>

      <div class="footer-location-list">
        <article class="footer-location-card">
          <div class="footer-location-details">
            <h3>Admiralty</h3>
            <p>8 Admiralty Rd East, Singapore 759991</p>
            <a href="tel:+6564636012">6463 6012</a>
            <span aria-hidden="true"> / </span>
            <a href="tel:+6583836425">8383 6425</a>
          </div>
          <div class="footer-location-hours">
            <p class="footer-days">Daily</p>
            <p>8:30 AM - 11:45 AM</p>
            <p>2:30 PM - 6:45 PM</p>
          </div>
        </article>

        <article class="footer-location-card">
          <div class="footer-location-details">
            <h3>Pasir Ris Park</h3>
            <p>61 Pasir Ris Green, Pasir Ris Park Carpark C, Singapore 518225</p>
            <a href="tel:+6565839665">6583 9665</a>
          </div>
          <div class="footer-location-hours">
            <p class="footer-days">Tuesdays - Sundays</p>
            <p>10:00 AM - 11:45 AM</p>
            <p>2:00 PM - 6:45 PM</p>
          </div>
        </article>

        <article class="footer-location-card">
          <div class="footer-location-details">
            <h3>Downtown East</h3>
            <p>1 Pasir Ris Close, Singapore 519599</p>
            <a href="tel:+6587875377">8787 5377</a>
          </div>
          <div class="footer-location-hours">
            <p class="footer-days">Wednesdays - Mondays</p>
            <p>9:00 AM - 11:45 AM</p>
            <p>2:00 PM - 6:45 PM</p>
          </div>
        </article>
      </div>
    </div>
  `;
};

renderSiteFooter();

document.querySelectorAll('[data-horse-gallery]').forEach(gallery => {
  const mainImage = gallery.querySelector('[data-gallery-main]');
  const thumbnails = [...gallery.querySelectorAll('[data-gallery-src]')];

  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
      if (!mainImage) return;

      mainImage.src = thumbnail.dataset.gallerySrc;
      mainImage.alt = thumbnail.dataset.galleryAlt || 'Horse photo';
      thumbnails.forEach(item => item.classList.toggle('active', item === thumbnail));
    });
  });
});

const aiChatForm = document.querySelector('#ai-chat-form');

if (aiChatForm) {
  const chatMessages = document.querySelector('#ai-chat-messages');
  const chatInput = document.querySelector('#ai-chat-input');
  const suggestionButtons = document.querySelectorAll('.ai-chat-suggestions button');
  const whatsappNumber = '6583836425';

  const createWhatsAppLink = question => {
    const message = `Hi Gallop Stable, I was chatting with Gallop AI and would like help with: ${question}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const getGallopAnswer = question => {
    const text = question.toLowerCase();

    if (/\b(hello|hi|hey|good morning|good afternoon)\b/.test(text)) {
      return 'Hi! I can help with riding lessons, activities, adoption, leasing, locations, opening hours and contact details.';
    }

    if (/location|address|where.*stable|where are/.test(text)) {
      return 'Gallop Stable has locations at Admiralty (8 Admiralty Road East), Pasir Ris Park (61 Pasir Ris Green, Carpark C), and Downtown East (1 Pasir Ris Close).';
    }

    if (/opening|hours|open|closing|what time/.test(text)) {
      return 'Admiralty is open daily, 8:30 AM-11:45 AM and 2:30 PM-6:45 PM. Pasir Ris Park opens Tuesdays-Sundays, 10:00 AM-11:45 AM and 2:00 PM-6:45 PM. Downtown East opens Wednesdays-Mondays, 9:00 AM-11:45 AM and 2:00 PM-6:45 PM.';
    }

    if (/lesson|learn.*ride|riding class|beginner.*ride/.test(text)) {
      return 'Gallop Stable offers riding lessons and introductory horse experiences for different ages and riding levels. Lesson suitability, schedules and availability should be confirmed with the stable team.';
    }

    if (/adopt|rescue|support.*horse/.test(text)) {
      return {
        text: 'The Adopt a Horse programme lets you support a rescued horse and contribute toward feed, grooming, stable care and other daily needs. You can view the available horses on the Adopt a Horse page. To arrange an adoption, contact the team at +65 8383 6425 on WhatsApp.',
        whatsapp: true
      };
    }

    if (/lease/.test(text)) {
      return 'Horse leasing offers more consistent time with a suitable horse while developing riding and horsemanship skills. The team matches riders according to experience, goals, availability and horse wellbeing.';
    }

    if (/pony ride|pony feeding|feed.*pony/.test(text)) {
      return 'Pony rides and feeding experiences are available at selected locations and times. Availability can change because of weather, horse welfare or private events, so please check with the team before visiting.';
    }

    if (/birthday|party/.test(text)) {
      return 'Gallop Stable can host horse and pony birthday experiences, with activities arranged according to the group and location. Contact the team to discuss the date, group size and package options.';
    }

    if (/camp|workshop/.test(text)) {
      return 'Gallop Stable offers camps, stable tours and riding workshops, including hands-on horse care and riding activities. Programmes vary by date and location.';
    }

    if (/photo|wedding|shoot/.test(text)) {
      return 'Photoshoots and videoshoots with horses are available by advance enquiry for couples, families, riders and special occasions.';
    }

    if (/event|corporate|team building|group/.test(text)) {
      return 'Gallop Stable supports corporate events, group activities, team building, celebrations and selected outside pony or horse hire arrangements.';
    }

    if (/price|cost|fee|how much|rate/.test(text)) {
      return {
        text: 'Prices depend on the activity, location, rider and booking date. Please message the Gallop Stable team on WhatsApp for the latest confirmed rate.',
        whatsapp: true
      };
    }

    if (/book|availability|available|reserve|appointment/.test(text)) {
      return {
        text: 'Bookings and live availability need confirmation from the Gallop Stable team. You can send them your preferred activity, location, date, time and number of participants on WhatsApp.',
        whatsapp: true
      };
    }

    if (/phone|contact|whatsapp|manager|staff|human|person/.test(text)) {
      return {
        text: 'You can contact the Gallop Stable team or manager on WhatsApp at +65 8383 6425.',
        whatsapp: true
      };
    }

    return {
      text: 'I do not have a confident answer for that yet. Please send your question to the Gallop Stable team on WhatsApp at +65 8383 6425, and they can assist you directly.',
      whatsapp: true
    };
  };

  const appendChatMessage = (content, sender, originalQuestion = '') => {
    const message = document.createElement('div');
    message.className = `ai-message ai-message-${sender}`;

    if (sender === 'bot') {
      const avatar = document.createElement('img');
      avatar.src = '../images/gallop-ai-horse.png';
      avatar.alt = '';
      message.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    const text = document.createElement('p');
    const answer = typeof content === 'string' ? { text: content } : content;
    text.textContent = answer.text;
    bubble.appendChild(text);

    if (answer.whatsapp) {
      const whatsappLink = document.createElement('a');
      whatsappLink.className = 'ai-whatsapp-link';
      whatsappLink.href = createWhatsAppLink(originalQuestion);
      whatsappLink.target = '_blank';
      whatsappLink.rel = 'noopener noreferrer';
      whatsappLink.textContent = 'Message the team on WhatsApp';
      bubble.appendChild(whatsappLink);
    }

    message.appendChild(bubble);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const sendChatQuestion = question => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    appendChatMessage({ text: trimmedQuestion }, 'user');
    chatInput.value = '';
    chatInput.focus();

    const typing = document.createElement('div');
    typing.className = 'ai-message ai-message-bot ai-message-typing';
    typing.innerHTML = '<img src="../images/gallop-ai-horse.png" alt=""><div><span></span><span></span><span></span></div>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    window.setTimeout(() => {
      typing.remove();
      appendChatMessage(getGallopAnswer(trimmedQuestion), 'bot', trimmedQuestion);
    }, 550);
  };

  aiChatForm.addEventListener('submit', event => {
    event.preventDefault();
    sendChatQuestion(chatInput.value);
  });

  suggestionButtons.forEach(button => {
    button.addEventListener('click', () => sendChatQuestion(button.textContent));
  });
}

const navLinks = document.querySelectorAll('.main-nav a');
const navToggle = document.querySelector('.nav-toggle');
const navDropdowns = document.querySelectorAll('.nav-dropdown');
const revealElements = document.querySelectorAll('.reveal');
const siteHeader = document.querySelector('.site-header');
const homeBanner = document.querySelector('.home-banner');
const pageHero = document.querySelector('.page-hero');

const renderHorseAssistant = () => {
  const chatLink = window.location.pathname.includes('/pages/') ? 'gallop-ai.html' : 'pages/gallop-ai.html';

  return `
    <div class="horse-assistant assistant-open">
      <div class="horse-assistant-message" id="horse-assistant-message">
        <button class="horse-assistant-close" type="button" aria-label="Close welcome message">&times;</button>
        <div class="horse-assistant-heading">
          <span class="horse-assistant-status"></span>
          <strong>Gallop AI</strong>
          <span class="horse-assistant-beta">Beta</span>
        </div>
        <p class="horse-assistant-greeting">Hi, welcome to Gallop SG! I am here to assist you.</p>
      </div>
      <a class="horse-assistant-toggle" href="${chatLink}" aria-label="Chat with Gallop AI">
        <img src="${window.location.pathname.includes('/pages/') ? '../images/gallop-ai-horse.png' : 'images/gallop-ai-horse.png'}" alt="" />
        <span>AI</span>
      </a>
    </div>
  `;
};

const addSocialFloat = () => {
  const existingSocialFloat = document.querySelector('.social-float');

  if (existingSocialFloat) {
    if (!existingSocialFloat.querySelector('.horse-assistant')) {
      existingSocialFloat.insertAdjacentHTML('beforeend', renderHorseAssistant());
    }
    return;
  }

  document.body.insertAdjacentHTML('beforeend', `
    <div class="social-float" aria-label="Social links">
      <div class="social-float-links" id="social-float-links">
      <a class="social-float-btn whatsapp-float" href="https://wa.me/6583836425" target="_blank" rel="noopener noreferrer" aria-label="Chat with Gallop Stable on WhatsApp">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3.5c-6.9 0-12.5 5.52-12.5 12.34 0 2.18.58 4.31 1.69 6.18L3.5 28.5l6.67-1.7a12.66 12.66 0 0 0 5.87 1.47c6.9 0 12.5-5.52 12.5-12.34S22.94 3.5 16.04 3.5Zm0 22.66c-1.86 0-3.68-.49-5.27-1.42l-.38-.22-3.96 1.01 1.05-3.82-.25-.39a10.14 10.14 0 0 1-1.58-5.48c0-5.65 4.66-10.23 10.39-10.23s10.39 4.58 10.39 10.23-4.66 10.32-10.39 10.32Zm5.7-7.66c-.31-.15-1.85-.9-2.14-1-.29-.1-.5-.15-.71.15-.21.31-.82 1-.99 1.2-.18.2-.36.23-.67.08-.31-.15-1.31-.48-2.49-1.52-.92-.81-1.54-1.8-1.72-2.11-.18-.31-.02-.48.14-.63.14-.14.31-.36.47-.54.16-.18.21-.31.31-.52.1-.2.05-.39-.03-.54-.08-.15-.71-1.69-.97-2.31-.26-.6-.52-.52-.71-.53h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.06-1.1 2.59s1.13 3 1.28 3.2c.16.2 2.22 3.35 5.38 4.69.75.32 1.34.51 1.8.65.76.24 1.44.2 1.98.12.6-.09 1.85-.75 2.12-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.2-.6-.35Z" /></svg>
      </a>
      <a class="social-float-btn instagram-float" href="https://www.instagram.com/gallop.sg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Visit Gallop Stable on Instagram">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10.1 3.5h11.8c3.64 0 6.6 2.96 6.6 6.6v11.8c0 3.64-2.96 6.6-6.6 6.6H10.1c-3.64 0-6.6-2.96-6.6-6.6V10.1c0-3.64 2.96-6.6 6.6-6.6Zm0 2.35a4.25 4.25 0 0 0-4.25 4.25v11.8a4.25 4.25 0 0 0 4.25 4.25h11.8a4.25 4.25 0 0 0 4.25-4.25V10.1a4.25 4.25 0 0 0-4.25-4.25H10.1Zm5.9 4.88a5.27 5.27 0 1 1 0 10.54 5.27 5.27 0 0 1 0-10.54Zm0 2.35a2.92 2.92 0 1 0 0 5.84 2.92 2.92 0 0 0 0-5.84Zm6.05-3.73a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7Z" /></svg>
      </a>
      <a class="social-float-btn tiktok-float" href="https://www.tiktok.com/@gallop.sg?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="Visit Gallop Stable on TikTok">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M22.08 4.5c.42 3.08 2.18 4.92 5.05 5.12v4.22a8.77 8.77 0 0 1-5.04-1.52v7.75c0 4.04-3.27 7.43-7.43 7.43-4.29 0-7.79-3.5-7.79-7.79s3.5-7.79 7.79-7.79c.53 0 1.05.05 1.55.16v4.38a3.43 3.43 0 0 0-1.55-.37 3.62 3.62 0 1 0 3.62 3.62V4.5h3.8Z" /></svg>
      </a>
      <a class="social-float-btn facebook-float" href="https://www.facebook.com/gallopstableatgallop.sg" target="_blank" rel="noopener noreferrer" aria-label="Visit Gallop Stable on Facebook">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18.33 28.5V17.42h3.72l.56-4.32h-4.28v-2.76c0-1.25.35-2.1 2.14-2.1h2.28V4.38c-.39-.05-1.75-.17-3.33-.17-3.29 0-5.55 2.01-5.55 5.7v3.19h-3.72v4.32h3.72V28.5h4.46Z" /></svg>
      </a>
      </div>
      <button class="social-float-toggle" type="button" aria-expanded="false" aria-controls="social-float-links" aria-label="Open social links">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 5.5h20a3.5 3.5 0 0 1 3.5 3.5v11A3.5 3.5 0 0 1 26 23.5H15l-6.8 4.2c-.8.5-1.7-.1-1.7-1v-3.2H6A3.5 3.5 0 0 1 2.5 20V9A3.5 3.5 0 0 1 6 5.5Zm4 7.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>
      </button>
      ${renderHorseAssistant()}
    </div>
  `);
};

addSocialFloat();

const socialFloat = document.querySelector('.social-float');
const socialToggle = document.querySelector('.social-float-toggle');
const horseAssistant = document.querySelector('.horse-assistant');
const horseAssistantClose = document.querySelector('.horse-assistant-close');

const setSocialOpen = isOpen => {
  if (!socialFloat || !socialToggle) return;

  socialFloat.classList.toggle('social-open', isOpen);
  socialToggle.setAttribute('aria-expanded', String(isOpen));
  socialToggle.setAttribute('aria-label', isOpen ? 'Close social links' : 'Open social links');
};

socialToggle?.addEventListener('click', event => {
  event.stopPropagation();
  setSocialOpen(!socialFloat.classList.contains('social-open'));
});

socialFloat?.addEventListener('click', event => event.stopPropagation());

document.addEventListener('click', () => setSocialOpen(false));

const setHorseAssistantOpen = isOpen => {
  if (!horseAssistant) return;

  horseAssistant.classList.toggle('assistant-open', isOpen);
};

horseAssistantClose?.addEventListener('click', event => {
  event.stopPropagation();
  setHorseAssistantOpen(false);
});

const setNavOpen = isOpen => {
  if (!siteHeader || !navToggle) return;

  siteHeader.classList.toggle('nav-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
};

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    setNavOpen(!isOpen);
  });
}

navDropdowns.forEach(dropdown => {
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');

  if (!toggle) return;

  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', event => {
    event.stopPropagation();
    const isOpen = dropdown.classList.contains('dropdown-open');

    navDropdowns.forEach(item => {
      item.classList.remove('dropdown-open');
      item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });

    dropdown.classList.toggle('dropdown-open', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
});

document.addEventListener('click', event => {
  if (event.target.closest('.nav-dropdown')) return;

  navDropdowns.forEach(dropdown => {
    dropdown.classList.remove('dropdown-open');
    dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });
});

navLinks.forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.getAttribute('href');

    if (!targetId || !targetId.startsWith('#')) {
      navDropdowns.forEach(dropdown => {
        dropdown.classList.remove('dropdown-open');
        dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
      setNavOpen(false);
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setNavOpen(false);
  });
});

const updateHeaderState = () => {
  const heroElement = homeBanner || pageHero;

  if (!siteHeader || !heroElement) return;

  const triggerPoint = heroElement.offsetHeight - siteHeader.offsetHeight;
  siteHeader.classList.toggle('header-scrolled', window.scrollY > triggerPoint);
};

const updateHomeBannerEffect = () => {
  if (!homeBanner || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const progress = Math.min(Math.max(window.scrollY / homeBanner.offsetHeight, 0), 1);
  homeBanner.style.setProperty('--banner-scale', (1 + progress * 0.12).toFixed(3));
  homeBanner.style.setProperty('--banner-shift', `${Math.round(progress * -18)}px`);
  homeBanner.style.setProperty('--banner-dim', (progress * 0.72).toFixed(2));
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px'
});

revealElements.forEach(element => observer.observe(element));

let scrollFrame;

const handleScroll = () => {
  if (scrollFrame) return;

  scrollFrame = requestAnimationFrame(() => {
    updateHeaderState();
    updateHomeBannerEffect();
    scrollFrame = null;
  });
};

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', () => {
  updateHeaderState();
  updateHomeBannerEffect();

  if (window.innerWidth > 768) {
    setNavOpen(false);
  }
});
updateHeaderState();
updateHomeBannerEffect();

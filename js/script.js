const renderPrimaryNav = () => {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  const onHomePage = !window.location.pathname.includes('/pages/');
  const prefix = onHomePage ? 'pages/' : '';
  const homeLink = onHomePage ? '#about' : '../index.html#about';

  nav.innerHTML = `
    <a href="${homeLink}">Home</a>
    <div class="nav-dropdown">
      <button class="nav-dropdown-toggle" type="button">Activities</button>
      <div class="nav-dropdown-menu activities-menu">
        <a href="${prefix}archery.html">Archery</a>
        <a href="${prefix}birthday-party.html">Birthday Parties</a>
        <a href="${prefix}camps-workshops.html">Camps/Workshops</a>
        <a href="${prefix}gallop-care.html">Community Outreach</a>
        <a href="${prefix}events.html">Corporate/Group Events</a>
        <a href="${prefix}activities.html">Learning Journey</a>
        <a href="${prefix}birthday-party.html">Outdoor Pony Hire</a>
        <a href="${prefix}photoshoot.html">Photoshoots</a>
        <a href="${prefix}activities.html">Pony Rides/Feeding</a>
        <a href="${prefix}polo.html">Polo</a>
        <a href="${prefix}riding-lessons.html">Trail/Track Rides</a>
      </div>
    </div>
    <a href="${prefix}promotions.html">Promotions</a>
    <div class="nav-dropdown">
      <button class="nav-dropdown-toggle" type="button">Gallop Cares</button>
      <div class="nav-dropdown-menu">
        <a href="${prefix}gallop-care.html">Gallop Cares</a>
        <a href="${prefix}adopt-a-horse.html">Adopt a Horse</a>
        <a href="${prefix}lease-a-horse.html">Lease a Horse</a>
      </div>
    </div>
    <a href="${prefix}join.html">Join the Team</a>
    <a href="${prefix}contact.html">Contact Us</a>
  `;
};

renderPrimaryNav();

const renderSiteFooter = () => {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  const onHomePage = !window.location.pathname.includes('/pages/');
  const prefix = onHomePage ? 'pages/' : '';
  const imagePrefix = onHomePage ? 'images/' : '../images/';
  const homeLink = onHomePage ? '#about' : '../index.html#about';

  footer.innerHTML = `
    <div class="footer-main">
      <div class="footer-brand">
        <a class="footer-logo" href="${onHomePage ? '#home' : '../index.html'}" aria-label="Gallop Stable home">
          <img src="${imagePrefix}stable_logo.png" alt="Gallop Stable" />
        </a>
        <p>Creating memorable and accessible horse experiences in Singapore since 2003.</p>
      </div>

      <div class="footer-column">
        <h2>Visit Us</h2>
        <div class="footer-locations">
          <div>
            <h3>Admiralty</h3>
            <p>8 Admiralty Rd East, Singapore 759991</p>
            <p>Tel: 6463 6012 / 8383 6425</p>
          </div>
          <div>
            <h3>Pasir Ris Park</h3>
            <p>61 Pasir Ris Green, Pasir Ris Park Carpark C, Singapore 518225</p>
            <p>Tel: 6583 9665</p>
          </div>
          <div>
            <h3>Downtown East</h3>
            <p>1 Pasir Ris Close, Singapore 519599</p>
            <p>Tel: 8787 5377</p>
          </div>
        </div>
      </div>

      <div class="footer-column">
        <h2>Opening Hours</h2>
        <div class="footer-hours">
          <div>
            <h3>Admiralty</h3>
            <p>Daily</p>
            <p>8:30 AM-11:45 AM</p>
            <p>2:30 PM-6:45 PM</p>
          </div>
          <div>
            <h3>Pasir Ris Park</h3>
            <p>Tuesdays-Sundays</p>
            <p>10:00 AM-11:45 AM</p>
            <p>2:00 PM-6:45 PM</p>
          </div>
          <div>
            <h3>Downtown East</h3>
            <p>Wednesdays-Mondays</p>
            <p>9:00 AM-11:45 AM</p>
            <p>2:00 PM-6:45 PM</p>
          </div>
        </div>
      </div>

      <div class="footer-column">
        <h2>Quick Links</h2>
        <nav class="footer-links" aria-label="Footer navigation">
          <a href="${homeLink}">Home</a>
          <a href="${prefix}activities.html">Activities</a>
          <a href="${prefix}promotions.html">Promotions</a>
          <a href="${prefix}gallop-care.html">Gallop Cares</a>
          <a href="${prefix}join.html">Join the Team</a>
          <a href="${prefix}contact.html">Contact Us</a>
        </nav>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 Gallop Stable. All rights reserved.</p>
      <p>Horse riding experiences across Singapore.</p>
    </div>
  `;
};

renderSiteFooter();

const pageGalleryImages = {
  'activities.html': [
    ['pony_ride.jpeg', 'A child enjoying a pony ride'],
    ['Child_and_pony.jpeg', 'A child caring for a pony'],
    ['Trail_Rides_1.jpeg', 'Guests taking part in a trail ride'],
    ['Sunset_with_horses.jpeg', 'Horses at the stable during sunset']
  ],
  'archery.html': [
    ['IMG_8224.jpg', 'Young riders enjoying an outdoor horse activity'],
    ['competition_1.jpg', 'A rider and horse in action'],
    ['riding_training.jpeg', 'Horse riding training at Gallop Stable'],
    ['horses_linedup.jpeg', 'Horses lined up at the stable']
  ],
  'birthday-party.html': [
    ['Child_and_horse.jpeg', 'A smiling child riding a horse'],
    ['pony_ride.jpeg', 'A pony ride at a family event'],
    ['child_pat_pony.jpeg', 'A child gently patting a pony'],
    ['Private_pony_hire_2024-1024x576.jpg', 'A private pony experience']
  ],
  'camps-workshops.html': [
    ['Camps-and-workshops_1.jpg', 'A Gallop Stable camp and workshop'],
    ['Sunset_with_horses.jpeg', 'Horses together at sunset'],
    ['Sembawang_park.jpeg', 'A green outdoor setting near the stable'],
    ['horses_linedup_portrait.jpeg', 'Horses waiting in the riding arena']
  ],
  'gallop-care.html': [
    ['Child_and_pony.jpeg', 'A child caring for a white pony'],
    ['child_pat_pony.jpeg', 'A child connecting with a gentle pony'],
    ['minister.jpeg', 'A community visit with Gallop Stable'],
    ['Child_and_horse.jpeg', 'A joyful riding experience for a child']
  ],
  'adopt-a-horse.html': [
    ['smiling_with_horse.jpeg', 'A rescued horse with a member of the Gallop Stable team'],
    ['Sunset_with_horses.jpeg', 'Horses enjoying the pasture at sunset'],
    ['horses_linedup_portrait.jpeg', 'Gallop Stable horses in the arena'],
    ['Child_and_pony.jpeg', 'A child sharing a gentle moment with a pony']
  ],
  'lease-a-horse.html': [
    ['riding_horse.jpeg', 'A rider building a partnership with a horse'],
    ['riding_training.jpeg', 'Horse and rider training together'],
    ['horse_stable_lifestyle.jpg', 'A rider spending time with a horse'],
    ['riding_with_logo.jpeg', 'A Gallop Stable riding experience']
  ],
  'events.html': [
    ['minister.jpeg', 'Guests attending a Gallop Stable event'],
    ['pony_ride.jpeg', 'A pony ride during a group event'],
    ['horses_linedup.jpeg', 'Horses prepared for a stable activity'],
    ['Sembawang_park.jpeg', 'An outdoor venue surrounded by greenery']
  ],
  'photoshoot.html': [
    ['wedding_photoshoot.jpeg', 'A wedding photoshoot with a horse'],
    ['wedding_photoshoot2.jpeg', 'A couple posing with a horse'],
    ['wedding_photoshoot3.jpeg', 'A wedding couple walking with a horse'],
    ['wedding_photoshoot4.jpeg', 'An elegant equestrian wedding portrait']
  ],
  'polo.html': [
    ['competition_1.jpg', 'A horse activity in the riding arena'],
    ['riding_horse.jpeg', 'An experienced rider on horseback'],
    ['riding_training.jpeg', 'Horse and rider during training'],
    ['horse_stable_lifestyle.jpg', 'A rider enjoying time with a horse']
  ],
  'riding-lessons.html': [
    ['riding_horse.jpeg', 'A riding lesson at Gallop Stable'],
    ['riding_training.jpeg', 'A rider practising in the arena'],
    ['Trail_Rides_1.jpeg', 'A guided trail riding experience'],
    ['horse_stable_lifestyle.jpg', 'A rider building confidence on horseback']
  ],
  'riding.html': [
    ['riding_horse.jpeg', 'A rider on horseback'],
    ['riding_with_logo.jpeg', 'A Gallop Stable riding experience'],
    ['riding_training.jpeg', 'Riding training at the stable'],
    ['Trail_Rides_1.jpeg', 'Riders exploring a trail']
  ],
  'promotions.html': [
    ['Jan_Promo-1024x576.jpeg', 'A Gallop Stable promotion'],
    ['joy-of-riding-website-banner-1024x576.jpg', 'The joy of horse riding'],
    ['Riding-Experience-website-1024x576.jpg', 'A Gallop Stable riding experience'],
    ['Private_pony_hire_2024-1024x576.jpg', 'A private pony hire experience']
  ],
  'career.html': [
    ['career_1.jpg', 'The Gallop Stable team'],
    ['smiling_with_horse.jpeg', 'A team member smiling with a horse'],
    ['riding_with_logo.jpeg', 'A Gallop Stable rider'],
    ['horses_linedup.jpeg', 'Horses ready for the day']
  ],
  'join.html': [
    ['career_1.jpg', 'The Gallop Stable team'],
    ['smiling_with_horse.jpeg', 'A team member with a horse'],
    ['riding_training.jpeg', 'A team member training a horse'],
    ['horses_linedup_portrait.jpeg', 'Horses in the Gallop Stable arena']
  ],
  'volunteer.html': [
    ['smiling_with_horse.jpeg', 'A volunteer spending time with a horse'],
    ['child_pat_pony.jpeg', 'Supporting a child during a pony activity'],
    ['Child_and_pony.jpeg', 'Helping with a community pony experience'],
    ['minister.jpeg', 'A Gallop Stable community programme']
  ]
};

const addPageGallery = () => {
  const main = document.querySelector('main');
  const pageName = window.location.pathname.split('/').pop();
  const images = pageGalleryImages[pageName];

  if (!main || !images || main.querySelector('.page-gallery-section')) return;

  const slides = images.map(([src, alt], index) => `
    <figure class="page-gallery-slide${index === 0 ? ' active' : ''}" aria-hidden="${index === 0 ? 'false' : 'true'}">
      <img class="page-gallery-backdrop" src="../images/${src}" alt="" aria-hidden="true" loading="lazy" />
      <img class="page-gallery-image" src="../images/${src}" alt="${alt}" loading="lazy" />
    </figure>
  `).join('');

  main.insertAdjacentHTML('beforeend', `
    <section class="section page-gallery-section reveal" aria-labelledby="page-gallery-title">
      <div class="section-head">
        <p class="eyebrow">More From Gallop</p>
        <h2 id="page-gallery-title">Experience it in pictures</h2>
      </div>
      <div class="page-gallery-slider" aria-roledescription="carousel">
        <div class="page-gallery-slides">${slides}</div>
        <button class="page-gallery-arrow page-gallery-prev" type="button" aria-label="Previous image">&lsaquo;</button>
        <button class="page-gallery-arrow page-gallery-next" type="button" aria-label="Next image">&rsaquo;</button>
        <div class="page-gallery-dots" aria-label="Choose gallery image">
          ${images.map((_, index) => `<button class="page-gallery-dot${index === 0 ? ' active' : ''}" type="button" aria-label="Show image ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}"></button>`).join('')}
        </div>
      </div>
    </section>
  `);
};

//addPageGallery();

const pageGallerySlider = document.querySelector('.page-gallery-slider');

if (pageGallerySlider) {
  const slides = [...pageGallerySlider.querySelectorAll('.page-gallery-slide')];
  const dots = [...pageGallerySlider.querySelectorAll('.page-gallery-dot')];
  const previousButton = pageGallerySlider.querySelector('.page-gallery-prev');
  const nextButton = pageGallerySlider.querySelector('.page-gallery-next');
  let activeSlide = 0;
  let galleryTimer;

  const showGallerySlide = index => {
    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      dots[slideIndex].classList.toggle('active', isActive);
      dots[slideIndex].setAttribute('aria-current', String(isActive));
    });
  };

  const startGalleryTimer = () => {
    window.clearInterval(galleryTimer);
    galleryTimer = window.setInterval(() => showGallerySlide(activeSlide + 1), 4500);
  };

  previousButton.addEventListener('click', () => {
    showGallerySlide(activeSlide - 1);
    startGalleryTimer();
  });

  nextButton.addEventListener('click', () => {
    showGallerySlide(activeSlide + 1);
    startGalleryTimer();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showGallerySlide(index);
      startGalleryTimer();
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearInterval(galleryTimer);
    } else {
      startGalleryTimer();
    }
  });

  startGalleryTimer();
}

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

const navLinks = document.querySelectorAll('.main-nav a');
const navToggle = document.querySelector('.nav-toggle');
const navDropdowns = document.querySelectorAll('.nav-dropdown');
const revealElements = document.querySelectorAll('.reveal');
const siteHeader = document.querySelector('.site-header');
const homeBanner = document.querySelector('.home-banner');
const pageHero = document.querySelector('.page-hero');

const addSocialFloat = () => {
  if (document.querySelector('.social-float')) return;

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
    </div>
  `);
};

addSocialFloat();

const socialFloat = document.querySelector('.social-float');
const socialToggle = document.querySelector('.social-float-toggle');

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

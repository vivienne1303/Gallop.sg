const navLinks = document.querySelectorAll('.main-nav a');
const navToggle = document.querySelector('.nav-toggle');
const navDropdowns = document.querySelectorAll('.nav-dropdown');
const revealElements = document.querySelectorAll('.reveal');
const siteHeader = document.querySelector('.site-header');
const introCarousel = document.querySelector('.intro-carousel');
const pageHero = document.querySelector('.page-hero');
const carouselSlides = document.querySelectorAll('.carousel-slide');
const carouselPrev = document.querySelector('.carousel-prev');
const carouselNext = document.querySelector('.carousel-next');
let currentSlide = 0;

const addSocialFloat = () => {
  if (document.querySelector('.social-float')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="social-float" aria-label="Social links">
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
  `);
};

addSocialFloat();

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
  const heroElement = introCarousel || pageHero;

  if (!siteHeader || !heroElement) return;

  const triggerPoint = heroElement.offsetHeight - siteHeader.offsetHeight;
  siteHeader.classList.toggle('header-scrolled', window.scrollY > triggerPoint);
};

const showSlide = index => {
  if (!carouselSlides.length) return;

  carouselSlides[currentSlide].classList.remove('active');
  currentSlide = (index + carouselSlides.length) % carouselSlides.length;
  carouselSlides[currentSlide].classList.add('active');
};

if (carouselPrev && carouselNext) {
  carouselPrev.addEventListener('click', () => showSlide(currentSlide - 1));
  carouselNext.addEventListener('click', () => showSlide(currentSlide + 1));
}

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

window.addEventListener('scroll', updateHeaderState);
window.addEventListener('resize', () => {
  updateHeaderState();

  if (window.innerWidth > 768) {
    setNavOpen(false);
  }
});
updateHeaderState();

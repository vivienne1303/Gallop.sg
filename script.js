const navLinks = document.querySelectorAll('.main-nav a');
const revealElements = document.querySelectorAll('.reveal');
const siteHeader = document.querySelector('.site-header');
const introCarousel = document.querySelector('.intro-carousel');
const carouselSlides = document.querySelectorAll('.carousel-slide');
const carouselPrev = document.querySelector('.carousel-prev');
const carouselNext = document.querySelector('.carousel-next');
let currentSlide = 0;

navLinks.forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetId.startsWith('#') && targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const updateHeaderState = () => {
  if (!siteHeader || !introCarousel) return;

  const triggerPoint = introCarousel.offsetHeight - siteHeader.offsetHeight;
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
window.addEventListener('resize', updateHeaderState);
updateHeaderState();

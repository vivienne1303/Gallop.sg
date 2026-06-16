const identityTokenPattern = /(?:confirmation_token|invite_token|recovery_token|access_token)=/;
const sectionFolders = [
  'stable',
  'care',
  'jackuda',
  'polo',
  'archery',
  'green',
  'd-equestrian-paradise',
  'catering',
  'resort'
];

const sectionPagePrefixes = {
  stable: 'stable',
  care: 'care',
  jackuda: 'jackuda',
  polo: 'polo',
  archery: 'archery',
  green: 'green',
  'd-equestrian-paradise': 'd_equestrian_paradise',
  catering: 'catering',
  resort: 'resort'
};

const sectionHomePages = {
  stable: 'stable.html',
  care: 'gallop-care.html',
  jackuda: 'jackuda.html',
  polo: 'polo.html',
  archery: 'archery.html',
  green: 'green.html',
  'd-equestrian-paradise': 'saddlery.html',
  catering: 'catering.html',
  resort: 'resort.html'
};

const getPageContext = () => {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const pagesIndex = pathParts.lastIndexOf('pages');
  const onHomePage = pagesIndex === -1;
  const possibleSection = onHomePage ? '' : pathParts[pagesIndex + 1];
  const isGallopSgPage = possibleSection === 'gallopsg';
  const isMainUtilityPage = false;
  const section = sectionFolders.includes(possibleSection) ? possibleSection : '';

  return { onHomePage, isGallopSgPage, isMainUtilityPage, section };
};

const pageLink = pathFromPages => {
  const { onHomePage, isGallopSgPage, section } = getPageContext();
  if (onHomePage) return `pages/${pathFromPages}`;
  if (isGallopSgPage) {
    if (pathFromPages.startsWith('gallopsg/')) {
      return pathFromPages.slice('gallopsg/'.length);
    }
    return `../${pathFromPages}`;
  }
  if (!section) return pathFromPages;
  if (pathFromPages.startsWith(`${section}/`)) {
    return pathFromPages.slice(section.length + 1);
  }
  return `../${pathFromPages}`;
};

const rootAsset = assetPath => {
  const { onHomePage, isGallopSgPage, section } = getPageContext();
  if (onHomePage) return assetPath;
  if (isGallopSgPage) return `../../${assetPath}`;
  return `${section ? '../../' : '../'}${assetPath}`;
};

if (identityTokenPattern.test(window.location.hash) && !window.location.pathname.includes('/admin/')) {
  window.location.replace(`https://gallopsg.netlify.app/admin/${window.location.hash}`);
}

const renderPrimaryNav = () => {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  const { onHomePage, isGallopSgPage, isMainUtilityPage, section } = getPageContext();
  const onMainSite = onHomePage || isGallopSgPage || isMainUtilityPage;
  const onJackudaActivityPage = section === 'jackuda';
  const onStableActivityPage = section === 'stable';
  const homeLink = onHomePage
    ? '#about'
    : isGallopSgPage
      ? 'index.html#about'
      : section
        ? sectionHomePages[section]
        : 'gallopsg/index.html#about';
  const gallopSgLink = onMainSite
    ? 'index.html'
    : section
      ? '../gallopsg/index.html'
      : 'gallopsg/index.html';
  const activeSection = section || 'stable';
  const activePrefix = sectionPagePrefixes[activeSection];
  const sectionActivityLink = pageLink(`${activeSection}/${activePrefix}_activity.html`);
  const sectionPromotionLink = onMainSite
    ? pageLink('gallopsg/promotion.html')
    : pageLink(`${activeSection}/${activePrefix}_promotion.html`);
  const sectionFaqLink = onMainSite
    ? pageLink('gallopsg/faq.html')
    : pageLink(`${activeSection}/${activePrefix}_faq.html`);
  const sectionJoinLink = onMainSite
    ? pageLink('gallopsg/join.html')
    : pageLink(`${activeSection}/${activePrefix}_join.html`);
  const sectionContactLink = onMainSite
    ? pageLink('gallopsg/contact.html')
    : pageLink(`${activeSection}/${activePrefix}_contact.html`);
  const stableActivityLinks = `
        <a href="${pageLink('stable/riding-lessons.html')}">Riding Lessons</a>
        <a href="${pageLink('stable/adopt-a-horse.html')}">Adopt a Horse</a>
        <a href="${pageLink('stable/lease-a-horse.html')}">Lease a Horse</a>
        <a href="${pageLink('stable/outdoor-pony-hire.html')}">Outdoor Pony Hire</a>`;
  const activityLinks = onStableActivityPage ? stableActivityLinks : `
        <a href="${pageLink('jackuda/birthday-party.html')}">Birthday Parties</a>
        <a href="${pageLink('jackuda/camps-workshops.html')}">Camps/Workshops</a>
        <a href="${pageLink('jackuda/coperate-event.html')}">Corporate/Group Events</a>
        <a href="${pageLink('jackuda/horseshoe-painting.html')}">Horseshoe Painting</a>
        <a href="${pageLink('jackuda/learning-journey.html')}">Learning Journey</a>
        <a href="${pageLink('jackuda/photoshoot.html')}">Photoshoots</a>
        <a href="${pageLink('jackuda/pony-rides-feeding.html')}">Pony Rides/Feeding</a>
        <a href="${pageLink('jackuda/trail-rides.html')}">Trail/Track Rides</a>
        ${onJackudaActivityPage ? '' : stableActivityLinks}`;
  const activitiesMenu = onStableActivityPage || onJackudaActivityPage ? `
    <div class="nav-dropdown">
      <button class="nav-dropdown-toggle" type="button" aria-expanded="false">Activities</button>
      <div class="nav-dropdown-menu activities-menu">
        ${activityLinks}
      </div>
    </div>` : `<a href="${sectionActivityLink}">Activities</a>`;
  const joinMenu = section === 'jackuda' ? `
    <div class="nav-dropdown">
      <button class="nav-dropdown-toggle" type="button" aria-expanded="false">Join the Team</button>
      <div class="nav-dropdown-menu">
        <a href="${sectionJoinLink}">Careers</a>
        <a href="${pageLink('jackuda/volunteer.html')}">Volunteer</a>
      </div>
    </div>` : `<a href="${sectionJoinLink}">Join the Team</a>`;

  nav.innerHTML = `
    <a href="${homeLink}">Home</a>
    ${onMainSite ? '' : activitiesMenu}
    <a href="${sectionPromotionLink}">Promotions</a>
    ${joinMenu}
    <a href="${sectionFaqLink}">FAQs</a>
    <a href="${sectionContactLink}">Contact Us</a>
    ${onMainSite ? '' : `<a href="${gallopSgLink}">Gallop.sg</a>`}
  `;
};

renderPrimaryNav();

const syncScrollingGalleries = () => {
  document.querySelectorAll('.scroll-gallery-track').forEach(track => {
    const groups = [...track.querySelectorAll(':scope > .scroll-gallery-group')];
    const sourceGroup = groups[0];
    if (!sourceGroup) return;

    groups.slice(1).forEach(group => group.remove());

    const loopGroup = sourceGroup.cloneNode(true);
    loopGroup.setAttribute('aria-hidden', 'true');
    loopGroup.querySelectorAll('img').forEach(image => {
      image.alt = '';
      image.loading = 'lazy';
    });
    track.appendChild(loopGroup);
  });
};

syncScrollingGalleries();

const renderSectionJoinPage = () => {
  const joinPage = document.querySelector('[data-section-join]');
  if (!joinPage) return;

  const joinName = joinPage.dataset.joinName;
  const joinImage = joinPage.dataset.joinImage;
  const { section } = getPageContext();
  const contactFile = joinPage.dataset.contactHref
    || (section ? `${sectionPagePrefixes[section]}_contact.html` : 'contact.html');

  joinPage.innerHTML = `
    <section class="page-hero">
      <img src="${joinImage}" alt="${joinName} team" />
      <div class="page-hero-copy reveal">
        <p class="eyebrow">Join The Team</p>
        <h2>Build your career with ${joinName}</h2>
        <p>Work with horses and help create welcoming equestrian experiences for our guests.</p>
      </div>
    </section>

    <section class="stable-careers-section reveal" aria-labelledby="join-careers-title">
      <div class="stable-careers-intro">
        <p>If you share our passion and love for horses and equestrian sports and are searching for a career with horses, look no further.</p>
        <p>We welcome people who are passionate, energetic, animal-loving and eager to learn.</p>
        <h2 id="join-careers-title">We Are Hiring</h2>
      </div>

      <div class="stable-careers-grid">
        <div class="stable-careers-list">
          <article class="stable-career-role">
            <h3>Riding Instructors</h3>
            <p>Singaporeans, Permanent Residents and Malaysians are welcome.</p>
            <p><strong>Working hours:</strong><br>Full-time positions available.</p>
          </article>

          <article class="stable-career-role">
            <h3>Horse Groom (SYCE)</h3>
            <p>Singaporeans, Permanent Residents and Malaysians are welcome.</p>
            <p><strong>Responsibilities:</strong><br>Daily horse care, including grooming, showering, tacking and exercising.</p>
          </article>

          <article class="stable-career-role">
            <h3>Customer Service Officer</h3>
            <p>Singaporeans, Permanent Residents and Malaysians are welcome.</p>
            <p><strong>Working hours:</strong><br>Applicants must be able to work on public holidays and weekends.</p>
          </article>
        </div>

        <aside class="stable-careers-callout">
          <p class="eyebrow">${joinName} Is Hiring</p>
          <h2>We Want You!</h2>
          <p>Are you passionate, energetic, animal-loving and eager to learn?</p>
          <p>We are looking for friendly people who are ready to grow with our team.</p>
          <a class="btn btn-primary" href="${contactFile}">Contact Us</a>
        </aside>
      </div>
    </section>
  `;
};

const renderSectionContactPage = () => {
  const contactPage = document.querySelector('[data-section-contact]');
  if (!contactPage) return;

  const contactName = contactPage.dataset.contactName;
  const contactImage = contactPage.dataset.contactImage;

  contactPage.innerHTML = `
    <section class="page-hero">
      <img src="${contactImage}" alt="${contactName} contact" />
      <div class="page-hero-copy reveal">
        <p class="eyebrow">Contact Us</p>
        <h2>Visit our stables or send us a message</h2>
      </div>
    </section>
    <section class="contact-form-section reveal" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title">Contact Us Now</h2>
      <form class="contact-form" data-whatsapp-contact>
        <div class="contact-form-field">
          <label for="contact-name">Your Name <span>(required)</span></label>
          <input id="contact-name" name="Name" type="text" autocomplete="name" required />
        </div>
        <div class="contact-form-field">
          <label for="contact-email">Your Email <span>(required)</span></label>
          <input id="contact-email" name="Email" type="email" autocomplete="email" required />
        </div>
        <div class="contact-form-field">
          <label for="contact-phone">Your Phone Number</label>
          <input id="contact-phone" name="Phone number" type="tel" autocomplete="tel" />
        </div>
        <div class="contact-form-field">
          <label for="contact-subject">Subject</label>
          <input id="contact-subject" name="Subject" type="text" value="${contactName}" />
        </div>
        <div class="contact-form-field">
          <label for="contact-message">Your Message</label>
          <textarea id="contact-message" name="Message" rows="10"></textarea>
        </div>
        <button class="contact-form-submit" type="submit">Send</button>
      </form>
    </section>
    <section class="section contact-section reveal">
      <div class="contact-grid">
        <div class="contact-copy">
          <p class="eyebrow">Enquiries</p>
          <h2>We would love to hear from you</h2>
          <p>Enquiry email: <a href="mailto:enquiry@gallopstable.com">enquiry@gallopstable.com</a></p>
        </div>
        <div class="contact-cards">
          <a class="info-card reveal" href="https://maps.app.goo.gl/V8sWLNMiteq4PYPT7" target="_blank" rel="noopener noreferrer"><h3>Gallop Stable @ Admiralty</h3><p>8 Admiralty Rd East, Singapore 759991</p><p><strong>Parking:</strong> Available at St Helena Road</p><p><strong>Tel:</strong> 6463 6012 / 8383 6425</p><p><strong>Walk-in hours:</strong> Daily, 8:30 AM - 12:00 PM | 2:30 PM - 7:00 PM</p><p><strong>Instagram:</strong> @gallop.sg</p></a>
          <a class="info-card reveal" href="https://maps.app.goo.gl/AuM9Wis6vVBBnEHq8" target="_blank" rel="noopener noreferrer"><h3>Gallop Stable @ Pasir Ris</h3><p>61 Pasir Ris Green, Pasir Ris Park Carpark C, Singapore 518225</p><p><strong>Tel:</strong> 6583 9665</p><p><strong>Walk-in hours:</strong> Tuesdays - Sundays, 10:00 AM - 11:30 AM | 2:00 PM - 6:30 PM</p><p><strong>Instagram:</strong> @gallopstablepasirris</p></a>
          <a class="info-card reveal" href="https://maps.app.goo.gl/nSNznPFzbHDDyW5v7" target="_blank" rel="noopener noreferrer"><h3>Gallop Stable @ Downtown East</h3><p>1 Pasir Ris Close, Singapore 519599</p><p><strong>Parking:</strong> Available at D'Resort</p><p><strong>Tel:</strong> 8787 5377</p><p><strong>Walk-in hours:</strong> Daily, 9:00 AM - 12:00 PM | 2:00 PM - 7:00 PM</p><p><strong>Email:</strong> gallopdowntown@gallopstable.com</p><p><strong>Instagram:</strong> @gallopstabledowntowneast</p></a>
        </div>
      </div>
    </section>
  `;
};

const routeSectionContactLinks = () => {
  const { section } = getPageContext();
  if (!section) return;

  const contactFile = `${sectionPagePrefixes[section]}_contact.html`;
  document.querySelectorAll('a[href="../gallopsg/contact.html"]').forEach(link => {
    link.href = contactFile;
  });
};

const initializeWhatsAppContactForms = () => {
  const whatsappNumber = '6583836425';

  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();

      const formData = new FormData(form);
      const message = [
        'Hello Gallop SG, I would like to make an enquiry.',
        '',
        `Name: ${formData.get('Name') || '-'}`,
        `Email: ${formData.get('Email') || '-'}`,
        `Phone: ${formData.get('Phone number') || '-'}`,
        `Subject: ${formData.get('Subject') || '-'}`,
        '',
        `Message: ${formData.get('Message') || '-'}`
      ].join('\n');

      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener,noreferrer'
      );
    });
  });
};

renderSectionJoinPage();
renderSectionContactPage();
routeSectionContactLinks();
initializeWhatsAppContactForms();

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
              <h3>Admiralty East</h3>
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
            <h3>Admiralty East</h3>
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

const escapeCmsText = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderCmsPriceTable = price => {
  const header = price.sessions.map(session => `<th>${escapeCmsText(session)}</th>`).join('');
  const weekday = price.weekday.map(value => `<td>${escapeCmsText(value)}</td>`).join('');
  const weekend = price.weekend.map(value => `<td>${escapeCmsText(value)}</td>`).join('');
  const details = price.details?.length
    ? `<ul class="rate-meta">${price.details.map(detail => `<li>${escapeCmsText(detail)}</li>`).join('')}</ul>`
    : '';

  return `
    <article class="rate-card reveal reveal-visible">
      <h3>${escapeCmsText(price.name)}</h3>
      <div class="rate-card-body">
        ${details}
        <table class="price-table">
          <tr><th>Session</th>${header}</tr>
          <tr><th>Weekday</th>${weekday}</tr>
          <tr><th>Weekend</th>${weekend}</tr>
        </table>
      </div>
    </article>
  `;
};

const applyCmsContent = content => {
  const aboutHeading = document.querySelector('#about .hero-copy h2');
  const aboutIntroduction = document.querySelector('#about .hero-copy > p:not(.eyebrow)');
  const storySection = document.querySelector('.about-story-alt .about-story-copy');

  if (content.about && aboutHeading) aboutHeading.textContent = content.about.heading;
  if (content.about && aboutIntroduction) aboutIntroduction.textContent = content.about.introduction;
  if (content.about && storySection) {
    const storyHeading = storySection.querySelector('h2');
    if (storyHeading) storyHeading.textContent = content.about.story_heading;

    storySection.querySelectorAll(':scope > p:not(.eyebrow):not(.about-story-closing)').forEach(paragraph => paragraph.remove());
    const closing = storySection.querySelector('.about-story-closing');
    content.about.story_paragraphs?.forEach(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      storySection.insertBefore(paragraph, closing);
    });
  }

  const faqList = document.querySelector('.faq-list');
  if (faqList && content.faqs?.length) {
    faqList.replaceChildren(...content.faqs.map((faq, index) => {
      const item = document.createElement('details');
      item.className = 'faq-item';
      item.open = index === 0;

      const summary = document.createElement('summary');
      summary.textContent = faq.question;
      const answer = document.createElement('div');
      answer.className = 'faq-answer';
      const paragraph = document.createElement('p');
      paragraph.textContent = faq.answer;
      answer.appendChild(paragraph);
      item.append(summary, answer);
      return item;
    }));
  }

  const contactEmail = document.querySelector('.contact-copy p:not(.eyebrow)');
  if (contactEmail && content.contact?.email) {
    contactEmail.replaceChildren('Enquiry email: ');
    const link = document.createElement('a');
    link.href = `mailto:${content.contact.email}`;
    link.textContent = content.contact.email;
    contactEmail.appendChild(link);
  }

  const contactCards = document.querySelector('.contact-cards');
  if (contactCards && content.locations?.length) {
    contactCards.replaceChildren(...content.locations.map(location => {
      const card = document.createElement('a');
      card.className = 'info-card reveal reveal-visible';
      card.href = location.map_url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      const lines = [
        location.address,
        location.parking && `Parking: ${location.parking}`,
        `Tel: ${location.phone}`,
        `Walk-in hours: ${location.days}, ${location.morning_hours} | ${location.afternoon_hours}`,
        location.email && `Email: ${location.email}`,
        location.instagram && `Instagram: ${location.instagram}`
      ].filter(Boolean);
      const heading = document.createElement('h3');
      heading.textContent = location.name;
      card.appendChild(heading);
      lines.forEach(line => {
        const paragraph = document.createElement('p');
        paragraph.textContent = line;
        card.appendChild(paragraph);
      });
      return card;
    }));
  }

  document.querySelectorAll('[data-cms-price-group]').forEach(grid => {
    const prices = content.lesson_prices?.filter(price => price.group === grid.dataset.cmsPriceGroup);
    if (prices?.length) grid.innerHTML = prices.map(renderCmsPriceTable).join('');
  });

  const footerCards = [...document.querySelectorAll('.footer-location-card:not(.footer-carpark-card)')];
  footerCards.forEach((card, index) => {
    const location = content.locations?.[index];
    if (!location) return;
    const heading = card.querySelector('h3');
    const address = card.querySelector('.footer-location-details > p');
    const hours = card.querySelector('.footer-location-hours');
    if (heading) heading.textContent = location.name.replace('Gallop Stable @ ', '');
    if (address) address.textContent = location.address;
    if (hours) {
      hours.innerHTML = `<p class="footer-days">${escapeCmsText(location.days)}</p><p>${escapeCmsText(location.morning_hours)}</p><p>${escapeCmsText(location.afternoon_hours)}</p>`;
    }
  });
};

const loadCmsContent = async () => {
  const contentPath = rootAsset('content/site.json');

  try {
    const response = await fetch(contentPath, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`CMS content request failed: ${response.status}`);
    applyCmsContent(await response.json());
  } catch (error) {
    console.warn('Using built-in page content because CMS content could not be loaded.', error);
  }
};

loadCmsContent();

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

  const gallopKnowledge = [
    {
      patterns: [/parking|carpark|where.*park/],
      answer: 'For Admiralty, taxi and private-hire drop-offs can use 8 Admiralty Road East, while drivers should use the carpark at St Helena Road. Downtown East parking is available at D\'Resort. Pasir Ris Stable is beside Pasir Ris Park Carpark C.'
    },
    {
      patterns: [/feeding.*(long|duration|time)|how long.*feed|spend.*stable/],
      answer: 'Pony feeding is self-paced during the allocated feeding hour. Purchase a packet of feed and feed the ponies that are available during that period.'
    },
    {
      patterns: [/how long.*pony ride|pony ride.*(long|duration|minutes)/],
      answer: 'Pony rides at Admiralty and Pasir Ris Park take about 3 to 5 minutes per round. Downtown East pony rides take about 2 to 3 minutes per round.'
    },
    {
      patterns: [/weight.*limit|too heavy|maximum.*weight|40\s*kg|75\s*kg/],
      answer: 'The weight limit is 40 kg for pony rides and junior pony lessons, and 75 kg for horse rides and standard riding lessons.'
    },
    {
      patterns: [/what.*wear|attire|clothes|covered shoes|long pants/],
      answer: 'Long pants and covered shoes are recommended. Proper riding attire is compulsory for enrolled riders. Helmet rental is S$5, boots rental is S$5, and the Gallop T-shirt is S$30.'
    },
    {
      patterns: [/registration fee|rental fee|helmet.*rent|boots.*rent|starter pack|gallop t-?shirt/],
      answer: 'New lesson enrolments have a one-time S$30 registration fee. The Gallop T-shirt is S$30. Helmet rental and boots rental are S$5 each. A starter pack with uniform, breeches, boots and helmet is also available.'
    },
    {
      patterns: [/pony intro|3 year|three year/],
      answer: 'The Pony Intro Lesson is a 20-minute session for 3-year-olds weighing 40 kg or below. It costs S$70.85 for one weekday session or S$87.20 for one weekend session. Prices include GST.'
    },
    {
      patterns: [/pony private junior|junior pony lesson|4.?12 year|younger rider/],
      answer: 'Pony Private Junior is a 30-minute one-to-one lesson for children aged 4 to 12 weighing 40 kg or below. One session costs S$92.65 on weekdays or S$109 on weekends. Prices include GST.'
    },
    {
      patterns: [/(private full|private lesson).*(price|cost|rate)|(?:price|cost|rate).*private lesson/],
      answer: 'Beginner-Novice Private Full lessons are 45 minutes for riders aged 6 and above, up to 75 kg. One session costs S$109 on weekdays or S$130.80 on weekends. A 10-session package costs S$931.95 on weekdays or S$1,128.15 on weekends. Prices include GST.'
    },
    {
      patterns: [/(semi.?private).*(price|cost|rate)|(?:price|cost|rate).*semi.?private/],
      answer: 'Beginner-Novice Semi-Private lessons are 45 minutes for 2 riders aged 7 and above, up to 75 kg. One session costs S$98.10 on weekdays or S$119.90 on weekends. A 10-session package costs S$833.85 on weekdays or S$1,030.05 on weekends. Prices include GST.'
    },
    {
      patterns: [/(group lesson).*(price|cost|rate)|(?:price|cost|rate).*group lesson/],
      answer: 'Beginner-Novice Group lessons are 45 minutes for 3 to 5 riders aged 7 and above, up to 75 kg. One session costs S$87.20 on weekdays or S$109 on weekends. A 10-session package costs S$735.75 on weekdays or S$931.95 on weekends. Prices include GST.'
    },
    {
      patterns: [/progression.*(price|cost|rate)|intermediate.*(price|cost|rate)|advanced.*(price|cost|rate)/],
      answer: 'Progression lesson prices per session are: Private Full S$136.25 weekday or S$158.05 weekend; Semi-Private S$125.35 weekday or S$147.15 weekend; Group S$114.45 weekday or S$136.25 weekend. Ten-session packages are also available, and prices include GST.'
    },
    {
      patterns: [/lesson.*(price|cost|rate)|(?:price|cost|rate).*lesson|how much.*lesson/],
      answer: 'Lesson prices vary by level and format. Beginner-Novice single sessions start from S$87.20 for Group, S$98.10 for Semi-Private and S$109 for Private Full on weekdays. Junior Pony Intro starts at S$70.85. Weekend and package rates are available, and all listed prices include GST.'
    },
    {
      patterns: [/admiralty.*(pony|horse|feeding|craft).*(price|cost)|(?:price|cost).*admiralty/],
      answer: 'Admiralty walk-in prices are S$15 for a pony ride, S$20 for a horse ride, S$2 per pony-feed packet, and arts and crafts from S$6. Ride tickets are purchased over the counter.'
    },
    {
      patterns: [/pasir ris.*(pony|horse|feeding|craft).*(price|cost)|(?:price|cost).*pasir ris/],
      answer: 'Pasir Ris Park walk-in prices are S$10 for a pony ride, S$15 for a horse ride, S$2 per pony-feed packet, and arts and crafts from S$6. Ride tickets are purchased over the counter.'
    },
    {
      patterns: [/(downtown east|d['’]?resort).*(pony|feeding|craft).*(price|cost)|(?:price|cost).*(downtown east|d['’]?resort)/],
      answer: 'Downtown East walk-in prices are S$10 for a pony ride, S$2 to S$5 for pony feeding, and arts and crafts from S$12. Tickets are purchased over the counter.'
    },
    {
      patterns: [/pony feeding|feed.*pony|feeding.*price|feed packet/],
      answer: 'Pony feeding costs S$2 per packet at Admiralty and Pasir Ris Park, and S$2 to S$5 at Downtown East. Feeding is self-paced within the allocated feeding hour and depends on pony availability.'
    },
    {
      patterns: [/pony ride|horse ride|joy ride/],
      answer: 'Walk-in pony and horse rides are available at selected stables. Admiralty offers S$15 pony rides and S$20 horse rides. Pasir Ris Park offers S$10 pony rides and S$15 horse rides. Downtown East offers S$10 pony rides. Please call before visiting because weather, horse welfare or private events can affect availability.'
    },
    {
      patterns: [/book.*lesson|lesson.*book|advance booking.*lesson/],
      answer: {
        text: 'Riding lessons require advance booking of at least 2 to 3 days. Book through WhatsApp at +65 8383 6425 or email enquiry@gallopstable.com with the rider\'s age, height, weight, experience and preferred date.',
        whatsapp: true
      }
    },
    {
      patterns: [/book.*pony ride|pony ride.*book|advance booking.*pony/],
      answer: 'Pony rides usually do not require advance booking and tickets can be bought over the counter. Calling the branch before visiting is recommended because rides may pause for bad weather, horse welfare or private bookings.'
    },
    {
      patterns: [/beginner|first time|learn.*ride|start.*riding/],
      answer: 'Beginners can start with private or group lessons covering leading, mounting, correct riding position, walking, trotting, stopping and safe dismounting. Shorter sessions are recommended for young or new riders while strength, stamina and confidence develop.'
    },
    {
      patterns: [/novice/],
      answer: 'Novice lessons are for riders with secure basic skills who want to improve technique, seat and hands, learn to canter and ride over poles. Group lessons also build confidence around other horses and riders.'
    },
    {
      patterns: [/advanced lesson|experienced rider|show jumping|lateral movement/],
      answer: 'Advanced lessons include lateral movements, advanced schooling exercises, effective riding technique and show jumping. Riders can discuss particular skills or goals with their instructor.'
    },
    {
      patterns: [/riding lesson|lesson type|group lesson|private lesson|semi.?private lesson/],
      answer: 'Gallop offers Private Full, Semi-Private and Group riding lessons for beginner, novice, intermediate and advanced riders, plus shorter junior pony lessons for young children. Suitability depends on age, weight and riding experience.'
    },
    {
      patterns: [/trail ride|track ride/],
      answer: 'Gallop offers trail and track riding experiences for suitable riders. Availability and rider requirements vary, so contact the team with the rider\'s age, height, weight and riding experience.'
    },
    {
      patterns: [/location|address|where.*stable|where are/],
      answer: 'Gallop Stable has three locations: Admiralty at 8 Admiralty Road East, Singapore 759991; Pasir Ris Park at 61 Pasir Ris Green, Carpark C, Singapore 518225; and Downtown East at 1 Pasir Ris Close, Singapore 519599.'
    },
    {
      patterns: [/opening|hours|open|closing|what time/],
      answer: 'Admiralty opens daily from 8:30 AM to 11:45 AM and 2:30 PM to 6:45 PM. Pasir Ris Park opens Tuesdays to Sundays from 10:00 AM to 11:45 AM and 2:00 PM to 6:45 PM. Downtown East opens Wednesdays to Mondays from 9:00 AM to 11:45 AM and 2:00 PM to 6:45 PM.'
    },
    {
      patterns: [/adopt|rescue|support.*horse/],
      answer: {
        text: 'The Adopt a Horse programme supports rescued horses by contributing towards feed, grooming, stable care and daily needs. Available horses are listed on the Adopt a Horse page. Contact the team on WhatsApp to arrange support.',
        whatsapp: true
      }
    },
    {
      patterns: [/lease/],
      answer: 'Horse leasing provides regular time with a suitable horse while developing riding and horsemanship skills. Riders are matched according to experience, goals, availability and horse wellbeing.'
    },
    {
      patterns: [/birthday|party/],
      answer: {
        text: 'Gallop Stable hosts birthday experiences with ponies, horses and stable activities. Contact the team with your preferred date, location, group size and the children\'s ages to discuss the available package.',
        whatsapp: true
      }
    },
    {
      patterns: [/camp|workshop|stable tour/],
      answer: 'Gallop offers stable tours, riding workshops, 2-day/1-night pony weekend camps and 3-day/2-night outback campfire weekends. Programmes and dates vary, so confirm the current schedule with the team.'
    },
    {
      patterns: [/photo|wedding|video.*shoot|photoshoot/],
      answer: {
        text: 'Photoshoots and videoshoots with horses are available by advance enquiry for couples, families, riders, weddings and special occasions.',
        whatsapp: true
      }
    },
    {
      patterns: [/event|corporate|team building|outside event/],
      answer: {
        text: 'Gallop supports corporate outings, group activities, team building, celebrations and selected outside pony or horse hire. Share your date, group size, location and preferred activities with the team.',
        whatsapp: true
      }
    },
    {
      patterns: [/polo/],
      answer: 'Gallop offers beginner-friendly polo lessons where children and adults can learn the basics and take their first swing.'
    },
    {
      patterns: [/archery/],
      answer: 'Gallop offers ground archery and horseback archery experiences that develop focus, balance and trust. Contact the team to confirm suitability and availability.'
    },
    {
      patterns: [/activities|what.*do|things to do|experience/],
      answer: 'Activities include riding lessons, pony and horse rides, pony feeding, arts and crafts, carriage rides, birthday parties, stable tours, camps, team building, photoshoots, pony grooming, polo and archery. Availability varies by location.'
    },
    {
      patterns: [/about|who.*gallop|history|since 2003/],
      answer: 'Gallop Stable has offered public horse experiences in Singapore since 2003. It began with 13 ponies at Pasir Ris Park and now operates at Admiralty, Pasir Ris Park and Downtown East, with a strong focus on accessible riding and giving rescued racehorses a second chance.'
    },
    {
      patterns: [/email/],
      answer: 'General enquiries can be emailed to enquiry@gallopstable.com. Downtown East can also be reached at gallopdowntown@gallopstable.com.'
    },
    {
      patterns: [/phone|contact|whatsapp|manager|staff|human|person/],
      answer: {
        text: 'Contact Gallop Stable on WhatsApp at +65 8383 6425 or email enquiry@gallopstable.com. Admiralty: 6463 6012 / 8383 6425. Pasir Ris Park: 6583 9665. Downtown East: 8787 5377.',
        whatsapp: true
      }
    },
    {
      patterns: [/book|availability|available|reserve|appointment/],
      answer: {
        text: 'For live availability, send the team your preferred activity, location, date, time, number of participants and rider details. Lessons need at least 2 to 3 days\' advance booking, while walk-in rides are usually purchased over the counter.',
        whatsapp: true
      }
    },
    {
      patterns: [/price|cost|fee|how much|rate/],
      answer: 'Prices depend on the activity and location. Walk-in pony rides start from S$10, horse rides from S$15, pony feeding from S$2 and riding lessons from S$70.85. Ask about a specific activity or lesson type for an exact website price.'
    }
  ];

  const getGallopAnswer = question => {
    const text = question.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim();

    if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/.test(text)) {
      return 'Hi! I can answer questions about lessons and prices, walk-in activities, locations, opening hours, parking, pony feeding, booking, events, adoption, leasing and contact details.';
    }

    const match = gallopKnowledge.find(entry => entry.patterns.some(pattern => pattern.test(text)));

    if (match) return match.answer;

    return {
      text: 'I could not find a confident answer in the website information. Please send your question to the Gallop Stable team on WhatsApp at +65 8383 6425.',
      whatsapp: true
    };
  };

  const appendChatMessage = (content, sender, originalQuestion = '') => {
    const message = document.createElement('div');
    message.className = `ai-message ai-message-${sender}`;

    if (sender === 'bot') {
      const avatar = document.createElement('img');
      avatar.src = rootAsset('images/gallop-ai-horse.png');
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
    typing.innerHTML = `<img src="${rootAsset('images/gallop-ai-horse.png')}" alt=""><div><span></span><span></span><span></span></div>`;
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
const homeBannerVideo = document.querySelector('.home-banner-video');
const pageHero = document.querySelector('.page-hero');

const updateHomeBannerRatio = () => {
  if (!homeBanner || !homeBannerVideo || !homeBannerVideo.videoWidth || !homeBannerVideo.videoHeight) return;

  homeBanner.style.setProperty(
    '--video-aspect-ratio',
    `${homeBannerVideo.videoWidth} / ${homeBannerVideo.videoHeight}`
  );
};

if (homeBannerVideo) {
  homeBannerVideo.addEventListener('loadedmetadata', updateHomeBannerRatio);
  updateHomeBannerRatio();
}

const horseAssistantWelcomeKey = 'gallop-ai-welcome-shown';

const hasSeenHorseAssistantWelcome = () => {
  try {
    return window.localStorage.getItem(horseAssistantWelcomeKey) === 'true';
  } catch {
    return false;
  }
};

const rememberHorseAssistantWelcome = () => {
  try {
    window.localStorage.setItem(horseAssistantWelcomeKey, 'true');
  } catch {
    // The welcome may repeat when browser storage is unavailable.
  }
};

const shouldShowHorseAssistantWelcome = !hasSeenHorseAssistantWelcome();

const renderHorseAssistant = () => {
  const chatLink = pageLink('gallopsg/gallop-ai.html');

  return `
    <div class="horse-assistant${shouldShowHorseAssistantWelcome ? ' assistant-open' : ''}">
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
        <img src="${rootAsset('images/gallop-ai-horse.png')}" alt="" />
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

if (shouldShowHorseAssistantWelcome) {
  rememberHorseAssistantWelcome();
}

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

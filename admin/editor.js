const DEFAULT_API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000'
  : 'https://gallopsg-production.up.railway.app';
const API_BASE = String(window.GALLOP_ADMIN_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');
const CONTENT_URL = '../content/site.json';
const TOKEN_KEY = 'gallop_admin_session';

const PAGE_OPTIONS = [
  ['index.html', 'Website Home'], ['pages/gallopsg/index.html', 'Gallop SG Home'],
  ['pages/gallopsg/gallop-ai.html', 'Gallop AI'], ['pages/gallopsg/promotion.html', 'Promotions'],
  ['pages/gallopsg/join.html', 'Join the Team'], ['pages/gallopsg/faq.html', 'FAQs'],
  ['pages/gallopsg/contact.html', 'Contact'], ['pages/stable/stable.html', 'Gallop Stable'],
  ['pages/stable/riding-lessons.html', 'Riding Lessons'], ['pages/stable/adopt-a-horse.html', 'Adopt a Horse'],
  ['pages/stable/lease-a-horse.html', 'Lease a Horse'], ['pages/stable/outdoor-pony-hire.html', 'Outdoor Pony Hire'],
  ['pages/care/gallop-care.html', 'Gallop CARES'], ['pages/jackuda/jackuda.html', 'Gallop Jackuda'],
  ['pages/jackuda/camps-workshops.html', 'Camps and Workshops'], ['pages/jackuda/birthday-party.html', 'Birthday Party'],
  ['pages/jackuda/horseshoe-painting.html', 'Horseshoe Painting'], ['pages/jackuda/learning-journey.html', 'Learning Journey'],
  ['pages/jackuda/photoshoot.html', 'Photoshoot'], ['pages/jackuda/pony-rides-feeding.html', 'Pony Rides and Feeding'],
  ['pages/jackuda/trail-rides.html', 'Trail Rides']
];
const GALLERY_PAGES = new Set(['index.html','pages/gallopsg/index.html','pages/stable/stable.html','pages/stable/riding-lessons.html','pages/stable/outdoor-pony-hire.html','pages/care/gallop-care.html','pages/jackuda/jackuda.html','pages/jackuda/birthday-party.html','pages/jackuda/horseshoe-painting.html','pages/jackuda/learning-journey.html','pages/jackuda/photoshoot.html','pages/jackuda/pony-rides-feeding.html']);
const PANEL_COPY = {
  pages:['Pages','Edit page text and hero picture','Choose a page, then update what visitors see at the top.'],
  galleries:['Pictures','Arrange picture galleries','Upload, describe and drag pictures into the order visitors will see.'],
  about:['Main content','Edit the About Us section','Update the introduction and arrange the story paragraphs.'],
  faqs:['Help content','Edit frequently asked questions','Add, remove or rearrange questions and answers.'],
  contact:['Contact','Edit contact details','Keep the general email and WhatsApp number current.'],
  locations:['Visit us','Edit stable locations','Update addresses, opening hours and contact details.'],
  prices:['Riding lessons','Edit lesson prices','Update lesson names, details, sessions and prices carefully.']
};

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const clone = value => JSON.parse(JSON.stringify(value));
const pageName = path => PAGE_OPTIONS.find(([value]) => value === path)?.[1] || path;
const publicPath = path => `../${path}`;

let content = null;
let originalContent = null;
let currentPanel = 'pages';
let selectedPage = 'index.html';
let selectedGalleryPath = 'index.html';
let pendingUploads = new Map();
let pageDrafts = new Map();
let pagesLoading = new Set();
let galleryDrafts = new Map();
let galleriesLoading = new Set();
let dirty = false;
let dragContext = null;

function token(){ return sessionStorage.getItem(TOKEN_KEY) || ''; }
function setState(state, text){ const el=$('#save-state'); el.dataset.state=state; $('b',el).textContent=text; }
function markDirty(){ dirty=true; setState('dirty','Unpublished changes'); }
function toast(message, error=false){ const el=$('#toast'); el.textContent=message; el.className=`toast show${error?' error':''}`; clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.className='toast',3500); }
function imageSrc(path){ if(!path) return '../images/Child_and_horse.jpeg'; const pending=pendingUploads.get(path); if(pending?.dataUrl)return pending.dataUrl; if(path.startsWith('data:') || path.startsWith('blob:') || /^https?:/.test(path)) return path; return `../${path.replace(/^\//,'')}`; }
function optionsHtml(filter=()=>true){ return PAGE_OPTIONS.filter(([path])=>filter(path)).map(([path,label])=>`<option value="${escapeHtml(path)}">${escapeHtml(label)}</option>`).join(''); }
function makeImageName(file){ const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'') || 'jpg'; const stem=file.name.replace(/\.[^.]+$/,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'picture'; return `images/uploads/${Date.now()}-${stem}.${ext}`; }

async function api(path, options={}){
  const headers={...(options.headers||{})};
  if(token()) headers.Authorization=`Bearer ${token()}`;
  if(options.body && !headers['Content-Type']) headers['Content-Type']='application/json';
  const response=await fetch(`${API_BASE}${path}`,{...options,headers});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error || 'The editor could not connect to the publishing service.');
  return data;
}

async function loadContent(){
  const response=await fetch(`${CONTENT_URL}?v=${Date.now()}`,{cache:'no-store'});
  if(!response.ok) throw new Error('Could not load the website content.');
  content=await response.json();
  content.pages ||= []; content.galleries ||= []; content.faqs ||= []; content.locations ||= []; content.lesson_prices ||= [];
  originalContent=clone(content); pendingUploads.clear(); pageDrafts.clear(); pagesLoading.clear(); galleryDrafts.clear(); galleriesLoading.clear(); dirty=false; setState('saved','All changes saved locally'); render();
}

function showEditor(){ $('#login-screen').hidden=true; $('#editor-shell').hidden=false; loadContent().catch(error=>toast(error.message,true)); }
async function restoreSession(){
  if(!token()) return;
  try{ await api('/api/admin/session'); showEditor(); }catch{ sessionStorage.removeItem(TOKEN_KEY); }
}

$('#login-form').addEventListener('submit',async event=>{
  event.preventDefault(); const button=$('button[type=submit]',event.currentTarget); const error=$('#login-error');
  button.disabled=true; button.textContent='Signing in...'; error.textContent='';
  try{ const data=await api('/api/admin/login',{method:'POST',body:JSON.stringify({password:$('#password').value})}); sessionStorage.setItem(TOKEN_KEY,data.token); $('#password').value=''; showEditor(); }
  catch(err){ error.textContent=err.message; }
  finally{ button.disabled=false; button.textContent='Sign in'; }
});
$('#show-password').addEventListener('click',()=>{ const input=$('#password'); input.type=input.type==='password'?'text':'password'; $('#show-password').textContent=input.type==='password'?'Show':'Hide'; });
$('#logout-button').addEventListener('click',()=>{ if(dirty&&!confirm('Sign out and discard your unpublished changes?'))return; sessionStorage.removeItem(TOKEN_KEY); location.reload(); });
$('#editor-nav').addEventListener('click',event=>{ const button=event.target.closest('[data-panel]'); if(!button)return; currentPanel=button.dataset.panel; $$('.nav-item').forEach(item=>item.classList.toggle('active',item===button)); render(); });
$('#discard-button').addEventListener('click',()=>{ if(!dirty || confirm('Discard every unpublished change?')){ content=clone(originalContent); pendingUploads.clear(); pageDrafts.clear(); galleryDrafts.clear(); dirty=false; setState('saved','All changes saved locally'); render(); }});
$('#publish-button').addEventListener('click',()=>{ if(!dirty){toast('There are no new changes to publish.');return;} $('#publish-message').value=''; $('#publish-dialog').showModal(); });
$('#cancel-publish').addEventListener('click',()=>$('#publish-dialog').close());
$('#confirm-publish').addEventListener('click',publish);
window.addEventListener('beforeunload',event=>{ if(dirty){event.preventDefault();event.returnValue='';} });

function render(){
  if(!content)return; const [kicker,title,description]=PANEL_COPY[currentPanel];
  $('#panel-kicker').textContent=kicker; $('#panel-title').textContent=title; $('#panel-description').textContent=description;
  $('#live-page-link').hidden=!['pages','galleries'].includes(currentPanel);
  $('#live-page-link').href=publicPath(currentPanel==='pages'?selectedPage:selectedGalleryPath);
  ({pages:renderPages,galleries:renderGalleries,about:renderAbout,faqs:renderFaqs,contact:renderContact,locations:renderLocations,prices:renderPrices}[currentPanel])();
}
function attachInputs(root=$('#panel-root')){ $$('[data-bind]',root).forEach(input=>input.addEventListener('input',()=>{ setPath(input.dataset.bind,input.value); markDirty(); renderPreviewOnly(); })); }
function setPath(path,value){ const keys=path.split('.'); let cursor=content; keys.slice(0,-1).forEach(key=>cursor=cursor[Number.isNaN(Number(key))?key:Number(key)]); cursor[keys.at(-1)]=value; }
function renderPreviewOnly(){ if(currentPanel==='pages') updatePagePreview(); if(currentPanel==='about') updateAboutPreview(); if(currentPanel==='contact') updateContactPreview(); }

function pageRecord(path){ return content.pages.find(page=>page.path===path) || pageDrafts.get(path) || null; }
async function importOriginalPage(path){
  if(pagesLoading.has(path))return;
  pagesLoading.add(path);
  try{
    const pageUrl=new URL(publicPath(path),location.href);
    const response=await fetch(`${pageUrl.href}?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error('Could not load the selected website page.');
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    const hero=doc.querySelector('.page-hero, .ai-chat-intro, .home-banner');
    const copy=hero?.querySelector('.page-hero-copy, .ai-chat-intro > div, .home-banner-content');
    const image=hero?.querySelector(':scope > img, .home-banner-video-poster');
    let heroImage='';
    if(image?.getAttribute('src')){
      const resolved=new URL(image.getAttribute('src'),pageUrl);
      const marker='/Gallop.sg/';
      heroImage=resolved.pathname.includes(marker)?resolved.pathname.split(marker)[1]:resolved.pathname.replace(/^\//,'');
    }
    pageDrafts.set(path,{
      path,
      eyebrow:copy?.querySelector('.eyebrow')?.textContent.trim()||'',
      heading:copy?.querySelector('h1, h2')?.textContent.trim()||'',
      introduction:copy?.querySelector('p:not(.eyebrow)')?.textContent.trim()||'',
      hero_image:heroImage,
      hero_alt:image?.alt||''
    });
  }catch(error){pageDrafts.set(path,{path,eyebrow:'',heading:'',introduction:'',hero_image:'',hero_alt:''});toast(error.message,true);}
  finally{pagesLoading.delete(path);if(currentPanel==='pages'&&selectedPage===path)renderPages();}
}
function renderPages(){
  const page=pageRecord(selectedPage); const root=$('#panel-root');
  if(!page){root.innerHTML='<section class="preview-card"><div class="empty-state">Loading the complete website page...</div></section>';importOriginalPage(selectedPage);return;}
  root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>Page settings</h2></div><div class="card-body">
    <div class="field"><label>Website page</label><select id="page-select">${optionsHtml()}</select></div>
    <div class="editor-explainer"><b>Highlighted area</b><span>These controls edit the highlighted top section in the full-page preview.</span></div>
    <div class="field"><label>Small heading <span class="field-location">Top label</span></label><input data-page-field="eyebrow" value="${escapeHtml(page.eyebrow)}" placeholder="Optional label above the heading"></div>
    <div class="field"><label>Main heading <span class="field-location">Large title</span></label><input data-page-field="heading" value="${escapeHtml(page.heading)}" placeholder="Main page heading"></div>
    <div class="field"><label>Introduction <span class="field-location">Text below title</span></label><textarea data-page-field="introduction" placeholder="Short introduction">${escapeHtml(page.introduction)}</textarea></div>
    <div class="field"><label>Hero picture <span class="field-location">Large top picture</span></label><div class="image-picker"><img id="hero-thumb" src="${escapeHtml(imageSrc(page.hero_image))}" alt=""><div><label class="upload-button">Choose picture<input id="hero-upload" type="file" accept="image/jpeg,image/png,image/webp"></label><small>The page automatically crops the picture.</small></div></div></div>
    <div class="field"><label>Picture description</label><input data-page-field="hero_alt" value="${escapeHtml(page.hero_alt)}" placeholder="Describe the picture for screen readers"><small>Example: Child riding a brown pony with an instructor.</small></div>
  </div></section><section class="preview-card full-page-preview"><div class="card-head"><div><h2>Complete page preview</h2><small>Scroll here to see every existing text and picture</small></div><span>Highlighted = editable here</span></div><iframe id="page-preview-frame" src="${escapeHtml(publicPath(selectedPage))}" title="Full preview of ${escapeHtml(pageName(selectedPage))}"></iframe></section></div>`;
  $('#page-select').value=selectedPage; $('#page-select').addEventListener('change',event=>{selectedPage=event.target.value;$('#live-page-link').href=publicPath(selectedPage);renderPages();});
  const ensureManaged=()=>{if(!content.pages.includes(page))content.pages.push(page);};
  $$('[data-page-field]',root).forEach(input=>input.addEventListener('input',()=>{ensureManaged();page[input.dataset.pageField]=input.value;markDirty();updatePagePreview(); }));
  $('#hero-upload').addEventListener('change',event=>handleImage(event.target.files[0],path=>{ensureManaged();page.hero_image=path;renderPages();}));
  $('#page-preview-frame').addEventListener('load',updatePagePreview); updatePagePreview();
}
function updatePagePreview(){
  const page=pageRecord(selectedPage); const frame=$('#page-preview-frame'); const doc=frame?.contentDocument;
  if(!page||!doc)return;
  const hero=doc.querySelector('.page-hero, .ai-chat-intro, .home-banner');
  const copy=hero?.querySelector('.page-hero-copy, .ai-chat-intro > div, .home-banner-content');
  const eyebrow=copy?.querySelector('.eyebrow'); const heading=copy?.querySelector('h1, h2'); const introduction=copy?.querySelector('p:not(.eyebrow)');
  const image=hero?.querySelector(':scope > img, .home-banner-video-poster');
  if(eyebrow)eyebrow.textContent=page.eyebrow;if(heading)heading.textContent=page.heading;if(introduction)introduction.textContent=page.introduction;
  if(image&&page.hero_image){image.src=imageSrc(page.hero_image);image.alt=page.hero_alt||'';}
  if(hero){hero.classList.add('gallop-editor-highlight');const style=doc.createElement('style');style.textContent='.gallop-editor-highlight{outline:6px solid #f0b323!important;outline-offset:-6px!important;position:relative}.gallop-editor-highlight:after{content:"EDITABLE TOP SECTION";position:absolute;z-index:9999;top:12px;right:12px;background:#f0b323;color:#173b34;padding:8px 11px;border-radius:6px;font:700 12px Arial,sans-serif;letter-spacing:.06em}';doc.head.appendChild(style);}
}

function galleryRecord(path){ const item=content.galleries.find(g=>g.path===path&&Number(g.gallery_number)===1); if(item){item.images ||= [];return item;} return galleryDrafts.get(path) || null;}
async function importOriginalGallery(path){
  if(galleriesLoading.has(path))return;
  galleriesLoading.add(path);
  try{
    const pageUrl=new URL(publicPath(path),location.href);
    const response=await fetch(`${pageUrl.href}?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error('Could not load the original gallery.');
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    const firstGallery=doc.querySelector('.scroll-gallery');
    const images=[...(firstGallery?.querySelectorAll('.scroll-gallery-track > .scroll-gallery-group:first-child img')||[])];
    const gallery={path,gallery_number:1,images:images.map(img=>{
      const resolved=new URL(img.getAttribute('src'),pageUrl);
      const marker='/Gallop.sg/';
      const imagePath=resolved.pathname.includes(marker)?resolved.pathname.split(marker)[1]:resolved.pathname.replace(/^\//,'');
      return {image:imagePath,alt:img.alt||'Gallop SG gallery picture'};
    })};
    galleryDrafts.set(path,gallery);
  }catch(error){galleryDrafts.set(path,{path,gallery_number:1,images:[]});toast(error.message,true);}
  finally{galleriesLoading.delete(path);if(currentPanel==='galleries'&&selectedGalleryPath===path)renderGalleries();}
}
function renderGalleries(){ const gallery=galleryRecord(selectedGalleryPath); const root=$('#panel-root'); if(!gallery){root.innerHTML='<section class="preview-card"><div class="empty-state">Loading the existing website gallery...</div></section>';importOriginalGallery(selectedGalleryPath);return;} root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>Gallery settings</h2></div><div class="card-body"><div class="field"><label>Website page</label><select id="gallery-page">${optionsHtml(path=>GALLERY_PAGES.has(path))}</select><small>Pictures below appear on this page.</small></div><div class="field"><label>Gallery number</label><input value="1" disabled><small>Use the first gallery on the page.</small></div><label class="upload-tile">+ Add pictures<input id="gallery-upload" type="file" multiple accept="image/jpeg,image/png,image/webp"></label></div></section><section class="preview-card"><div class="card-head"><h2>Drag pictures to rearrange</h2><span>${gallery.images.length} pictures</span></div><div class="card-body"><div class="gallery-grid" id="gallery-grid">${gallery.images.map((item,index)=>`<article class="gallery-item" draggable="true" data-index="${index}"><img src="${escapeHtml(imageSrc(item.image))}" alt="${escapeHtml(item.alt)}"><span class="order">${index+1}</span><button class="remove-button" data-remove="${index}" type="button" aria-label="Remove picture">X</button><div class="gallery-meta">${escapeHtml(item.alt||'No description yet')}</div></article>`).join('')}<label class="upload-tile">+ Add pictures<input class="gallery-upload-more" type="file" multiple accept="image/jpeg,image/png,image/webp"></label></div>${gallery.images.length?'<p class="field"><small>The existing website pictures are included. Add or rearrange them, then publish the complete gallery.</small></p>':'<div class="empty-state">This page does not have an existing gallery.</div>'}</div></section></div>`;
  $('#gallery-page').value=selectedGalleryPath; $('#gallery-page').addEventListener('change',event=>{selectedGalleryPath=event.target.value;$('#live-page-link').href=publicPath(selectedGalleryPath);renderGalleries();});
  const ensureManaged=()=>{if(!content.galleries.includes(gallery))content.galleries.push(gallery);};
  const upload=async files=>{ensureManaged();for(const file of files){await handleImage(file,path=>gallery.images.push({image:path,alt:file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ')}),false);}markDirty();renderGalleries();};
  $('#gallery-upload').addEventListener('change',event=>upload(event.target.files)); $('.gallery-upload-more').addEventListener('change',event=>upload(event.target.files));
  $$('[data-remove]',root).forEach(button=>button.addEventListener('click',()=>{if(confirm('Remove this picture from the gallery?')){ensureManaged();gallery.images.splice(Number(button.dataset.remove),1);markDirty();renderGalleries();}}));
  $$('.gallery-item',root).forEach(item=>{item.addEventListener('dragstart',()=>{dragContext=Number(item.dataset.index);item.classList.add('dragging');});item.addEventListener('dragend',()=>item.classList.remove('dragging'));item.addEventListener('dragover',event=>event.preventDefault());item.addEventListener('drop',event=>{event.preventDefault();const target=Number(item.dataset.index);if(dragContext===null||dragContext===target)return;ensureManaged();const [moved]=gallery.images.splice(dragContext,1);gallery.images.splice(target,0,moved);dragContext=null;markDirty();renderGalleries();});});
}
async function handleImage(file,apply,rerender=true){ if(!file)return; if(file.size>5*1024*1024){toast('Please choose a picture smaller than 5 MB.',true);return;} const path=makeImageName(file); const dataUrl=await fileToDataUrl(file); pendingUploads.set(path,{base64:dataUrl.split(',')[1],dataUrl}); apply(path); markDirty(); if(rerender)render(); }
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}

function renderAbout(){ const a=content.about; const root=$('#panel-root'); root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>About Us text</h2></div><div class="card-body"><div class="field"><label>Heading</label><input data-bind="about.heading" value="${escapeHtml(a.heading)}"></div><div class="field"><label>Introduction</label><textarea data-bind="about.introduction">${escapeHtml(a.introduction)}</textarea></div><div class="field"><label>Story heading</label><input data-bind="about.story_heading" value="${escapeHtml(a.story_heading)}"></div><div class="field"><label>Story paragraphs</label><div class="repeat-list">${a.story_paragraphs.map((text,i)=>`<div class="repeat-item"><div class="item-bar"><span class="drag-handle">=</span><b>Paragraph ${i+1}</b><button class="remove-button" data-remove-paragraph="${i}" type="button">X</button></div><textarea data-paragraph="${i}">${escapeHtml(text)}</textarea></div>`).join('')}<button class="add-button" id="add-paragraph" type="button">+ Add paragraph</button></div></div></div></section><section class="preview-card"><div class="card-head"><h2>Preview</h2></div><div class="simple-preview" id="about-preview"></div></section></div>`; attachInputs(root); $$('[data-paragraph]',root).forEach(input=>input.addEventListener('input',()=>{a.story_paragraphs[Number(input.dataset.paragraph)]=input.value;markDirty();updateAboutPreview();})); $$('[data-remove-paragraph]',root).forEach(button=>button.addEventListener('click',()=>{a.story_paragraphs.splice(Number(button.dataset.removeParagraph),1);markDirty();renderAbout();})); $('#add-paragraph').addEventListener('click',()=>{a.story_paragraphs.push('');markDirty();renderAbout();}); updateAboutPreview(); }
function updateAboutPreview(){ const a=content.about;if(!$('#about-preview'))return;$('#about-preview').innerHTML=`<h2>${escapeHtml(a.heading)}</h2><p>${escapeHtml(a.introduction)}</p><h3>${escapeHtml(a.story_heading)}</h3>${a.story_paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}`; }

function renderFaqs(){ const root=$('#panel-root'); root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>Questions and answers</h2></div><div class="card-body repeat-list">${content.faqs.map((item,i)=>`<div class="repeat-item"><div class="item-bar"><span class="drag-handle">=</span><b>Question ${i+1}</b><button class="remove-button" data-faq-remove="${i}" type="button">X</button></div><div class="field"><label>Question</label><input data-faq="${i}" data-key="question" value="${escapeHtml(item.question)}"></div><div class="field"><label>Answer</label><textarea data-faq="${i}" data-key="answer">${escapeHtml(item.answer)}</textarea></div></div>`).join('')}<button class="add-button" id="add-faq" type="button">+ Add question</button></div></section><section class="preview-card"><div class="card-head"><h2>FAQ preview</h2></div><div class="simple-preview faq-preview">${content.faqs.map(item=>`<details><summary>${escapeHtml(item.question||'New question')}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</div></section></div>`; $$('[data-faq]',root).forEach(input=>input.addEventListener('input',()=>{content.faqs[Number(input.dataset.faq)][input.dataset.key]=input.value;markDirty();})); $$('[data-faq-remove]',root).forEach(button=>button.addEventListener('click',()=>{content.faqs.splice(Number(button.dataset.faqRemove),1);markDirty();renderFaqs();})); $('#add-faq').addEventListener('click',()=>{content.faqs.push({question:'',answer:''});markDirty();renderFaqs();}); }

function renderContact(){ const c=content.contact; $('#panel-root').innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>General contact</h2></div><div class="card-body"><div class="field"><label>General email</label><input type="email" data-bind="contact.email" value="${escapeHtml(c.email)}"></div><div class="field"><label>WhatsApp number</label><input data-bind="contact.whatsapp" value="${escapeHtml(c.whatsapp)}"><small>Use digits only, including country code.</small></div></div></section><section class="preview-card"><div class="card-head"><h2>Contact preview</h2></div><div class="simple-preview" id="contact-preview"></div></section></div>`; attachInputs(); updateContactPreview(); }
function updateContactPreview(){if(!$('#contact-preview'))return;$('#contact-preview').innerHTML=`<h2>Get in touch</h2><p><b>Email</b><br>${escapeHtml(content.contact.email)}</p><p><b>WhatsApp</b><br>+${escapeHtml(content.contact.whatsapp)}</p>`;}

function renderLocations(){ const root=$('#panel-root'); root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>Stable locations</h2></div><div class="card-body repeat-list">${content.locations.map((loc,i)=>`<div class="repeat-item"><div class="item-bar"><b>${escapeHtml(loc.name||`Location ${i+1}`)}</b></div>${[['name','Name'],['address','Address'],['parking','Parking'],['phone','Phone'],['days','Days'],['morning_hours','Morning hours'],['afternoon_hours','Afternoon hours'],['additional_hours','Additional hours'],['map_url','Map URL'],['email','Email'],['instagram','Instagram']].map(([key,label])=>`<div class="field"><label>${label}</label><input data-location="${i}" data-key="${key}" value="${escapeHtml(loc[key])}"></div>`).join('')}</div>`).join('')}</div></section><section class="preview-card"><div class="card-head"><h2>Location preview</h2></div><div class="simple-preview location-preview">${content.locations.map(loc=>`<article><h3>${escapeHtml(loc.name)}</h3><p>${escapeHtml(loc.address)}<br>${escapeHtml(loc.days)}: ${escapeHtml(loc.morning_hours)} / ${escapeHtml(loc.afternoon_hours)}<br>${escapeHtml(loc.phone)}</p></article>`).join('')}</div></section></div>`; $$('[data-location]',root).forEach(input=>input.addEventListener('input',()=>{content.locations[Number(input.dataset.location)][input.dataset.key]=input.value;markDirty();})); }

function renderPrices(){ const root=$('#panel-root'); root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>Lesson price rows</h2></div><div class="card-body repeat-list">${content.lesson_prices.map((row,i)=>`<div class="repeat-item"><div class="item-bar"><b>${escapeHtml(row.name)}</b></div><div class="field"><label>Group</label><select data-price="${i}" data-key="group"><option value="beginner">Beginner</option><option value="progression">Progression</option><option value="junior">Junior</option></select></div><div class="field"><label>Lesson name</label><input data-price="${i}" data-key="name" value="${escapeHtml(row.name)}"></div><div class="field"><label>Details - one per line</label><textarea data-price="${i}" data-key="details">${escapeHtml((row.details||[]).join('\n'))}</textarea></div><div class="field"><label>Session columns - one per line</label><textarea data-price="${i}" data-key="sessions">${escapeHtml((row.sessions||[]).join('\n'))}</textarea></div><div class="field"><label>Weekday prices - one per line</label><textarea data-price="${i}" data-key="weekday">${escapeHtml((row.weekday||[]).join('\n'))}</textarea></div><div class="field"><label>Weekend prices - one per line</label><textarea data-price="${i}" data-key="weekend">${escapeHtml((row.weekend||[]).join('\n'))}</textarea></div></div>`).join('')}</div></section><section class="preview-card"><div class="card-head"><h2>Price preview</h2></div><div class="simple-preview price-preview"><table><thead><tr><th>Lesson</th><th>Weekday</th><th>Weekend</th></tr></thead><tbody>${content.lesson_prices.map(row=>`<tr><td><b>${escapeHtml(row.name)}</b><br>${escapeHtml(row.group)}</td><td>${escapeHtml((row.weekday||[]).join(' / '))}</td><td>${escapeHtml((row.weekend||[]).join(' / '))}</td></tr>`).join('')}</tbody></table></div></section></div>`; $$('[data-price]',root).forEach(input=>{if(input.tagName==='SELECT')input.value=content.lesson_prices[Number(input.dataset.price)].group;input.addEventListener('input',()=>{const row=content.lesson_prices[Number(input.dataset.price)];row[input.dataset.key]=['details','sessions','weekday','weekend'].includes(input.dataset.key)?input.value.split('\n').map(x=>x.trim()).filter(Boolean):input.value;markDirty();});}); }

async function publish(){
  const button=$('#confirm-publish'); button.disabled=true; button.textContent='Publishing...'; setState('publishing','Publishing website...');
  try{
    const uploads=[...pendingUploads].map(([path,file])=>({path,base64:file.base64}));
    await api('/api/admin/publish',{method:'POST',body:JSON.stringify({content,uploads,message:$('#publish-message').value.trim()})});
    originalContent=clone(content); pendingUploads.clear(); dirty=false; setState('saved','Published successfully'); $('#publish-dialog').close(); toast('Website published. It may take a few minutes to appear.');
  }catch(error){ setState('dirty','Publish failed - changes kept'); toast(error.message,true); }
  finally{button.disabled=false;button.textContent='Publish now';}
}

restoreSession();

const DEFAULT_API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000'
  : 'https://gallopsg-production.up.railway.app';
const API_BASE = String(window.GALLOP_ADMIN_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');
const CONTENT_URL = '../content/site.json';
const TOKEN_KEY = 'gallop_admin_session';

const PAGE_GROUPS = [
  ['Main website', [['index.html','Website Home (Gallop SG)']]],
  ['Gallop SG', [
    ['pages/gallopsg/gallop-ai.html','Gallop AI'], ['pages/gallopsg/promotion.html','Promotions'], ['pages/gallopsg/join.html','Join the Team'],
    ['pages/gallopsg/faq.html','FAQs'], ['pages/gallopsg/contact.html','Contact']
  ]],
  ['Gallop Stable', [
    ['pages/stable/stable.html','Home'], ['pages/stable/riding-lessons.html','Riding Lessons'],
    ['pages/stable/adopt-a-horse.html','Adopt a Horse'], ['pages/stable/adopt-horse-profile.html','Adopt Horse Profile'],
    ['pages/stable/lease-a-horse.html','Lease a Horse'], ['pages/stable/lease-horse-profile.html','Lease Horse Profile'],
    ['pages/stable/outdoor-pony-hire.html','Outdoor Pony Hire'], ['pages/stable/stable_promotion.html','Promotions'],
    ['pages/stable/stable_join.html','Join the Team'], ['pages/stable/stable_faq.html','FAQs'],
    ['pages/stable/stable_contact.html','Contact']
  ]],
  ['Gallop CARES', [
    ['pages/care/gallop-care.html','Home'], ['pages/care/care_activity.html','Activities'], ['pages/care/volunteer.html','Volunteer'],
    ['pages/care/care_promotion.html','Promotions'], ['pages/care/care_join.html','Join the Team'],
    ['pages/care/care_faq.html','FAQs'], ['pages/care/care_contact.html','Contact']
  ]],
  ['Gallop Jackuda', [
    ['pages/jackuda/jackuda.html','Home'], ['pages/jackuda/camps-workshops.html','Camps and Workshops'],
    ['pages/jackuda/birthday-party.html','Birthday Party'], ['pages/jackuda/coperate-event.html','Corporate and Group Events'],
    ['pages/jackuda/horseshoe-painting.html','Horseshoe Painting'], ['pages/jackuda/learning-journey.html','Learning Journey'],
    ['pages/jackuda/photoshoot.html','Photoshoot'], ['pages/jackuda/pony-rides-feeding.html','Pony Rides and Feeding'],
    ['pages/jackuda/trail-rides.html','Trail Rides'], ['pages/jackuda/volunteer.html','Volunteer'],
    ['pages/jackuda/jackuda_promotion.html','Promotions'], ['pages/jackuda/jackuda_join.html','Join the Team'],
    ['pages/jackuda/jackuda_faq.html','FAQs'], ['pages/jackuda/jackuda_contact.html','Contact']
  ]],
  ['Gallop Polo', venturePages('polo','polo','Polo')],
  ['Gallop Archery', venturePages('archery','archery','Archery')],
  ['Gallop Green', venturePages('green','green','Green')],
  ['Gallop Catering', venturePages('catering','catering','Catering')],
  ['Gallop Resort', venturePages('resort','resort','Resort')],
  ["D'Equestrian Paradise", venturePages('d-equestrian-paradise','d_equestrian_paradise',"D'Equestrian Paradise",'saddlery.html')]
];
function venturePages(folder,prefix,name,homeFile=`${prefix}.html`){return [
  [`pages/${folder}/${homeFile}`,'Home'], [`pages/${folder}/${prefix}_activity.html`,'Activities'],
  [`pages/${folder}/${prefix}_promotion.html`,'Promotions'], [`pages/${folder}/${prefix}_join.html`,'Join the Team'],
  [`pages/${folder}/${prefix}_faq.html`,'FAQs'], [`pages/${folder}/${prefix}_contact.html`,'Contact']
];}
const PAGE_OPTIONS = PAGE_GROUPS.flatMap(([,pages])=>pages);
const GALLERY_PAGES = new Set(['index.html','pages/stable/stable.html','pages/stable/riding-lessons.html','pages/stable/outdoor-pony-hire.html','pages/care/gallop-care.html','pages/jackuda/jackuda.html','pages/jackuda/birthday-party.html','pages/jackuda/horseshoe-painting.html','pages/jackuda/learning-journey.html','pages/jackuda/photoshoot.html','pages/jackuda/pony-rides-feeding.html']);
const PROMOTION_PAGES = new Set(PAGE_OPTIONS.map(([path])=>path).filter(path=>/promotion\.html$/.test(path)));
const PANEL_COPY = {
  pages:['Pages','Edit page text and hero picture','Choose a page, then update what visitors see at the top.'],
  galleries:['Pictures','Arrange picture galleries','Upload, describe and drag pictures into the order visitors will see.'],
  promotions:['Promotions','Add promotion pictures','Choose a promotions page, then upload and arrange its posters or banners.'],
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
let selectedPromotionPath = 'pages/gallopsg/promotion.html';
let pendingUploads = new Map();
let pageDrafts = new Map();
let pageBlockDrafts = new Map();
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
function optionsHtml(filter=()=>true,labelFor=(path,label)=>label){ return PAGE_GROUPS.map(([group,pages])=>{const visible=pages.filter(([path])=>filter(path));return visible.length?`<optgroup label="${escapeHtml(group)}">${visible.map(([path,label])=>`<option value="${escapeHtml(path)}">${escapeHtml(labelFor(path,label))}</option>`).join('')}</optgroup>`:'';}).join(''); }
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
  content.pages ||= []; content.page_blocks ||= []; content.galleries ||= []; content.promotions ||= []; content.faqs ||= []; content.locations ||= []; content.lesson_prices ||= [];
  originalContent=clone(content); pendingUploads.clear(); pageDrafts.clear(); pageBlockDrafts.clear(); pagesLoading.clear(); galleryDrafts.clear(); galleriesLoading.clear(); dirty=false; setState('saved','All changes saved locally'); render();
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
$('#discard-button').addEventListener('click',()=>{ if(!dirty || confirm('Discard every unpublished change?')){ content=clone(originalContent); content.page_blocks ||= []; pendingUploads.clear(); pageDrafts.clear(); pageBlockDrafts.clear(); galleryDrafts.clear(); dirty=false; setState('saved','All changes saved locally'); render(); }});
$('#publish-button').addEventListener('click',()=>{ if(!dirty){toast('There are no new changes to publish.');return;} $('#publish-message').value=''; $('#publish-dialog').showModal(); });
$('#cancel-publish').addEventListener('click',()=>$('#publish-dialog').close());
$('#confirm-publish').addEventListener('click',publish);
window.addEventListener('beforeunload',event=>{ if(dirty){event.preventDefault();event.returnValue='';} });

function render(){
  if(!content)return; const [kicker,title,description]=PANEL_COPY[currentPanel];
  $('#panel-kicker').textContent=kicker; $('#panel-title').textContent=title; $('#panel-description').textContent=description;
  $('#live-page-link').hidden=!['pages','galleries','promotions'].includes(currentPanel);
  $('#live-page-link').href=publicPath(currentPanel==='pages'?selectedPage:currentPanel==='galleries'?selectedGalleryPath:selectedPromotionPath);
  ({pages:renderPages,galleries:renderGalleries,promotions:renderPromotions,about:renderAbout,faqs:renderFaqs,contact:renderContact,locations:renderLocations,prices:renderPrices}[currentPanel])();
}
function attachInputs(root=$('#panel-root')){ $$('[data-bind]',root).forEach(input=>input.addEventListener('input',()=>{ setPath(input.dataset.bind,input.value); markDirty(); renderPreviewOnly(); })); }
function setPath(path,value){ const keys=path.split('.'); let cursor=content; keys.slice(0,-1).forEach(key=>cursor=cursor[Number.isNaN(Number(key))?key:Number(key)]); cursor[keys.at(-1)]=value; }
function renderPreviewOnly(){ if(currentPanel==='pages') updatePagePreview(); if(currentPanel==='about') updateAboutPreview(); if(currentPanel==='contact') updateContactPreview(); }

function pageRecord(path){ return content.pages.find(page=>page.path===path) || pageDrafts.get(path) || null; }
function pageBlocksRecord(path){ return content.page_blocks.find(page=>page.path===path) || pageBlockDrafts.get(path) || null; }
function elementSelector(element){
  const parts=[]; let current=element;
  while(current && current.tagName && current.tagName.toLowerCase()!=='main'){
    const tag=current.tagName.toLowerCase();
    const siblings=current.parentElement?[...current.parentElement.children].filter(item=>item.tagName===current.tagName):[];
    parts.unshift(`${tag}:nth-of-type(${Math.max(siblings.indexOf(current)+1,1)})`); current=current.parentElement;
  }
  return current?.tagName?.toLowerCase()==='main'?`main > ${parts.join(' > ')}`:'';
}
function extractPageBlocks(doc,pageUrl,path){
  const saved=content.page_blocks.find(item=>item.path===path); const savedBySelector=new Map((saved?.blocks||[]).map(item=>[item.selector,item]));
  const hero=doc.querySelector('.page-hero, .ai-chat-intro, .home-banner'); let textNumber=0; let imageNumber=0;
  const candidates=[...doc.querySelectorAll('main h1, main h2, main h3, main h4, main p, main li, main figcaption, main img')];
  const blocks=candidates.filter(element=>{
    if(hero?.contains(element) || element.closest('[hidden], [aria-hidden="true"]'))return false;
    if(element.matches('h1,h2,h3,h4,p,li,figcaption') && (element.querySelector('a,button,input,select,textarea') || !element.textContent.trim()))return false;
    return true;
  }).map(element=>{
    const selector=elementSelector(element); if(!selector)return null;
    if(element.tagName==='IMG'){
      imageNumber+=1; const src=element.getAttribute('src')||''; const resolved=src?new URL(src,pageUrl):null;
      const marker='/Gallop.sg/'; const value=resolved?(resolved.pathname.includes(marker)?resolved.pathname.split(marker)[1]:resolved.pathname.replace(/^\//,'')):'';
      return {selector,type:'image',label:`Picture ${imageNumber}`,value,alt:element.alt||'',...(savedBySelector.get(selector)||{})};
    }
    textNumber+=1; const tag=element.tagName.toLowerCase(); const kind=/^h/.test(tag)?'Heading':tag==='li'?'List item':tag==='figcaption'?'Caption':'Paragraph';
    return {selector,type:'text',label:`${kind} ${textNumber}`,value:element.textContent.trim(),...(savedBySelector.get(selector)||{})};
  }).filter(Boolean);
  return {path,blocks};
}
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
    if(!content.pages.some(item=>item.path===path))pageDrafts.set(path,{
      path,
      eyebrow:copy?.querySelector('.eyebrow')?.textContent.trim()||'',
      heading:copy?.querySelector('h1, h2')?.textContent.trim()||'',
      introduction:copy?.querySelector('p:not(.eyebrow)')?.textContent.trim()||'',
      hero_image:heroImage,
      hero_alt:image?.alt||''
    });
    pageBlockDrafts.set(path,extractPageBlocks(doc,pageUrl,path));
  }catch(error){if(!pageRecord(path))pageDrafts.set(path,{path,eyebrow:'',heading:'',introduction:'',hero_image:'',hero_alt:''});pageBlockDrafts.set(path,{path,blocks:[]});toast(error.message,true);}
  finally{pagesLoading.delete(path);if(currentPanel==='pages'&&selectedPage===path)renderPages();}
}
function renderPages(){
  const page=pageRecord(selectedPage); const pageBlocks=pageBlocksRecord(selectedPage); const root=$('#panel-root');
  if(!page||!pageBlocks){root.innerHTML='<section class="preview-card"><div class="empty-state">Loading every editable word and picture...</div></section>';importOriginalPage(selectedPage);return;}
  const blocksHtml=pageBlocks.blocks.map((block,index)=>block.type==='image'?`<div class="content-block"><div class="content-block-meta"><b>${escapeHtml(block.label)}</b><span>Picture</span></div><div class="image-picker compact"><img src="${escapeHtml(imageSrc(block.value))}" alt=""><div><label class="upload-button">Choose picture<input data-block-image="${index}" type="file" accept="image/jpeg,image/png,image/webp"></label><input data-block-alt="${index}" value="${escapeHtml(block.alt)}" placeholder="Picture description"></div></div></div>`:`<div class="content-block"><div class="content-block-meta"><b>${escapeHtml(block.label)}</b><span>Text shown on page</span></div><textarea data-block-text="${index}" data-preview-selector="${escapeHtml(block.selector)}">${escapeHtml(block.value)}</textarea><small>Delete all the words above to remove this text.</small></div>`).join('');
  root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>Page settings</h2></div><div class="card-body">
    <div class="field"><label>Website page</label><select id="page-select">${optionsHtml()}</select></div>
    <div class="editor-explainer"><b>Highlighted area</b><span>These controls edit the highlighted top section in the full-page preview.</span></div>
    <div class="field"><label>Small heading <span class="field-location">Top label</span></label><input data-page-field="eyebrow" data-preview-selector="__hero__" value="${escapeHtml(page.eyebrow)}" placeholder="Optional label above the heading"></div>
    <div class="field"><label>Main heading <span class="field-location">Large title</span></label><input data-page-field="heading" data-preview-selector="__hero__" value="${escapeHtml(page.heading)}" placeholder="Main page heading"></div>
    <div class="field"><label>Introduction <span class="field-location">Text below title</span></label><textarea data-page-field="introduction" data-preview-selector="__hero__" placeholder="Short introduction">${escapeHtml(page.introduction)}</textarea></div>
    <div class="field"><label>Hero picture <span class="field-location">Large top picture</span></label><div class="image-picker"><img id="hero-thumb" src="${escapeHtml(imageSrc(page.hero_image))}" alt=""><div><label class="upload-button">Choose picture<input id="hero-upload" type="file" accept="image/jpeg,image/png,image/webp"></label><small>The page automatically crops the picture.</small></div></div></div>
    <div class="field"><label>Picture description</label><input data-page-field="hero_alt" value="${escapeHtml(page.hero_alt)}" placeholder="Describe the picture for screen readers"><small>Example: Child riding a brown pony with an instructor.</small></div>
    <div class="page-content-heading"><h3>All other page content</h3><p>Every editable word and picture from the preview appears below.</p></div><div class="content-block-list">${blocksHtml||'<p class="empty-state">No additional page content was found.</p>'}</div>
  </div></section><section class="preview-card full-page-preview"><div class="card-head"><div><h2>Complete page preview</h2><small>Scroll here to see every existing text and picture</small></div><span>Highlighted = editable here</span></div><iframe id="page-preview-frame" src="${escapeHtml(publicPath(selectedPage))}" title="Full preview of ${escapeHtml(pageName(selectedPage))}"></iframe></section></div>`;
  $('#page-select').value=selectedPage; $('#page-select').addEventListener('change',event=>{selectedPage=event.target.value;$('#live-page-link').href=publicPath(selectedPage);renderPages();});
  const ensureManaged=()=>{if(!content.pages.includes(page))content.pages.push(page);};
  const ensureBlocksManaged=()=>{if(!content.page_blocks.includes(pageBlocks))content.page_blocks.push(pageBlocks);};
  $$('[data-page-field]',root).forEach(input=>input.addEventListener('input',()=>{ensureManaged();page[input.dataset.pageField]=input.value;markDirty();updatePagePreview(); }));
  $$('[data-preview-selector]',root).forEach(input=>input.addEventListener('focus',()=>highlightPagePreview(input.dataset.previewSelector)));
  $$('[data-block-text]',root).forEach(input=>input.addEventListener('input',()=>{ensureBlocksManaged();pageBlocks.blocks[Number(input.dataset.blockText)].value=input.value;markDirty();updatePagePreview();}));
  $$('[data-block-alt]',root).forEach(input=>input.addEventListener('input',()=>{ensureBlocksManaged();pageBlocks.blocks[Number(input.dataset.blockAlt)].alt=input.value;markDirty();updatePagePreview();}));
  $$('[data-block-image]',root).forEach(input=>input.addEventListener('change',event=>{const index=Number(input.dataset.blockImage);handleImage(event.target.files[0],path=>{ensureBlocksManaged();pageBlocks.blocks[index].value=path;renderPages();});}));
  $('#hero-upload').addEventListener('change',event=>handleImage(event.target.files[0],path=>{ensureManaged();page.hero_image=path;renderPages();}));
  $('#page-preview-frame').addEventListener('load',updatePagePreview); updatePagePreview();
}
function updatePagePreview(){
  const page=pageRecord(selectedPage); const pageBlocks=pageBlocksRecord(selectedPage); const frame=$('#page-preview-frame'); const doc=frame?.contentDocument;
  if(!page||!doc)return;
  const hero=doc.querySelector('.page-hero, .ai-chat-intro, .home-banner');
  const copy=hero?.querySelector('.page-hero-copy, .ai-chat-intro > div, .home-banner-content');
  const eyebrow=copy?.querySelector('.eyebrow'); const heading=copy?.querySelector('h1, h2'); const introduction=copy?.querySelector('p:not(.eyebrow)');
  const image=hero?.querySelector(':scope > img, .home-banner-video-poster');
  if(eyebrow)eyebrow.textContent=page.eyebrow;if(heading)heading.textContent=page.heading;if(introduction)introduction.textContent=page.introduction;
  if(image&&page.hero_image){image.src=imageSrc(page.hero_image);image.alt=page.hero_alt||'';}
  pageBlocks?.blocks.forEach(block=>{let element;try{element=doc.querySelector(block.selector);}catch{return;}if(!element)return;if(block.type==='image'){if(block.value)element.src=imageSrc(block.value);element.alt=block.alt||'';}else element.textContent=block.value??'';});
  if(!doc.querySelector('#gallop-editor-style')){const style=doc.createElement('style');style.id='gallop-editor-style';style.textContent='.gallop-editor-highlight{outline:6px solid #f0b323!important;outline-offset:-6px!important;position:relative}';doc.head.appendChild(style);}
}
function highlightPagePreview(selector){const doc=$('#page-preview-frame')?.contentDocument;if(!doc)return;doc.querySelectorAll('.gallop-editor-highlight').forEach(item=>item.classList.remove('gallop-editor-highlight'));let element;if(selector==='__hero__')element=doc.querySelector('.page-hero, .ai-chat-intro, .home-banner');else try{element=doc.querySelector(selector);}catch{}if(element){element.classList.add('gallop-editor-highlight');element.scrollIntoView({behavior:'smooth',block:'center'});}}

function galleryRecord(path){ const item=content.galleries.find(g=>g.path===path&&Number(g.gallery_number)===1); if(item){item.images ||= [];return item;} return galleryDrafts.get(path) || null;}
async function importOriginalGallery(path){
  if(galleriesLoading.has(path))return;
  galleriesLoading.add(path);
  try{
    const pageUrl=new URL(publicPath(path),location.href);
    const response=await fetch(`${pageUrl.href}?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error('Could not load the original gallery.');
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    const firstGallery=path==='index.html'?doc.querySelector('.opening-gallery-slider'):doc.querySelector('.scroll-gallery');
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
function renderGalleries(){ const gallery=galleryRecord(selectedGalleryPath); const root=$('#panel-root'); if(!gallery){root.innerHTML='<section class="preview-card"><div class="empty-state">Loading the existing website gallery...</div></section>';importOriginalGallery(selectedGalleryPath);return;} root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>Gallery settings</h2></div><div class="card-body"><div class="field"><label>Website gallery</label><select id="gallery-page">${optionsHtml(path=>GALLERY_PAGES.has(path),(path,label)=>path==='index.html'?'Opening Ceremony Gallery':label)}</select><small>Pictures below appear in this gallery.</small></div><div class="field"><label>Gallery number</label><input value="1" disabled><small>${selectedGalleryPath==='index.html'?'This is the Opening Ceremony Gallery on the main website home.':'Use the first gallery on this page.'}</small></div><label class="upload-tile">+ Add pictures<input id="gallery-upload" type="file" multiple accept="image/jpeg,image/png,image/webp"></label></div></section><section class="preview-card"><div class="card-head"><h2>Drag pictures to rearrange</h2><span>${gallery.images.length} pictures</span></div><div class="card-body"><div class="gallery-grid" id="gallery-grid">${gallery.images.map((item,index)=>`<article class="gallery-item" draggable="true" data-index="${index}"><img src="${escapeHtml(imageSrc(item.image))}" alt="${escapeHtml(item.alt)}"><span class="order">${index+1}</span><button class="remove-button" data-remove="${index}" type="button" aria-label="Remove picture">X</button><div class="gallery-meta">${escapeHtml(item.alt||'No description yet')}</div></article>`).join('')}<label class="upload-tile">+ Add pictures<input class="gallery-upload-more" type="file" multiple accept="image/jpeg,image/png,image/webp"></label></div>${gallery.images.length?'<p class="field"><small>The existing website pictures are included. Add or rearrange them, then publish the complete gallery.</small></p>':'<div class="empty-state">This page does not have an existing gallery.</div>'}</div></section></div>`;
  $('#gallery-page').value=selectedGalleryPath; $('#gallery-page').addEventListener('change',event=>{selectedGalleryPath=event.target.value;$('#live-page-link').href=publicPath(selectedGalleryPath);renderGalleries();});
  const ensureManaged=()=>{if(!content.galleries.includes(gallery))content.galleries.push(gallery);};
  const upload=async files=>{ensureManaged();for(const file of files){await handleImage(file,path=>gallery.images.push({image:path,alt:file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ')}),false);}markDirty();renderGalleries();};
  $('#gallery-upload').addEventListener('change',event=>upload(event.target.files)); $('.gallery-upload-more').addEventListener('change',event=>upload(event.target.files));
  $$('[data-remove]',root).forEach(button=>button.addEventListener('click',()=>{if(confirm('Remove this picture from the gallery?')){ensureManaged();gallery.images.splice(Number(button.dataset.remove),1);markDirty();renderGalleries();}}));
  $$('.gallery-item',root).forEach(item=>{item.addEventListener('dragstart',()=>{dragContext=Number(item.dataset.index);item.classList.add('dragging');});item.addEventListener('dragend',()=>item.classList.remove('dragging'));item.addEventListener('dragover',event=>event.preventDefault());item.addEventListener('drop',event=>{event.preventDefault();const target=Number(item.dataset.index);if(dragContext===null||dragContext===target)return;ensureManaged();const [moved]=gallery.images.splice(dragContext,1);gallery.images.splice(target,0,moved);dragContext=null;markDirty();renderGalleries();});});
}
async function handleImage(file,apply,rerender=true){ if(!file)return; if(file.size>5*1024*1024){toast('Please choose a picture smaller than 5 MB.',true);return;} const path=makeImageName(file); const dataUrl=await fileToDataUrl(file); pendingUploads.set(path,{base64:dataUrl.split(',')[1],dataUrl}); apply(path); markDirty(); if(rerender)render(); }
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}

function promotionRecord(path){let promotion=content.promotions.find(item=>item.path===path);if(!promotion){promotion={path,images:[]};content.promotions.push(promotion);}promotion.images ||= [];return promotion;}

function renderPromotions(){
  const promotion=promotionRecord(selectedPromotionPath); const root=$('#panel-root');
  root.innerHTML=`<div class="editor-grid"><section class="editor-card"><div class="card-head"><h2>Promotion page</h2></div><div class="card-body"><div class="field"><label>Website section</label><select id="promotion-page">${optionsHtml(path=>PROMOTION_PAGES.has(path))}</select><small>Pictures will appear on this section's Promotions page.</small></div><label class="upload-tile">+ Add promotion pictures<input id="promotion-upload" type="file" multiple accept="image/jpeg,image/png,image/webp"></label></div></section><section class="preview-card"><div class="card-head"><h2>Drag pictures to rearrange</h2><span>${promotion.images.length} pictures</span></div><div class="card-body"><div class="gallery-grid" id="promotion-grid">${promotion.images.map((item,index)=>`<article class="gallery-item" draggable="true" data-promotion-index="${index}"><img src="${escapeHtml(imageSrc(item.image))}" alt="${escapeHtml(item.alt)}"><span class="order">${index+1}</span><button class="remove-button" data-promotion-remove="${index}" type="button" aria-label="Remove promotion picture">X</button><div class="gallery-meta"><input data-promotion-alt="${index}" value="${escapeHtml(item.alt)}" placeholder="Short picture description"><select data-promotion-format="${index}" aria-label="Picture format"><option value="portrait">Poster</option><option value="landscape">Wide banner</option></select></div></article>`).join('')}<label class="upload-tile">+ Add pictures<input class="promotion-upload-more" type="file" multiple accept="image/jpeg,image/png,image/webp"></label></div>${promotion.images.length?'':'<div class="empty-state">No promotion pictures yet. Add the first one above.</div>'}</div></section></div>`;
  $('#promotion-page').value=selectedPromotionPath;
  $('#promotion-page').addEventListener('change',event=>{selectedPromotionPath=event.target.value;render();});
  $$('[data-promotion-format]',root).forEach(select=>{select.value=promotion.images[Number(select.dataset.promotionFormat)].format||'portrait';select.addEventListener('change',()=>{promotion.images[Number(select.dataset.promotionFormat)].format=select.value;markDirty();});});
  const upload=async files=>{for(const file of files){await handleImage(file,path=>promotion.images.push({image:path,alt:file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),format:'portrait'}),false);}markDirty();renderPromotions();};
  $('#promotion-upload').addEventListener('change',event=>upload([...event.target.files]));
  $('.promotion-upload-more')?.addEventListener('change',event=>upload([...event.target.files]));
  $$('[data-promotion-alt]',root).forEach(input=>input.addEventListener('input',()=>{promotion.images[Number(input.dataset.promotionAlt)].alt=input.value;markDirty();}));
  $$('[data-promotion-remove]',root).forEach(button=>button.addEventListener('click',()=>{if(confirm('Remove this promotion picture?')){promotion.images.splice(Number(button.dataset.promotionRemove),1);markDirty();renderPromotions();}}));
  $$('[data-promotion-index]',root).forEach(item=>{item.addEventListener('dragstart',()=>{dragContext=Number(item.dataset.promotionIndex);item.classList.add('dragging');});item.addEventListener('dragend',()=>item.classList.remove('dragging'));item.addEventListener('dragover',event=>event.preventDefault());item.addEventListener('drop',event=>{event.preventDefault();const target=Number(item.dataset.promotionIndex);if(dragContext===null||dragContext===target)return;const [moved]=promotion.images.splice(dragContext,1);promotion.images.splice(target,0,moved);dragContext=null;markDirty();renderPromotions();});});
}

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

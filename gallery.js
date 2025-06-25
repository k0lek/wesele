const CLOUD_NAME = 'dvg3dotyn';
const TAG = 'fotografia_misja';
const API_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

let images = [];
let currentModalIdx = 0;

function getHiddenList() {
  return JSON.parse(localStorage.getItem('hiddenInSlideshow') || '[]');
}
function setHiddenList(list) {
  localStorage.setItem('hiddenInSlideshow', JSON.stringify(list));
}

async function fetchImages() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Brak zdjęć lub błąd API');
    const data = await res.json();
    images = data.resources.sort((a, b) => b.created_at.localeCompare(a.created_at));
    renderGallery();
  } catch (e) {
    document.getElementById('gallery').innerHTML = '<p class="col-span-4 text-center text-white">Brak zdjęć lub błąd połączenia.</p>';
  }
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  if (images.length === 0) {
    gallery.innerHTML = '<p class="col-span-4 text-center text-white">Brak zdjęć.</p>';
    return;
  }
  const hidden = getHiddenList();
  gallery.innerHTML = images.map((img, idx) => {
    const url = `https://res.cloudinary.com/dvg3dotyn/image/upload/${img.public_id}.${img.format}`;
    const context = img.context && img.context.custom ? img.context.custom : {};
    const caption = context.caption || '';
    const author = context.author || '';
    const isHidden = hidden.includes(img.public_id);
    const btnClass = isHidden
      ? 'absolute top-2 right-2 bg-red-600 bg-opacity-70 text-white text-xs px-2 py-1 rounded hover:bg-red-800 z-10'
      : 'absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded hover:bg-opacity-90 z-10';
    return `
      <div class="cursor-pointer group relative" onclick="showModal(${idx})">
        <img src="${url}" alt="${caption}" class="rounded shadow w-full aspect-video object-cover group-hover:opacity-80 transition">
        <div class="mt-2 text-xs text-center text-white font-semibold">${caption}${author ? ' – ' + author : ''}</div>
        <button onclick="toggleSlideshow(event, '${img.public_id}')" class="${btnClass}">
          ${isHidden ? 'Pokaż w slideshow' : 'Ukryj w slideshow'}
        </button>
      </div>
    `;
  }).join('');
}

window.showModal = function(idx) {
  currentModalIdx = idx;
  showModalImage(idx);
  document.getElementById('modal').classList.remove('hidden');
}

function showModalImage(idx) {
  const img = images[idx];
  const url = `https://res.cloudinary.com/dvg3dotyn/image/upload/${img.public_id}.${img.format}`;
  const context = img.context && img.context.custom ? img.context.custom : {};
  const caption = context.caption || '';
  const author = context.author || '';
  document.getElementById('modalImg').src = url;
  document.getElementById('modalImg').alt = caption;
  document.getElementById('modalCaption').textContent = `${caption}${author ? ' – ' + author : ''}`;
}

window.toggleSlideshow = function(e, public_id) {
  e.stopPropagation();
  let hidden = getHiddenList();
  if (hidden.includes(public_id)) {
    hidden = hidden.filter(id => id !== public_id);
  } else {
    hidden.push(public_id);
  }
  setHiddenList(hidden);
  renderGallery();
}

document.getElementById('closeModal').onclick = function() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modalImg').src = '';
};

document.getElementById('modal').onclick = function(e) {
  if (e.target === this) {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modalImg').src = '';
  }
};

// Lightbox: nawigacja strzałkami
function prevModal() {
  if (images.length === 0) return;
  currentModalIdx = (currentModalIdx - 1 + images.length) % images.length;
  showModalImage(currentModalIdx);
}
function nextModal() {
  if (images.length === 0) return;
  currentModalIdx = (currentModalIdx + 1) % images.length;
  showModalImage(currentModalIdx);
}

// Dodaj przyciski do modala
const modal = document.getElementById('modal');
const leftBtn = document.createElement('button');
leftBtn.innerHTML = '&#8592;';
leftBtn.className = 'absolute left-2 top-1/2 -translate-y-1/2 text-3xl text-gray-700 hover:text-white px-2 py-1 bg-black bg-opacity-30 rounded-full z-10';
leftBtn.onclick = function(e) { e.stopPropagation(); prevModal(); };
const rightBtn = document.createElement('button');
rightBtn.innerHTML = '&#8594;';
rightBtn.className = 'absolute right-2 top-1/2 -translate-y-1/2 text-3xl text-gray-700 hover:text-white px-2 py-1 bg-black bg-opacity-30 rounded-full z-10';
rightBtn.onclick = function(e) { e.stopPropagation(); nextModal(); };
window.addEventListener('DOMContentLoaded', () => {
  const modalImgParent = document.getElementById('modalImg').parentNode;
  modalImgParent.appendChild(leftBtn);
  modalImgParent.appendChild(rightBtn);

  // Obsługa przycisku resetu slideshow
  const resetBtn = document.getElementById('resetSlideshowBtn');
  if (resetBtn) {
    resetBtn.onclick = function(e) {
      e.stopPropagation();
      localStorage.removeItem('hiddenInSlideshow');
      renderGallery();
      alert('Wszystkie zdjęcia będą znowu widoczne w slideshow!');
      location.reload();
    };
  }
});

// Obsługa klawiatury
window.addEventListener('keydown', function(e) {
  if (document.getElementById('modal').classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') prevModal();
  if (e.key === 'ArrowRight') nextModal();
  if (e.key === 'Escape') {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modalImg').src = '';
  }
});

// Odświeżanie galerii co 10 sekund
env = typeof window !== 'undefined' ? window : global;
if (env) setInterval(fetchImages, 10000);

fetchImages();

document.getElementById('fullscreenBtn').onclick = function() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { // Firefox
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge
    elem.msRequestFullscreen();
  }
}; 
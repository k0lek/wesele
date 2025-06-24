const CLOUD_NAME = 'dvg3dotyn';
const TAG = 'fotografia_misja';
const API_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

let images = [];

async function fetchImages() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Brak zdjęć lub błąd API');
    const data = await res.json();
    images = data.resources.sort((a, b) => b.created_at.localeCompare(a.created_at));
    renderGallery();
  } catch (e) {
    document.getElementById('gallery').innerHTML = '<p class="col-span-4 text-center">Brak zdjęć lub błąd połączenia.</p>';
  }
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  if (images.length === 0) {
    gallery.innerHTML = '<p class="col-span-4 text-center">Brak zdjęć.</p>';
    return;
  }
  gallery.innerHTML = images.map((img, idx) => {
    const url = `https://res.cloudinary.com/dvg3dotyn/image/upload/${img.public_id}.${img.format}`;
    const context = img.context && img.context.custom ? img.context.custom : {};
    const caption = context.caption || '';
    const author = context.author || '';
    return `
      <div class="cursor-pointer group" onclick="showModal(${idx})">
        <img src="${url}" alt="${caption}" class="rounded shadow w-full aspect-video object-cover group-hover:opacity-80 transition">
        <div class="mt-2 text-xs text-center text-gray-700">${caption}${author ? ' – ' + author : ''}</div>
      </div>
    `;
  }).join('');
}

window.showModal = function(idx) {
  const img = images[idx];
  const url = `https://res.cloudinary.com/dvg3dotyn/image/upload/${img.public_id}.${img.format}`;
  const context = img.context && img.context.custom ? img.context.custom : {};
  const caption = context.caption || '';
  const author = context.author || '';
  document.getElementById('modalImg').src = url;
  document.getElementById('modalImg').alt = caption;
  document.getElementById('modalCaption').textContent = `${caption}${author ? ' – ' + author : ''}`;
  document.getElementById('modal').classList.remove('hidden');
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

// Odświeżanie galerii co 10 sekund
env = typeof window !== 'undefined' ? window : global;
if (env) setInterval(fetchImages, 10000);

fetchImages(); 
const CLOUD_NAME = 'dvg3dotyn';
const TAG = 'fotografia_misja';
const API_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

let images = [];
let current = 0;

async function fetchImages() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Brak zdjęć lub błąd API');
    const data = await res.json();
    images = data.resources.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (images.length === 0) {
      document.getElementById('slide').innerHTML = '<p>Brak zdjęć.</p>';
      document.getElementById('caption').textContent = '';
    } else {
      showSlide(0);
    }
  } catch (e) {
    document.getElementById('slide').innerHTML = '<p>Brak zdjęć lub błąd połączenia.</p>';
    document.getElementById('caption').textContent = '';
  }
}

function showSlide(idx) {
  if (images.length === 0) return;
  current = idx % images.length;
  const img = images[current];
  const url = `https://res.cloudinary.com/dvg3dotyn/image/upload/${img.public_id}.${img.format}`;
  const context = img.context && img.context.custom ? img.context.custom : {};
  const caption = context.caption || '';
  const author = context.author || '';
  document.getElementById('slide').innerHTML = `<img src="${url}" alt="${caption}">`;
  document.getElementById('caption').textContent = `${caption}${author ? ' – ' + author : ''}`;
}

function nextSlide() {
  if (images.length === 0) return;
  showSlide((current + 1) % images.length);
}

// Automatyczne przewijanie slajdów
setInterval(nextSlide, 5000); // co 5 sekund
// Automatyczne odświeżanie zdjęć
setInterval(fetchImages, 10000); // co 10 sekund

// Inicjalizacja
fetchImages(); 
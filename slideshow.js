const CLOUD_NAME = 'dvg3dotyn';
const TAG = 'fotografia_misja';
const API_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

let images = [];
let current = 0;

function getHiddenList() {
  return JSON.parse(localStorage.getItem('hiddenInSlideshow') || '[]');
}

async function fetchImages() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Brak zdjęć lub błąd API');
    const data = await res.json();
    const hidden = getHiddenList();
    images = data.resources
      .filter(img => !hidden.includes(img.public_id))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (images.length === 0) {
      document.getElementById('slide').innerHTML = '<p class="text-white opacity-50">Brak zdjęć.</p>';
      document.getElementById('caption').textContent = '';
    } else {
      showSlide(0);
    }
  } catch (e) {
    document.getElementById('slide').innerHTML = '<p class="text-white opacity-50">Brak zdjęć lub błąd połączenia.</p>';
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
  // Obraz dopasowany do ekranu, z zachowaniem proporcji, bez ramek
  document.getElementById('slide').innerHTML = `<img src="${url}" alt="${caption}" class="max-h-full max-w-full object-contain w-auto h-auto" style="background:transparent;">`;
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

// Obsługa pełnego ekranu
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('fullscreenBtn');
  if (btn) {
    btn.onclick = function() {
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
  }
}); 
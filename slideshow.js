const CLOUD_NAME = 'dvg3dotyn';
const TAG = 'fotografia_misja';
const API_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

let images = [];
let current = 0;

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
    const hidden = getHiddenList();
    const allPublicIds = data.resources.map(img => img.public_id);
    const validHidden = hidden.filter(id => allPublicIds.includes(id));
    setHiddenList(validHidden);
    images = data.resources
      .filter(img => !validHidden.includes(img.public_id))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    console.log('Liczba zdjęć po fetchu:', images.length, images.map(img => img.public_id));
    if (current >= images.length) current = 0;
    if (images.length === 0) {
      document.getElementById('slide').innerHTML = '<p class="text-white opacity-50">Brak zdjęć.</p>';
      document.getElementById('caption').textContent = '';
    } else {
      showSlide(current);
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
  const slideDiv = document.getElementById('slide');
  slideDiv.innerHTML = `<img id="slideImg" src="${url}" alt="${caption}" class="max-h-full max-w-full object-contain w-auto h-auto" style="background:transparent;">`;
  document.getElementById('caption').textContent = `${caption}${author ? ' – ' + author : ''}`;
  console.log('Pokazuję slajd', current, '/', images.length, 'public_id:', img.public_id);
  document.getElementById('slideImg').onerror = function() {
    console.warn('Nie można załadować zdjęcia:', url);
    nextSlide();
  };
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
console.log('Slideshow JS działa!');
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
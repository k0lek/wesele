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

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

function fade(element, from, to, duration, onDone) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = from + (to - from) * progress;
    element.style.opacity = String(value);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else if (onDone) {
      onDone();
    }
  }
  requestAnimationFrame(step);
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

  let slideImg = document.getElementById('slideImg');
  const firstRender = !slideImg;

  if (firstRender) {
    // Pierwsze renderowanie – wstaw obraz bez animacji
    slideDiv.innerHTML = `<img id="slideImg" src="${url}" alt="${caption}" class="max-h-full max-w-full object-contain w-auto h-auto" style="background:transparent; opacity:1;">`;
    document.getElementById('caption').textContent = `${caption}${author ? ' – ' + author : ''}`;
    slideImg = document.getElementById('slideImg');
    slideImg.onerror = function() {
      console.warn('Nie można załadować zdjęcia:', url);
      nextSlide();
    };
    return;
  }

  // Preload nowego obrazu, potem płynny fade-out -> podmiana src -> fade-in
  preloadImage(url)
    .then(() => {
      fade(slideImg, 1, 0, 600, () => {
        slideImg.src = url;
        slideImg.alt = caption;
        document.getElementById('caption').textContent = `${caption}${author ? ' – ' + author : ''}`;
        fade(slideImg, 0, 1, 600);
      });
    })
    .catch(() => {
      console.warn('Nie można załadować zdjęcia:', url);
      nextSlide();
    });

  console.log('Pokazuję slajd', current, '/', images.length, 'public_id:', img.public_id);
}

function nextSlide() {
  if (images.length === 0) return;
  showSlide((current + 1) % images.length);
}

// Automatyczne przewijanie slajdów
setInterval(nextSlide, 10000); // co 10 sekund
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
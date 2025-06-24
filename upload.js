document.getElementById('uploadForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const status = document.getElementById('status');
  status.textContent = 'Przesyłanie...';

  const topic = document.getElementById('topic').value;
  const name = document.getElementById('name').value;
  const fileInput = document.getElementById('file');
  const file = fileInput.files[0];

  if (!file) {
    status.textContent = 'Wybierz plik.';
    return;
  }

  // Przygotuj dane do uploadu na Cloudinary
  const url = 'https://api.cloudinary.com/v1_1/dvg3dotyn/image/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'wesele');
  formData.append('context', `caption=${topic}|author=${name}`);
  formData.append('tags', 'fotografia_misja');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    console.log('Cloudinary response:', data);
    if (data.secure_url) {
      status.textContent = 'Zdjęcie przesłane! Dziękujemy!';
      document.getElementById('uploadForm').reset();
    } else if (data.error && data.error.message) {
      status.textContent = 'Błąd: ' + data.error.message;
    } else {
      status.textContent = 'Błąd podczas przesyłania.';
    }
  } catch (err) {
    status.textContent = 'Błąd sieci lub serwera.';
    console.error('Upload error:', err);
  }
}); 
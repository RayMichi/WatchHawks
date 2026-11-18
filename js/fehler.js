// Zeigt Fehler sichtbar im Spiel an, statt nur ein schwarzes Bild
window.addEventListener('error', e => {
  const f = document.getElementById('fehler');
  f.style.display = 'block';
  f.textContent = 'Fehler: ' + e.message;
});

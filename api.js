const API_URL = 'https://ваш-сервер.ком/api';

async function loadAdsFromServer() {
  const response = await fetch(`${API_URL}/ads`);
  return await response.json();
}

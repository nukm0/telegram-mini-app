// API для работы с сервером
const API_URL = 'https://ваш-сервер.ком/api';

// Загрузка объявлений с сервера
async function loadAdsFromServer() {
    try {
        const response = await fetch(`${API_URL}/ads`);
        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Ошибка загрузки с сервера:', error);
    }
    return [];
}

// Отправка данных на сервер
async function sendToServer(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка отправки на сервер:', error);
        return null;
    }
}

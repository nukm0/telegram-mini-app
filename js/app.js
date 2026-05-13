// Глобальные переменные
window.ads = [];
window.currentCategory = 'all';
window.user = {};
window.userRating = { likes: 0, dislikes: 0 };
window.viewHistory = [];
window.userAds = [];
window.complaints = [];
window.bannerText = 'Добро пожаловать в Vape Market!';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Приложение запущено');
    
    // Получаем данные пользователя из Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.expand();
        window.user = webApp.initDataUnsafe?.user || {
            id: Date.now(),
            first_name: 'Гость',
            username: 'guest'
        };
    } else {
        window.user = {
            id: Date.now(),
            first_name: 'Гость',
            username: 'guest'
        };
    }
    
    // Загружаем данные
    await loadAllData();
    
    // Инициализируем UI
    initUI();
    
    // Проверяем админа
    checkAdmin();
    
    // Загружаем объявления
    await loadAds();
    
    // Показываем уведомление
    showNotification(`Добро пожаловать, ${window.user.first_name}!`, 'success');
});

// Загрузка всех данных
async function loadAllData() {
    await loadUserRating();
    await loadViewHistory();
    await loadUserAds();
    await loadComplaints();
    await loadBanner();
}

// Загрузка рейтинга пользователя
async function loadUserRating() {
    // Здесь должна быть логика загрузки из БД
    window.userRating = { likes: 0, dislikes: 0 };
}

// Загрузка истории просмотров
async function loadViewHistory() {
    const saved = localStorage.getItem(`viewHistory_${window.user.id}`);
    if (saved) {
        window.viewHistory = JSON.parse(saved);
    } else {
        window.viewHistory = [];
    }
}

// Загрузка объявлений пользователя
async function loadUserAds() {
    const saved = localStorage.getItem(`userAds_${window.user.id}`);
    if (saved) {
        window.userAds = JSON.parse(saved);
    } else {
        window.userAds = [];
    }
}

// Загрузка жалоб
async function loadComplaints() {
    const saved = localStorage.getItem('complaints');
    if (saved) {
        window.complaints = JSON.parse(saved);
    } else {
        window.complaints = [];
    }
}

// Загрузка баннера
async function loadBanner() {
    const saved = localStorage.getItem('bannerText');
    if (saved) {
        window.bannerText = saved;
    }
}

// Проверка админа
function checkAdmin() {
    const adminIds = [123456789, 987654321]; // ID админов
    if (adminIds.includes(window.user.id)) {
        document.querySelector('.admin-only').style.display = 'flex';
        document.querySelector('.admin-badge').classList.add('show');
    }
}

// Инициализация UI
function initUI() {
    // Навигация
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            switchPage(page);
        });
    });
    
    // FAQ аккордеон
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (answer.style.display === 'none') {
                answer.style.display = 'block';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                answer.style.display = 'none';
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });
}

// Переключение страниц
function switchPage(page) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Показываем нужную
    document.getElementById(`${page}Page`).classList.add('active');
    
    // Обновляем активный пункт меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Загружаем данные для страницы
    if (page === 'home') {
        renderAds();
    } else if (page === 'profile') {
        renderProfile();
    } else if (page === 'admin') {
        renderAdminPanel();
    }
}

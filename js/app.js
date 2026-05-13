// Глобальные переменные
window.ads = [];
window.currentCategory = 'all';
window.user = {};
window.userRating = { likes: 0, dislikes: 0 };
window.viewHistory = [];
window.userAds = [];
window.complaints = [];
window.bannerText = 'Добро пожаловать в Vape Market!';
window.selectedPhotos = []; // Добавлено для хранения фото

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Приложение запущено');
    
    // Получаем данные пользователя из Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.expand();
        window.user = webApp.initDataUnsafe?.user || {
            id: 998579758,  // Ваш ID по умолчанию
            first_name: '𓆩nukm0𓆪',
            username: 'nukm0',
            language_code: 'ru'
        };
    } else {
        // Данные для тестирования вне Telegram
        window.user = {
            id: 998579758,
            first_name: '𓆩nukm0𓆪',
            username: 'nukm0',
            language_code: 'ru'
        };
    }
    
    console.log('👤 Пользователь:', window.user);
    
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
    const saved = localStorage.getItem(`userRating_${window.user.id}`);
    if (saved) {
        window.userRating = JSON.parse(saved);
    } else {
        window.userRating = { likes: 0, dislikes: 0 };
    }
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

// Проверка админа - ВАШ ID ДОБАВЛЕН!
function checkAdmin() {
    // Список ID администраторов
    const adminIds = [998579758, 123456789, 987654321];
    
    const isAdmin = adminIds.includes(Number(window.user.id));
    
    console.log('🔐 Проверка админа:', {
        userId: window.user.id,
        isAdmin: isAdmin,
        adminList: adminIds
    });
    
    if (isAdmin) {
        const adminNav = document.querySelector('.admin-only');
        const adminBadge = document.querySelector('.admin-badge');
        
        if (adminNav) adminNav.style.display = 'flex';
        if (adminBadge) adminBadge.classList.add('show');
        
        console.log('✅ Админ-панель активирована для пользователя:', window.user.first_name);
        showNotification('Вы вошли как администратор!', 'success');
    } else {
        console.log('👤 Обычный пользователь');
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
    const pageId = `${page}Page`;
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
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
        if (typeof renderAdminPanel === 'function') {
            renderAdminPanel();
        }
    }
}

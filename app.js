// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand(); // Развернуть приложение на весь экран

// Данные пользователя
let user = {
    id: tg.initDataUnsafe.user?.id || null,
    username: tg.initDataUnsafe.user?.username || 'Пользователь',
    isAdmin: false // По умолчанию не админ
};

// Хранилище объявлений (в реальном проекте это будет база данных)
let ads = [
    {
        id: 1,
        userId: 123,
        username: "vape_seller",
        category: "liquids",
        title: "Жидкость Berry Mix 50мг",
        description: "Вкусная ягодная смесь, крепость 50мг",
        price: 1500,
        image: "https://via.placeholder.com/300x200/667eea/fff?text=VAPE+Liquid",
        date: "2024-01-15"
    },
    {
        id: 2,
        userId: 456,
        username: "vape_shop",
        category: "disposables",
        title: "HQD Crystal Bar",
        description: "Одноразовая электронная сигарета, 4000 тяг",
        price: 2500,
        image: "https://via.placeholder.com/300x200/764ba2/fff?text=Disposable",
        date: "2024-01-14"
    }
];

// Проверка на администратора (в реальном проекте проверка с сервера)
function checkAdmin() {
    // Здесь должна быть проверка с сервера
    user.isAdmin = user.id === 123456; // Пример: если ID пользователя 123456, то он админ
}

// Загрузка при запуске
document.addEventListener('DOMContentLoaded', function() {
    // Отображаем имя пользователя
    document.getElementById('userName').textContent = user.username;
    
    // Проверяем админские права
    checkAdmin();
    
    // Показываем объявления
    loadAds();
    
    // Если пользователь админ, показываем админ-панель
    if (user.isAdmin) {
        showAdminPanel();
    }
});

// Загрузка объявлений
function loadAds() {
    const adsContainer = document.getElementById('adsContainer');
    adsContainer.innerHTML = '';
    
    ads.forEach(ad => {
        const adElement = document.createElement('div');
        adElement.className = 'ad-card';
        adElement.innerHTML = `
            <img src="${ad.image}" alt="${ad.title}" class="ad-image">
            <div class="ad-title">${ad.title}</div>
            <div class="ad-description">${ad.description}</div>
            <div class="ad-price">${ad.price} руб.</div>
            <div class="ad-seller">Продавец: @${ad.username}</div>
            <button onclick="contactSeller(${ad.userId}, '${ad.username}')" class="submit-btn" style="margin-top: 10px;">
                💬 Написать продавцу
            </button>
            ${ad.userId === user.id ? `
                <button onclick="deleteAd(${ad.id})" style="background: #dc3545; margin-top: 5px;" class="submit-btn">
                    ❌ Удалить
                </button>
            ` : ''}
        `;
        adsContainer.appendChild(adElement);
    });
}

// Показать категорию
function showCategory(category) {
    const categoryNames = {
        liquids: 'Жидкости',
        consumables: 'Расходники',
        disposables: 'Одноразовые устройства',
        'pod-systems': 'Под-системы',
        others: 'Другие товары'
    };
    
    openModal(`
        <h2>Категория: ${categoryNames[category]}</h2>
        <p>Товары в этой категории будут отображаться здесь.</p>
        <button onclick="openAddForm('${category}')" class="submit-btn">
            + Добавить в эту категорию
        </button>
    `);
}

// Открыть форму добавления
function openAddForm(category = '') {
    openModal(`
        <h2>Добавить объявление</h2>
        <form id="addForm">
            <div class="form-group">
                <label>Категория:</label>
                <select id="category" required>
                    <option value="">Выберите категорию</option>
                    <option value="liquids" ${category === 'liquids' ? 'selected' : ''}>Жидкости</option>
                    <option value="consumables" ${category === 'consumables' ? 'selected' : ''}>Расходники</option>
                    <option value="disposables" ${category === 'disposables' ? 'selected' : ''}>Одноразовые</option>
                    <option value="pod-systems" ${category === 'pod-systems' ? 'selected' : ''}>Под-системы</option>
                    <option value="others" ${category === 'others' ? 'selected' : ''}>Другое</option>
                </select>
            </div>
            <div class="form-group">
                <label>Название товара:</label>
                <input type="text" id="title" required placeholder="Например: Жидкость Berry Mix">
            </div>
            <div class="form-group">
                <label>Описание:</label>
                <textarea id="description" required placeholder="Опишите товар подробно..."></textarea>
            </div>
            <div class="form-group">
                <label>Цена (руб.):</label>
                <input type="number" id="price" required placeholder="1500">
            </div>
            <div class="form-group">
                <label>Ссылка на фото:</label>
                <input type="url" id="image" placeholder="https://example.com/photo.jpg">
            </div>
            <button type="submit" class="submit-btn">📤 Опубликовать</button>
        </form>
    `);
    
    // Обработка формы
    document.getElementById('addForm').onsubmit = function(e) {
        e.preventDefault();
        addNewAd();
    };
}

// Добавить новое объявление
function addNewAd() {
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = parseInt(document.getElementById('price').value);
    const image = document.getElementById('image').value || `https://via.placeholder.com/300x200/667eea/fff?text=${encodeURIComponent(title)}`;
    
    const newAd = {
        id: Date.now(),
        userId: user.id,
        username: user.username,
        category: category,
        title: title,
        description: description,
        price: price,
        image: image,
        date: new Date().toISOString().split('T')[0]
    };
    
    ads.unshift(newAd); // Добавляем в начало
    loadAds(); // Обновляем список
    closeModal();
    
    // В реальном проекте здесь отправка на сервер
    alert('Объявление успешно добавлено!');
}

// Удалить объявление
function deleteAd(adId) {
    if (confirm('Удалить это объявление?')) {
        ads = ads.filter(ad => ad.id !== adId);
        loadAds();
    }
}

// Связаться с продавцом
function contactSeller(sellerId, sellerUsername) {
    // В реальном Telegram Mini App можно использовать:
    // tg.openTelegramLink(`tg://user?id=${sellerId}`);
    // Но пока просто покажем сообщение
    
    openModal(`
        <h2>Связаться с продавцом</h2>
        <p>Чтобы написать продавцу <strong>@${sellerUsername}</strong>, нажмите кнопку ниже:</p>
        <button onclick="sendTelegramMessage(${sellerId})" class="submit-btn">
            💬 Написать в Telegram
        </button>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
            В реальном приложении вы будете перенаправлены в чат Telegram
        </p>
    `);
}

// Имитация отправки сообщения в Telegram
function sendTelegramMessage(userId) {
    // В реальном приложении:
    // tg.openTelegramLink(`tg://user?id=${userId}`);
    
    alert(`Открывается чат с пользователем ID: ${userId}\n\nВ реальном приложении вы перейдёте в Telegram`);
    closeModal();
}

// Открыть профиль
function openProfile() {
    openModal(`
        <h2>👤 Мой профиль</h2>
        <div style="margin: 20px 0;">
            <p><strong>Имя:</strong> ${user.username}</p>
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Статус:</strong> ${user.isAdmin ? '👑 Администратор' : 'Пользователь'}</p>
        </div>
        <h3>Мои объявления: ${ads.filter(ad => ad.userId === user.id).length}</h3>
        <button onclick="showMyAds()" class="submit-btn">📋 Посмотреть мои объявления</button>
        ${user.isAdmin ? `
            <button onclick="showAdminPanel()" class="submit-btn" style="background: #dc3545; margin-top: 10px;">
                👑 Админ панель
            </button>
        ` : ''}
    `);
}

// Показать мои объявления
function showMyAds() {
    const myAds = ads.filter(ad => ad.userId === user.id);
    
    if (myAds.length === 0) {
        openModal(`
            <h2>📋 Мои объявления</h2>
            <p>У вас пока нет объявлений.</p>
            <button onclick="openAddForm()" class="submit-btn">+ Добавить первое объявление</button>
        `);
        return;
    }
    
    let adsHTML = '<h2>📋 Мои объявления</h2><div style="max-height: 400px; overflow-y: auto;">';
    
    myAds.forEach(ad => {
        adsHTML += `
            <div class="ad-card" style="margin-bottom: 15px;">
                <div class="ad-title">${ad.title}</div>
                <div>Цена: ${ad.price} руб.</div>
                <div>Категория: ${ad.category}</div>
                <div>Дата: ${ad.date}</div>
                <button onclick="deleteAd(${ad.id})" class="submit-btn" style="background: #dc3545; margin-top: 10px;">
                    ❌ Удалить
                </button>
            </div>
        `;
    });
    
    adsHTML += '</div><button onclick="openAddForm()" class="submit-btn" style="margin-top: 20px;">+ Добавить новое</button>';
    
    openModal(adsHTML);
}

// Показать админ-панель
function showAdminPanel() {
    openModal(`
        <h2>👑 Админ панель</h2>
        
        <div class="admin-controls">
            <h3>Управление пользователями</h3>
            <div style="margin: 15px 0;">
                <input type="number" id="banUserId" placeholder="ID пользователя" style="padding: 10px; width: 70%;">
                <button onclick="banUser()" class="admin-btn">🚫 Забанить</button>
            </div>
            
            <h3>Управление объявлениями</h3>
            <div style="margin: 15px 0;">
                <input type="number" id="deleteAdId" placeholder="ID объявления" style="padding: 10px; width: 70%;">
                <button onclick="adminDeleteAd()" class="admin-btn">🗑️ Удалить</button>
            </div>
            
            <h3>Статистика</h3>
            <p>Всего объявлений: ${ads.length}</p>
            <p>Всего пользователей: ${new Set(ads.map(ad => ad.userId)).size}</p>
        </div>
        
        <h3>Последние объявления</h3>
        <div style="max-height: 300px; overflow-y: auto;">
            ${ads.map(ad => `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                    <strong>${ad.title}</strong><br>
                    ID: ${ad.id} | User: @${ad.username}
                    <button onclick="adminDeleteAd(${ad.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-left: 10px;">
                        Удалить
                    </button>
                </div>
            `).join('')}
        </div>
    `);
}

// Функции администратора
function banUser() {
    const userId = document.getElementById('banUserId').value;
    if (userId && confirm(`Забанить пользователя ID: ${userId}?`)) {
        alert(`Пользователь ${userId} забанен (в реальном приложении будет запрос на сервер)`);
    }
}

function adminDeleteAd(adId = null) {
    if (!adId) {
        adId = document.getElementById('deleteAdId').value;
    }
    
    if (adId && confirm(`Удалить объявление ID: ${adId}?`)) {
        ads = ads.filter(ad => ad.id !== parseInt(adId));
        loadAds();
        closeModal();
        showAdminPanel();
    }
}

// Управление модальными окнами
function openModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Закрыть модальное окно при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
};

// Навигация
function showHome() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function showChats() {
    openModal(`
        <h2>💬 Сообщения</h2>
        <p>Здесь будут ваши переписки с покупателями/продавцами.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <strong>В разработке:</strong>
            <p>• Личные сообщения</p>
            <p>• Уведомления о новых сообщениях</p>
            <p>• История переписок</p>
        </div>
    `);
}

// Инициализация основной кнопки Telegram
tg.MainButton.text = "Открыть в Telegram";
tg.MainButton.show();

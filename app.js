 // Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Данные пользователя
let user = {
    id: tg.initDataUnsafe.user?.id || Math.floor(Math.random() * 10000),
    username: tg.initDataUnsafe.user?.username || 'User' + Math.floor(Math.random() * 1000),
    isAdmin: false
};

// Хранилище для фото (максимум 3)
let selectedPhotos = [];

// Хранилище объявлений
let ads = [
    {
        id: 1,
        userId: 123,
        username: "vape_seller",
        category: "liquids",
        title: "Жидкость Berry Mix 50мг",
        description: "Вкусная ягодная смесь, крепость 50мг",
        price: 1500,
        photos: ["https://via.placeholder.com/400x300/667eea/fff?text=VAPE"],
        date: "2024-01-15"
    }
];

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// Загрузка при запуске
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('userName').textContent = user.username || 'Пользователь';
    checkAdmin();
    loadAds();
});

// Загрузить объявления
function loadAds() {
    const adsContainer = document.getElementById('adsContainer');
    adsContainer.innerHTML = '';
    
    ads.forEach(ad => {
        const adElement = document.createElement('div');
        adElement.className = 'ad-card';
        
        let photosHTML = '';
        if (ad.photos && ad.photos.length > 0) {
            photosHTML = `
                <div style="position: relative; margin-bottom: 10px;">
                    <img src="${ad.photos[0]}" class="ad-image">
                    ${ad.photos.length > 1 ? `
                        <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 20px;">
                            +${ad.photos.length - 1} фото
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        adElement.innerHTML = `
            ${photosHTML}
            <div class="ad-title">${ad.title}</div>
            <div class="ad-description">${ad.description}</div>
            <div class="ad-price">${ad.price} руб.</div>
            <div class="ad-seller">Продавец: @${ad.username}</div>
            <button onclick="contactSeller(${ad.userId}, '${ad.username}')" class="submit-btn">
                💬 Написать
            </button>
            ${ad.userId === user.id ? `
                <button onclick="deleteAd(${ad.id})" class="submit-btn" style="background: #dc3545; margin-top: 5px;">
                    ❌ Удалить
                </button>
            ` : ''}
        `;
        adsContainer.appendChild(adElement);
    });
}

// Открыть форму добавления с загрузкой фото
function openAddForm(category = '') {
    selectedPhotos = [];
    
    openModal(`
        <h2>📤 Добавить объявление</h2>
        <form id="addForm">
            <div class="form-group">
                <label>Категория:</label>
                <select id="category" required>
                    <option value="">Выберите</option>
                    <option value="liquids" ${category === 'liquids' ? 'selected' : ''}>Жидкости</option>
                    <option value="consumables" ${category === 'consumables' ? 'selected' : ''}>Расходники</option>
                    <option value="disposables" ${category === 'disposables' ? 'selected' : ''}>Одноразовые</option>
                    <option value="pod-systems" ${category === 'pod-systems' ? 'selected' : ''}>Под-системы</option>
                    <option value="others" ${category === 'others' ? 'selected' : ''}>Другое</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Название:</label>
                <input type="text" id="title" required placeholder="Название товара">
            </div>
            
            <div class="form-group">
                <label>Описание:</label>
                <textarea id="description" required placeholder="Описание товара" rows="3"></textarea>
            </div>
            
            <div class="form-group">
                <label>Цена (руб.):</label>
                <input type="number" id="price" required placeholder="1000">
            </div>
            
            <!-- Блок загрузки фото -->
            <div class="form-group">
                <label>Фотографии (макс. 3):</label>
                <div style="margin: 10px 0;">
                    <div id="photoPreview" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; min-height: 100px;"></div>
                    <button type="button" onclick="addPhoto()" style="background: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">
                        📸 Добавить фото
                    </button>
                    <div id="photoCounter" style="margin-top: 5px; color: #666; font-size: 14px;">
                        0/3 фото
                    </div>
                </div>
            </div>
            
            <button type="submit" class="submit-btn">Опубликовать</button>
        </form>
    `);
    
    updatePhotoPreview();
    
    document.getElementById('addForm').onsubmit = function(e) {
        e.preventDefault();
        addNewAd();
    };
}

// Добавить фото (имитация загрузки)
function addPhoto() {
    if (selectedPhotos.length >= 3) {
        alert('Максимум 3 фото!');
        return;
    }
    
    // В реальном Telegram: tg.showPhotoPicker()
    // Для теста - имитация
    const newPhoto = {
        id: Date.now(),
        url: `https://via.placeholder.com/200x150/667eea/fff?text=Фото+${selectedPhotos.length + 1}`,
        name: `photo_${selectedPhotos.length + 1}.jpg`
    };
    
    selectedPhotos.push(newPhoto);
    updatePhotoPreview();
}

// Обновить превью фото
function updatePhotoPreview() {
    const preview = document.getElementById('photoPreview');
    const counter = document.getElementById('photoCounter');
    
    if (!preview || !counter) return;
    
    preview.innerHTML = '';
    
    selectedPhotos.forEach((photo, index) => {
        const photoDiv = document.createElement('div');
        photoDiv.style.position = 'relative';
        photoDiv.style.width = '80px';
        photoDiv.style.height = '80px';
        photoDiv.style.borderRadius = '8px';
        photoDiv.style.overflow = 'hidden';
        photoDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        
        photoDiv.innerHTML = `
            <img src="${photo.url}" style="width: 100%; height: 100%; object-fit: cover;">
            <button onclick="removePhoto(${index})" style="position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;">×</button>
        `;
        
        preview.appendChild(photoDiv);
    });
    
    counter.textContent = `${selectedPhotos.length}/3 фото`;
}

// Удалить фото
function removePhoto(index) {
    selectedPhotos.splice(index, 1);
    updatePhotoPreview();
}

// Добавить новое объявление
function addNewAd() {
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    
    if (!category || !title || !description || !price) {
        alert('Заполните все поля!');
        return;
    }
    
    const newAd = {
        id: Date.now(),
        userId: user.id,
        username: user.username,
        category: category,
        title: title,
        description: description,
        price: parseInt(price),
        photos: selectedPhotos.length > 0 
            ? selectedPhotos.map(p => p.url) 
            : ['https://via.placeholder.com/400x300/ccc/fff?text=Нет+фото'],
        date: new Date().toLocaleDateString()
    };
    
    ads.unshift(newAd);
    closeModal();
    loadAds();
    alert('Объявление добавлено!');
}

// Удалить объявление
function deleteAd(adId) {
    if (confirm('Удалить объявление?')) {
        ads = ads.filter(ad => ad.id !== adId);
        loadAds();
    }
}

// Связаться с продавцом
function contactSeller(sellerId, sellerUsername) {
    openModal(`
        <h2>💬 Написать продавцу</h2>
        <p>Продавец: @${sellerUsername}</p>
        <p>Нажмите кнопку ниже, чтобы написать в Telegram:</p>
        <button onclick="sendTelegramMessage(${sellerId}, '${sellerUsername}')" class="submit-btn">
            💬 Открыть Telegram
        </button>
    `);
}

// Отправить сообщение
function sendTelegramMessage(userId, username) {
    // В реальном приложении:
    // tg.openTelegramLink(`tg://user?id=${userId}`);
    
    // Для теста:
    alert(`Сообщение для @${username} (ID: ${userId})\n\nВ реальном приложении откроется Telegram`);
    closeModal();
}

// Открыть профиль
function openProfile() {
    openModal(`
        <h2>👤 Профиль</h2>
        <p>Имя: ${user.username}</p>
        <p>ID: ${user.id}</p>
        <p>Объявлений: ${ads.filter(ad => ad.userId === user.id).length}</p>
        <button onclick="showMyAds()" class="submit-btn">📋 Мои объявления</button>
    `);
}

// Показать мои объявления
function showMyAds() {
    const myAds = ads.filter(ad => ad.userId === user.id);
    
    if (myAds.length === 0) {
        openModal('<h2>📋 Мои объявления</h2><p>Нет объявлений</p>');
        return;
    }
    
    let html = '<h2>📋 Мои объявления</h2>';
    myAds.forEach(ad => {
        html += `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 8px;">
                <strong>${ad.title}</strong><br>
                Цена: ${ad.price} руб.<br>
                <button onclick="deleteAd(${ad.id})" style="background: red; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-top: 5px;">Удалить</button>
            </div>
        `;
    });
    
    openModal(html);
}

// Показать категорию
function showCategory(category) {
    const names = {
        liquids: 'Жидкости',
        consumables: 'Расходники',
        disposables: 'Одноразовые',
        'pod-systems': 'Под-системы',
        others: 'Другое'
    };
    
    openModal(`
        <h2>${names[category]}</h2>
        <p>Категория: ${names[category]}</p>
        <button onclick="openAddForm('${category}')" class="submit-btn">+ Добавить</button>
    `);
}

// Навигация
function showHome() {
    window.scrollTo(0, 0);
}

function showChats() {
    openModal('<h2>💬 Сообщения</h2><p>В разработке...</p>');
}

// Проверка админа
function checkAdmin() {
    user.isAdmin = user.id === 123456;
}

// Показать админ-панель
function showAdminPanel() {
    if (!user.isAdmin) return;
    
    openModal(`
        <h2>👑 Админ-панель</h2>
        <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <p>Всего объявлений: ${ads.length}</p>
            <p>Всего пользователей: ${new Set(ads.map(ad => ad.userId)).size}</p>
            <button onclick="adminDeleteAd()" class="admin-btn">🗑️ Удалить объявление</button>
            <button onclick="adminBanUser()" class="admin-btn">🚫 Забанить</button>
        </div>
    `);
}

// ========== УТИЛИТЫ ==========

// Открыть модальное окно
function openModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

// Закрыть модальное окно
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Закрыть по клику вне окна
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
};

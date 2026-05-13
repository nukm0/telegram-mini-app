// Загрузка объявлений
async function loadAds() {
    // Загружаем из Firebase или localStorage
    const saved = localStorage.getItem('ads');
    if (saved) {
        window.ads = JSON.parse(saved);
    } else {
        // Демо данные
        window.ads = [
            {
                id: 1,
                title: 'Pod System',
                price: 2500,
                category: 'pod',
                description: 'Отличный под систем, в отличном состоянии',
                photos: [],
                sellerId: 123456,
                sellerName: 'Алексей',
                sellerUsername: 'alex',
                likes: 5,
                dislikes: 1,
                date: new Date().toISOString()
            }
        ];
    }
    
    renderAds();
}

// Сохранение объявлений
function saveAds() {
    localStorage.setItem('ads', JSON.stringify(window.ads));
}

// Отображение объявлений
function renderAds() {
    const homePage = document.getElementById('homePage');
    
    // Фильтрация по категории
    let filteredAds = window.ads;
    if (window.currentCategory !== 'all') {
        filteredAds = window.ads.filter(ad => ad.category === window.currentCategory);
    }
    
    // HTML
    let html = `
        <div class="add-ad-section">
            <div class="add-ad-header">
                <div class="add-ad-title">
                    <i class="fas fa-plus-circle"></i> Добавить объявление
                </div>
                <button class="toggle-form-btn" onclick="toggleAdForm()">
                    <i class="fas fa-plus"></i> Новое
                </button>
            </div>
            <div id="addAdForm" class="add-ad-form">
                <input type="text" id="adTitle" class="form-input" placeholder="Название товара">
                <input type="number" id="adPrice" class="form-input" placeholder="Цена">
                <select id="adCategory" class="form-input">
                    <option value="pod">Под системы</option>
                    <option value="liquid">Жидкости</option>
                    <option value="mod">Моды</option>
                    <option value="accessory">Аксессуары</option>
                </select>
                <textarea id="adDescription" class="form-input" placeholder="Описание"></textarea>
                
                <div class="photo-upload-section">
                    <div class="uploaded-photos-container" id="uploadedPhotos"></div>
                    <input type="file" id="photoInput" class="hidden-file-input" accept="image/*" multiple>
                    <button class="upload-btn" onclick="document.getElementById('photoInput').click()">
                        <i class="fas fa-camera"></i> Загрузить фото
                    </button>
                    <div class="upload-info">Можно загрузить до 5 фото</div>
                </div>
                
                <div class="form-buttons">
                    <button class="publish-btn" onclick="publishAd()">Опубликовать</button>
                    <button class="cancel-btn" onclick="toggleAdForm()">Отмена</button>
                </div>
            </div>
        </div>
        
        <div class="categories">
            <button class="category-btn ${window.currentCategory === 'all' ? 'active' : ''}" onclick="filterAds('all')">Все</button>
            <button class="category-btn ${window.currentCategory === 'pod' ? 'active' : ''}" onclick="filterAds('pod')">Под системы</button>
            <button class="category-btn ${window.currentCategory === 'liquid' ? 'active' : ''}" onclick="filterAds('liquid')">Жидкости</button>
            <button class="category-btn ${window.currentCategory === 'mod' ? 'active' : ''}" onclick="filterAds('mod')">Моды</button>
            <button class="category-btn ${window.currentCategory === 'accessory' ? 'active' : ''}" onclick="filterAds('accessory')">Аксессуары</button>
        </div>
        
        <div id="adsList">
    `;
    
    if (filteredAds.length === 0) {
        html += '<div style="text-align: center; padding: 40px;">Нет объявлений</div>';
    } else {
        filteredAds.forEach(ad => {
            html += renderAdCard(ad);
        });
    }
    
    html += `</div>`;
    homePage.innerHTML = html;
}

// Рендер карточки объявления
function renderAdCard(ad) {
    const userVote = getUserVote(ad.id);
    
    return `
        <div class="advertisement-card" data-ad-id="${ad.id}">
            <div class="seller-header">
                <div class="seller-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="seller-info">
                    <div class="seller-name">${ad.sellerName || 'Продавец'}</div>
                    <div class="seller-username">@${ad.sellerUsername || 'user'}</div>
                    <div class="seller-stats">
                        <span class="seller-stat stat-likes"><i class="fas fa-thumbs-up"></i> ${ad.likes || 0}</span>
                        <span class="seller-stat stat-dislikes"><i class="fas fa-thumbs-down"></i> ${ad.dislikes || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="photo-gallery">
                ${renderPhotos(ad.photos)}
            </div>
            
            <div class="product-info">
                <div class="product-title">${ad.title}</div>
                <div class="product-category">${getCategoryName(ad.category)}</div>
                <div class="product-price">${ad.price} ₽</div>
                <div class="product-description">${ad.description}</div>
            </div>
            
            <div class="action-grid">
                <button class="rate-btn like-btn ${userVote === 'like' ? 'active' : ''}" onclick="rateAd(${ad.id}, 'like')">
                    <i class="fas fa-thumbs-up"></i>
                </button>
                <button class="rate-btn dislike-btn ${userVote === 'dislike' ? 'active' : ''}" onclick="rateAd(${ad.id}, 'dislike')">
                    <i class="fas fa-thumbs-down"></i>
                </button>
                <button class="contact-btn" onclick="contactSeller(${ad.id})">
                    <i class="fab fa-telegram"></i> Написать продавцу
                </button>
            </div>
            
            ${ad.sellerId !== window.user.id ? `
                <button class="complaint-btn" onclick="reportAd(${ad.id})">
                    <i class="fas fa-flag"></i> Пожаловаться
                </button>
            ` : `
                <div class="my-ad-actions" style="margin-top: 15px;">
                    <button class="edit-ad-btn" onclick="editAd(${ad.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="delete-ad-btn" onclick="deleteAd(${ad.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            `}
        </div>
    `;
}

// Рендер фото
function renderPhotos(photos) {
    if (!photos || photos.length === 0) {
        return `
            <div class="photo-item">
                <div class="photo-placeholder">
                    <i class="fas fa-image"></i>
                    <span>Нет фото</span>
                </div>
            </div>
        `;
    }
    
    return photos.map((photo, index) => `
        <div class="photo-item" onclick="openPhotoGallery(${JSON.stringify(photos)}, ${index})">
            <img src="${photo}" alt="Фото товара">
            ${photos.length > 1 ? `<div class="photo-label">${index + 1}/${photos.length}</div>` : ''}
        </div>
    `).join('');
}

// Получить название категории
function getCategoryName(category) {
    const categories = {
        'pod': 'Под система',
        'liquid': 'Жидкость',
        'mod': 'Мод',
        'accessory': 'Аксессуар'
    };
    return categories[category] || category;
}

// Получить голос пользователя
function getUserVote(adId) {
    const votes = JSON.parse(localStorage.getItem(`votes_${window.user.id}`) || '{}');
    return votes[adId];
}

// Фильтрация объявлений
function filterAds(category) {
    window.currentCategory = category;
    renderAds();
}

// Переключение формы добавления
function toggleAdForm() {
    const form = document.getElementById('addAdForm');
    if (form.classList.contains('active')) {
        form.classList.remove('active');
    } else {
        form.classList.add('active');
    }
}

// Публикация объявления
async function publishAd() {
    const title = document.getElementById('adTitle').value;
    const price = document.getElementById('adPrice').value;
    const category = document.getElementById('adCategory').value;
    const description = document.getElementById('adDescription').value;
    
    if (!title || !price || !description) {
        showNotification('Заполните все поля!', 'error');
        return;
    }
    
    const newAd = {
        id: Date.now(),
        title,
        price: parseInt(price),
        category,
        description,
        photos: window.selectedPhotos || [],
        sellerId: window.user.id,
        sellerName: window.user.first_name,
        sellerUsername: window.user.username || 'user',
        likes: 0,
        dislikes: 0,
        date: new Date().toISOString()
    };
    
    window.ads.unshift(newAd);
    saveAds();
    
    // Сохраняем в объявления пользователя
    window.userAds.unshift(newAd.id);
    localStorage.setItem(`userAds_${window.user.id}`, JSON.stringify(window.userAds));
    
    showNotification('Объявление опубликовано!', 'success');
    toggleAdForm();
    renderAds();
    
    // Очищаем форму
    document.getElementById('adTitle').value = '';
    document.getElementById('adPrice').value = '';
    document.getElementById('adDescription').value = '';
    window.selectedPhotos = [];
    document.getElementById('uploadedPhotos').innerHTML = '';
}

// Загрузка фото
document.addEventListener('DOMContentLoaded', () => {
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            window.selectedPhotos = window.selectedPhotos || [];
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    window.selectedPhotos.push(event.target.result);
                    displayUploadedPhotos();
                };
                reader.readAsDataURL(file);
            });
        });
    }
});

// Отображение загруженных фото
function displayUploadedPhotos() {
    const container = document.getElementById('uploadedPhotos');
    if (!container) return;
    
    container.innerHTML = window.selectedPhotos.map((photo, index) => `
        <div class="uploaded-photo-item">
            <img src="${photo}" alt="Загруженное фото">
            <button class="remove-photo-btn" onclick="removePhoto(${index})">×</button>
        </div>
    `).join('');
}

// Удаление фото
function removePhoto(index) {
    window.selectedPhotos.splice(index, 1);
    displayUploadedPhotos();
}

// Голосование за объявление
function rateAd(adId, type) {
    const ad = window.ads.find(a => a.id === adId);
    if (!ad) return;
    
    const votes = JSON.parse(localStorage.getItem(`votes_${window.user.id}`) || '{}');
    const currentVote = votes[adId];
    
    // Отменяем предыдущий голос
    if (currentVote === 'like') {
        ad.likes--;
    } else if (currentVote === 'dislike') {
        ad.dislikes--;
    }
    
    // Если новый голос не совпадает с предыдущим
    if (currentVote !== type) {
        if (type === 'like') {
            ad.likes++;
            votes[adId] = 'like';
        } else if (type === 'dislike') {
            ad.dislikes++;
            votes[adId] = 'dislike';
        }
    } else {
        // Отмена голоса
        delete votes[adId];
    }
    
    localStorage.setItem(`votes_${window.user.id}`, JSON.stringify(votes));
    saveAds();
    renderAds();
    showNotification('Оценка обновлена!', 'success');
}

// Связь с продавцом
function contactSeller(adId) {
    const ad = window.ads.find(a => a.id === adId);
    if (ad && ad.sellerUsername) {
        window.open(`https://t.me/${ad.sellerUsername}`, '_blank');
    } else {
        showNotification('Не удалось связаться с продавцом', 'error');
    }
}

// Жалоба на объявление
function reportAd(adId) {
    const reason = prompt('Укажите причину жалобы:');
    if (reason) {
        window.complaints.push({
            id: Date.now(),
            adId,
            reporterId: window.user.id,
            reason,
            status: 'new',
            date: new Date().toISOString()
        });
        localStorage.setItem('complaints', JSON.stringify(window.complaints));
        showNotification('Жалоба отправлена модератору', 'success');
    }
}

// Редактирование объявления
function editAd(adId) {
    const ad = window.ads.find(a => a.id === adId);
    if (!ad || ad.sellerId !== window.user.id) return;
    
    // Заполняем форму
    document.getElementById('adTitle').value = ad.title;
    document.getElementById('adPrice').value = ad.price;
    document.getElementById('adCategory').value = ad.category;
    document.getElementById('adDescription').value = ad.description;
    window.selectedPhotos = ad.photos || [];
    displayUploadedPhotos();
    
    // Показываем форму
    toggleAdForm();
    
    // Меняем кнопку публикации
    const publishBtn = document.querySelector('.publish-btn');
    const oldClick = publishBtn.onclick;
    publishBtn.onclick = () => updateAd(adId);
}

// Обновление объявления
function updateAd(adId) {
    const title = document.getElementById('adTitle').value;
    const price = document.getElementById('adPrice').value;
    const category = document.getElementById('adCategory').value;
    const description = document.getElementById('adDescription').value;
    
    const index = window.ads.findIndex(a => a.id === adId);
    if (index !== -1) {
        window.ads[index] = {
            ...window.ads[index],
            title,
            price: parseInt(price),
            category,
            description,
            photos: window.selectedPhotos || []
        };
        saveAds();
        showNotification('Объявление обновлено!', 'success');
        toggleAdForm();
        renderAds();
    }
}

// Удаление объявления
function deleteAd(adId) {
    if (confirm('Вы уверены, что хотите удалить это объявление?')) {
        window.ads = window.ads.filter(ad => ad.id !== adId);
        window.userAds = window.userAds.filter(id => id !== adId);
        localStorage.setItem(`userAds_${window.user.id}`, JSON.stringify(window.userAds));
        saveAds();
        renderAds();
        showNotification('Объявление удалено', 'success');
    }
}

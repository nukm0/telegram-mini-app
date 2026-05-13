// Загрузка объявлений
async function loadAds() {
    // Загружаем из localStorage
    const saved = localStorage.getItem('ads');
    if (saved) {
        window.ads = JSON.parse(saved);
    } else {
        // Демо данные с тестовыми фото
        window.ads = [
            {
                id: 1,
                title: 'Pod System Voopoo',
                price: 2500,
                category: 'pod',
                description: 'Отличный под систем, в отличном состоянии. Полный комплект.',
                photos: ['https://via.placeholder.com/120x120?text=Photo+1', 'https://via.placeholder.com/120x120?text=Photo+2'],
                sellerId: 998579758,
                sellerName: '𓆩nukm0𓆪',
                sellerUsername: 'nukm0',
                likes: 5,
                dislikes: 1,
                date: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Жидкость Havana 30mg',
                price: 450,
                category: 'liquid',
                description: 'Новая, вкусная жидкость. Крепость 30mg.',
                photos: ['https://via.placeholder.com/120x120?text=Liquid'],
                sellerId: 998579758,
                sellerName: '𓆩nukm0𓆪',
                sellerUsername: 'nukm0',
                likes: 3,
                dislikes: 0,
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
    if (!homePage) return;
    
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
                <button class="toggle-form-btn" onclick="window.toggleAdForm()">
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
                    <button class="upload-btn" type="button" onclick="document.getElementById('photoInput').click()">
                        <i class="fas fa-camera"></i> Загрузить фото
                    </button>
                    <div class="upload-info">Можно загрузить до 5 фото</div>
                </div>
                
                <div class="form-buttons">
                    <button class="publish-btn" type="button" onclick="window.publishAd()">Опубликовать</button>
                    <button class="cancel-btn" type="button" onclick="window.toggleAdForm()">Отмена</button>
                </div>
            </div>
        </div>
        
        <div class="categories">
            <button class="category-btn ${window.currentCategory === 'all' ? 'active' : ''}" onclick="window.filterAds('all')">Все</button>
            <button class="category-btn ${window.currentCategory === 'pod' ? 'active' : ''}" onclick="window.filterAds('pod')">Под системы</button>
            <button class="category-btn ${window.currentCategory === 'liquid' ? 'active' : ''}" onclick="window.filterAds('liquid')">Жидкости</button>
            <button class="category-btn ${window.currentCategory === 'mod' ? 'active' : ''}" onclick="window.filterAds('mod')">Моды</button>
            <button class="category-btn ${window.currentCategory === 'accessory' ? 'active' : ''}" onclick="window.filterAds('accessory')">Аксессуары</button>
        </div>
        
        <div id="adsList">
    `;
    
    if (filteredAds.length === 0) {
        html += '<div style="text-align: center; padding: 40px;">😕 Нет объявлений</div>';
    } else {
        filteredAds.forEach(ad => {
            html += window.renderAdCard(ad);
        });
    }
    
    html += `</div>`;
    homePage.innerHTML = html;
}

// Рендер карточки объявления
window.renderAdCard = function(ad) {
    const userVote = window.getUserVote(ad.id);
    const isOwner = ad.sellerId === window.user.id;
    
    return `
        <div class="advertisement-card" data-ad-id="${ad.id}">
            <div class="seller-header">
                <div class="seller-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="seller-info">
                    <div class="seller-name">${window.escapeHtml(ad.sellerName || 'Продавец')}</div>
                    <div class="seller-username">@${ad.sellerUsername || 'user'}</div>
                    <div class="seller-stats">
                        <span class="seller-stat stat-likes"><i class="fas fa-thumbs-up"></i> ${ad.likes || 0}</span>
                        <span class="seller-stat stat-dislikes"><i class="fas fa-thumbs-down"></i> ${ad.dislikes || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="photo-gallery">
                ${window.renderPhotos(ad.photos)}
            </div>
            
            <div class="product-info">
                <div class="product-title">${window.escapeHtml(ad.title)}</div>
                <div class="product-category">${window.getCategoryName(ad.category)}</div>
                <div class="product-price">${ad.price.toLocaleString()} ₽</div>
                <div class="product-description">${window.escapeHtml(ad.description)}</div>
            </div>
            
            <div class="action-grid">
                <button class="rate-btn like-btn ${userVote === 'like' ? 'active' : ''}" onclick="window.rateAd(${ad.id}, 'like')">
                    <i class="fas fa-thumbs-up"></i>
                </button>
                <button class="rate-btn dislike-btn ${userVote === 'dislike' ? 'active' : ''}" onclick="window.rateAd(${ad.id}, 'dislike')">
                    <i class="fas fa-thumbs-down"></i>
                </button>
                <button class="contact-btn" onclick="window.contactSeller(${ad.id})">
                    <i class="fab fa-telegram"></i> Написать продавцу
                </button>
            </div>
            
            ${!isOwner ? `
                <button class="complaint-btn" onclick="window.reportAd(${ad.id})">
                    <i class="fas fa-flag"></i> Пожаловаться
                </button>
            ` : `
                <div class="my-ad-actions" style="margin-top: 15px;">
                    <button class="edit-ad-btn" onclick="window.editAd(${ad.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="delete-ad-btn" onclick="window.deleteAd(${ad.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            `}
        </div>
    `;
};

// Рендер фото - ИСПРАВЛЕНО!
window.renderPhotos = function(photos) {
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
    
    // Проверяем, что photos - это массив
    const photoArray = Array.isArray(photos) ? photos : [];
    
    if (photoArray.length === 0) {
        return `
            <div class="photo-item">
                <div class="photo-placeholder">
                    <i class="fas fa-image"></i>
                    <span>Нет фото</span>
                </div>
            </div>
        `;
    }
    
    return photoArray.map((photo, index) => `
        <div class="photo-item" onclick="window.openPhotoGallery(${JSON.stringify(photoArray)}, ${index})">
            <img src="${photo}" alt="Фото товара" onerror="this.src='https://via.placeholder.com/120x120?text=No+Image'">
            ${photoArray.length > 1 ? `<div class="photo-label">${index + 1}/${photoArray.length}</div>` : ''}
        </div>
    `).join('');
};

// Получить название категории
window.getCategoryName = function(category) {
    const categories = {
        'pod': 'Под система',
        'liquid': 'Жидкость',
        'mod': 'Мод',
        'accessory': 'Аксессуар'
    };
    return categories[category] || category;
};

// Получить голос пользователя
window.getUserVote = function(adId) {
    const votes = JSON.parse(localStorage.getItem(`votes_${window.user.id}`) || '{}');
    return votes[adId];
};

// Фильтрация объявлений
window.filterAds = function(category) {
    window.currentCategory = category;
    window.renderAds();
};

// Переключение формы добавления
window.toggleAdForm = function() {
    const form = document.getElementById('addAdForm');
    if (form) {
        if (form.classList.contains('active')) {
            form.classList.remove('active');
        } else {
            form.classList.add('active');
        }
    }
};

// Публикация объявления
window.publishAd = function() {
    const title = document.getElementById('adTitle')?.value;
    const price = document.getElementById('adPrice')?.value;
    const category = document.getElementById('adCategory')?.value;
    const description = document.getElementById('adDescription')?.value;
    
    if (!title || !price || !description) {
        window.showNotification('Заполните все поля!', 'error');
        return;
    }
    
    const newAd = {
        id: Date.now(),
        title: title,
        price: parseInt(price),
        category: category,
        description: description,
        photos: window.selectedPhotos && window.selectedPhotos.length > 0 ? [...window.selectedPhotos] : ['https://via.placeholder.com/120x120?text=No+Photo'],
        sellerId: window.user.id,
        sellerName: window.user.first_name,
        sellerUsername: window.user.username || 'user',
        likes: 0,
        dislikes: 0,
        date: new Date().toISOString()
    };
    
    window.ads.unshift(newAd);
    window.saveAds();
    
    // Сохраняем в объявления пользователя
    if (!window.userAds.includes(newAd.id)) {
        window.userAds.unshift(newAd.id);
    }
    localStorage.setItem(`userAds_${window.user.id}`, JSON.stringify(window.userAds));
    
    window.showNotification('Объявление опубликовано!', 'success');
    window.toggleAdForm();
    window.renderAds();
    
    // Очищаем форму
    const adTitle = document.getElementById('adTitle');
    const adPrice = document.getElementById('adPrice');
    const adDescription = document.getElementById('adDescription');
    if (adTitle) adTitle.value = '';
    if (adPrice) adPrice.value = '';
    if (adDescription) adDescription.value = '';
    
    window.selectedPhotos = [];
    const uploadedPhotos = document.getElementById('uploadedPhotos');
    if (uploadedPhotos) uploadedPhotos.innerHTML = '';
};

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
                    window.displayUploadedPhotos();
                };
                reader.readAsDataURL(file);
            });
        });
    }
});

// Отображение загруженных фото
window.displayUploadedPhotos = function() {
    const container = document.getElementById('uploadedPhotos');
    if (!container) return;
    
    const photos = window.selectedPhotos || [];
    
    if (photos.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = photos.map((photo, index) => `
        <div class="uploaded-photo-item">
            <img src="${photo}" alt="Загруженное фото">
            <button class="remove-photo-btn" onclick="window.removePhoto(${index})">×</button>
        </div>
    `).join('');
};

// Удаление фото
window.removePhoto = function(index) {
    window.selectedPhotos.splice(index, 1);
    window.displayUploadedPhotos();
};

// Голосование за объявление
window.rateAd = function(adId, type) {
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
    window.saveAds();
    window.renderAds();
    window.showNotification('Оценка обновлена!', 'success');
};

// Связь с продавцом
window.contactSeller = function(adId) {
    const ad = window.ads.find(a => a.id === adId);
    if (ad && ad.sellerUsername) {
        window.open(`https://t.me/${ad.sellerUsername}`, '_blank');
    } else {
        window.showNotification('Не удалось связаться с продавцом', 'error');
    }
};

// Жалоба на объявление
window.reportAd = function(adId) {
    const reason = prompt('Укажите причину жалобы:');
    if (reason) {
        window.complaints.push({
            id: Date.now(),
            adId: adId,
            reporterId: window.user.id,
            reason: reason,
            status: 'new',
            date: new Date().toISOString()
        });
        localStorage.setItem('complaints', JSON.stringify(window.complaints));
        window.showNotification('Жалоба отправлена модератору', 'success');
    }
};

// Редактирование объявления
window.editAd = function(adId) {
    const ad = window.ads.find(a => a.id === adId);
    if (!ad || ad.sellerId !== window.user.id) return;
    
    // Заполняем форму
    const titleInput = document.getElementById('adTitle');
    const priceInput = document.getElementById('adPrice');
    const categorySelect = document.getElementById('adCategory');
    const descTextarea = document.getElementById('adDescription');
    
    if (titleInput) titleInput.value = ad.title;
    if (priceInput) priceInput.value = ad.price;
    if (categorySelect) categorySelect.value = ad.category;
    if (descTextarea) descTextarea.value = ad.description;
    
    window.selectedPhotos = ad.photos && ad.photos.length > 0 ? [...ad.photos] : [];
    window.displayUploadedPhotos();
    
    // Показываем форму
    window.toggleAdForm();
    
    // Меняем кнопку публикации
    const publishBtn = document.querySelector('.publish-btn');
    if (publishBtn) {
        publishBtn.textContent = 'Обновить';
        publishBtn.onclick = () => window.updateAd(adId);
    }
};

// Обновление объявления
window.updateAd = function(adId) {
    const title = document.getElementById('adTitle')?.value;
    const price = document.getElementById('adPrice')?.value;
    const category = document.getElementById('adCategory')?.value;
    const description = document.getElementById('adDescription')?.value;
    
    const index = window.ads.findIndex(a => a.id === adId);
    if (index !== -1) {
        window.ads[index] = {
            ...window.ads[index],
            title: title,
            price: parseInt(price),
            category: category,
            description: description,
            photos: window.selectedPhotos && window.selectedPhotos.length > 0 ? [...window.selectedPhotos] : ['https://via.placeholder.com/120x120?text=No+Photo']
        };
        window.saveAds();
        window.showNotification('Объявление обновлено!', 'success');
        window.toggleAdForm();
        window.renderAds();
        
        // Восстанавливаем кнопку
        const publishBtn = document.querySelector('.publish-btn');
        if (publishBtn) {
            publishBtn.textContent = 'Опубликовать';
            publishBtn.onclick = () => window.publishAd();
        }
    }
};

// Удаление объявления
window.deleteAd = function(adId) {
    if (confirm('Вы уверены, что хотите удалить это объявление?')) {
        window.ads = window.ads.filter(ad => ad.id !== adId);
        window.userAds = window.userAds.filter(id => id !== adId);
        localStorage.setItem(`userAds_${window.user.id}`, JSON.stringify(window.userAds));
        window.saveAds();
        window.renderAds();
        window.showNotification('Объявление удалено', 'success');
    }
};

// Экранирование HTML
window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

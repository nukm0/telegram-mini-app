<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Vape Market | Барахолка для вейпов</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css">
    
    <style>
        /* Дополнительные стили для бейджа и исправлений */
        .admin-badge {
            position: absolute;
            top: 12px;
            right: 15px;
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            display: none;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10;
        }
        .admin-badge.show {
            display: flex;
        }
        .app-header {
            position: relative;
        }
        /* Фикс для фото */
        .uploaded-photos-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }
        .uploaded-photo-item {
            width: 80px;
            height: 80px;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        .uploaded-photo-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .remove-photo-btn {
            position: absolute;
            top: 2px;
            right: 2px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            z-index: 5;
        }
        .hidden-file-input {
            display: none;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Шапка с бейджем -->
        <div class="app-header">
            <div class="logo">
                <i class="fas fa-vape"></i>
                <span>Vape Market</span>
            </div>
            <div class="admin-badge" id="adminBadge">
                <i class="fas fa-shield-alt"></i> ADMIN
            </div>
        </div>

        <div class="main-content">
            <div id="homePage" class="page active"></div>
            <div id="profilePage" class="page"></div>
            <div id="faqPage" class="page">
                <div class="faq-list">
                    <div class="faq-item">
                        <div class="faq-question">Как создать объявление? <i class="fas fa-chevron-down"></i></div>
                        <div class="faq-answer" style="display: none;">Нажмите на кнопку "Новое", заполните форму и опубликуйте объявление.</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">Как связаться с продавцом? <i class="fas fa-chevron-down"></i></div>
                        <div class="faq-answer" style="display: none;">Нажмите кнопку "Написать продавцу" на карточке товара.</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">Как пожаловаться на объявление? <i class="fas fa-chevron-down"></i></div>
                        <div class="faq-answer" style="display: none;">В карточке объявления нажмите кнопку "Пожаловаться".</div>
                    </div>
                </div>
            </div>
            <div id="adminPage" class="page"></div>
        </div>

        <div class="bottom-nav">
            <button class="nav-item active" data-page="home"><i class="fas fa-home nav-icon"></i><span class="nav-label">Главная</span></button>
            <button class="nav-item" data-page="profile"><i class="fas fa-user nav-icon"></i><span class="nav-label">Профиль</span></button>
            <button class="nav-item" data-page="faq"><i class="fas fa-question-circle nav-icon"></i><span class="nav-label">FAQ</span></button>
            <button class="nav-item admin-only" data-page="admin" style="display: none;"><i class="fas fa-shield-alt nav-icon"></i><span class="nav-label">Админ</span></button>
        </div>
    </div>

    <div id="photoModal" class="photo-modal">
        <div class="photo-modal-close">×</div>
        <img class="photo-modal-img" alt="Просмотр фото">
        <div class="photo-modal-counter"></div>
        <div class="photo-modal-nav">
            <button class="photo-modal-nav-btn prev">‹</button>
            <button class="photo-modal-nav-btn next">›</button>
        </div>
    </div>

    <script>
        // ========== ВСЯ ЛОГИКА В ОДНОМ ФАЙЛЕ ==========
        
        // Глобальные переменные
        window.ads = [];
        window.currentCategory = 'all';
        window.user = {};
        window.userRating = { likes: 0, dislikes: 0 };
        window.viewHistory = [];
        window.userAds = [];
        window.complaints = [];
        window.bannerText = 'Добро пожаловать в Vape Market!';
        window.selectedPhotos = [];

        // ИНИЦИАЛИЗАЦИЯ
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('🚀 Приложение запущено');
            
            // Получаем пользователя
            if (window.Telegram && window.Telegram.WebApp) {
                const webApp = window.Telegram.WebApp;
                webApp.expand();
                window.user = webApp.initDataUnsafe?.user || {
                    id: 998579758,
                    first_name: '𓆩nukm0𓆪',
                    username: 'nukm0'
                };
            } else {
                window.user = { id: 998579758, first_name: '𓆩nukm0𓆪', username: 'nukm0' };
            }
            
            console.log('👤 Пользователь:', window.user);
            
            // Загрузка данных
            await loadAllData();
            initUI();
            checkAdmin();
            await loadAds();
            
            showNotification(`Добро пожаловать, ${window.user.first_name}!`, 'success');
        });

        async function loadAllData() {
            const savedRating = localStorage.getItem(`userRating_${window.user.id}`);
            window.userRating = savedRating ? JSON.parse(savedRating) : { likes: 0, dislikes: 0 };
            
            const savedHistory = localStorage.getItem(`viewHistory_${window.user.id}`);
            window.viewHistory = savedHistory ? JSON.parse(savedHistory) : [];
            
            const savedUserAds = localStorage.getItem(`userAds_${window.user.id}`);
            window.userAds = savedUserAds ? JSON.parse(savedUserAds) : [];
            
            const savedComplaints = localStorage.getItem('complaints');
            window.complaints = savedComplaints ? JSON.parse(savedComplaints) : [];
            
            const savedBanner = localStorage.getItem('bannerText');
            window.bannerText = savedBanner || 'Добро пожаловать в Vape Market!';
        }

        function checkAdmin() {
            const adminIds = [998579758, 123456789];
            const isAdmin = adminIds.includes(Number(window.user.id));
            console.log('🔐 Проверка админа:', isAdmin);
            
            if (isAdmin) {
                const adminNav = document.querySelector('.admin-only');
                const adminBadge = document.getElementById('adminBadge');
                if (adminNav) adminNav.style.display = 'flex';
                if (adminBadge) adminBadge.classList.add('show');
                showNotification('Вы вошли как администратор!', 'success');
            }
        }

        function initUI() {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => switchPage(item.dataset.page));
            });
            
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

        function switchPage(page) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(`${page}Page`).classList.add('active');
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === page) item.classList.add('active');
            });
            
            if (page === 'home') renderAds();
            else if (page === 'profile') renderProfile();
            else if (page === 'admin') renderAdminPanel();
        }

        // ========== UI ФУНКЦИИ (уведомления, галерея) ==========
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
            notification.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
            document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 10);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        function openPhotoGallery(photos, currentIndex) {
            const modal = document.getElementById('photoModal');
            const img = modal.querySelector('.photo-modal-img');
            const counter = modal.querySelector('.photo-modal-counter');
            window.currentGalleryPhotos = photos;
            window.currentGalleryIndex = currentIndex;
            img.src = photos[currentIndex];
            counter.textContent = `${currentIndex + 1} / ${photos.length}`;
            modal.classList.add('active');
        }

        function closePhotoGallery() {
            document.getElementById('photoModal').classList.remove('active');
        }

        // ========== ОБЪЯВЛЕНИЯ ==========
        async function loadAds() {
            const saved = localStorage.getItem('ads');
            if (saved) {
                window.ads = JSON.parse(saved);
            } else {
                window.ads = [
                    { id: 1, title: 'Pod System Voopoo', price: 2500, category: 'pod', description: 'Отличный под систем, полный комплект.', photos: [], sellerId: 998579758, sellerName: '𓆩nukm0𓆪', sellerUsername: 'nukm0', likes: 5, dislikes: 1, date: new Date().toISOString() }
                ];
            }
            renderAds();
        }

        function saveAds() {
            localStorage.setItem('ads', JSON.stringify(window.ads));
        }

        function renderAds() {
            const homePage = document.getElementById('homePage');
            if (!homePage) return;
            
            let filteredAds = window.currentCategory === 'all' ? window.ads : window.ads.filter(ad => ad.category === window.currentCategory);
            
            let html = `
                <div class="add-ad-section">
                    <div class="add-ad-header">
                        <div class="add-ad-title"><i class="fas fa-plus-circle"></i> Добавить объявление</div>
                        <button class="toggle-form-btn" onclick="toggleAdForm()"><i class="fas fa-plus"></i> Новое</button>
                    </div>
                    <div id="addAdForm" class="add-ad-form">
                        <input type="text" id="adTitle" class="form-input" placeholder="Название товара">
                        <input type="number" id="adPrice" class="form-input" placeholder="Цена">
                        <select id="adCategory" class="form-input">
                            <option value="pod">Под системы</option><option value="liquid">Жидкости</option>
                            <option value="mod">Моды</option><option value="accessory">Аксессуары</option>
                        </select>
                        <textarea id="adDescription" class="form-input" placeholder="Описание"></textarea>
                        <div class="photo-upload-section">
                            <div class="uploaded-photos-container" id="uploadedPhotos"></div>
                            <input type="file" id="photoInput" class="hidden-file-input" accept="image/*" multiple>
                            <button class="upload-btn" type="button" onclick="document.getElementById('photoInput').click()">
                                <i class="fas fa-camera"></i> Загрузить фото (до 5)
                            </button>
                        </div>
                        <div class="form-buttons">
                            <button class="publish-btn" type="button" onclick="publishAd()">Опубликовать</button>
                            <button class="cancel-btn" type="button" onclick="toggleAdForm()">Отмена</button>
                        </div>
                    </div>
                </div>
                <div class="categories">
                    ${['all','pod','liquid','mod','accessory'].map(cat => `<button class="category-btn ${window.currentCategory === cat ? 'active' : ''}" onclick="filterAds('${cat}')">${cat === 'all' ? 'Все' : cat === 'pod' ? 'Под системы' : cat === 'liquid' ? 'Жидкости' : cat === 'mod' ? 'Моды' : 'Аксессуары'}</button>`).join('')}
                </div>
                <div id="adsList">${filteredAds.length === 0 ? '<div style="text-align:center;padding:40px;">😕 Нет объявлений</div>' : filteredAds.map(ad => renderAdCard(ad)).join('')}</div>
            `;
            homePage.innerHTML = html;
        }

        function renderAdCard(ad) {
            const isOwner = ad.sellerId === window.user.id;
            const userVote = (JSON.parse(localStorage.getItem(`votes_${window.user.id}`) || '{}'))[ad.id];
            const photosHtml = (!ad.photos || ad.photos.length === 0) ? 
                `<div class="photo-item"><div class="photo-placeholder"><i class="fas fa-image"></i><span>Нет фото</span></div></div>` :
                ad.photos.map((p, i) => `<div class="photo-item" onclick="openPhotoGallery(${JSON.stringify(ad.photos)}, ${i})"><img src="${p}" onerror="this.src='https://via.placeholder.com/120x120?text=Error'"><div class="photo-label">${i+1}/${ad.photos.length}</div></div>`).join('');
            
            return `
                <div class="advertisement-card" data-ad-id="${ad.id}">
                    <div class="seller-header">
                        <div class="seller-avatar"><i class="fas fa-user"></i></div>
                        <div class="seller-info">
                            <div class="seller-name">${ad.sellerName}</div>
                            <div class="seller-username">@${ad.sellerUsername}</div>
                            <div class="seller-stats"><span class="seller-stat stat-likes"><i class="fas fa-thumbs-up"></i> ${ad.likes}</span><span class="seller-stat stat-dislikes"><i class="fas fa-thumbs-down"></i> ${ad.dislikes}</span></div>
                        </div>
                    </div>
                    <div class="photo-gallery">${photosHtml}</div>
                    <div class="product-info">
                        <div class="product-title">${ad.title}</div>
                        <div class="product-category">${getCategoryName(ad.category)}</div>
                        <div class="product-price">${ad.price} ₽</div>
                        <div class="product-description">${ad.description}</div>
                    </div>
                    <div class="action-grid">
                        <button class="rate-btn like-btn ${userVote === 'like' ? 'active' : ''}" onclick="rateAd(${ad.id}, 'like')"><i class="fas fa-thumbs-up"></i></button>
                        <button class="rate-btn dislike-btn ${userVote === 'dislike' ? 'active' : ''}" onclick="rateAd(${ad.id}, 'dislike')"><i class="fas fa-thumbs-down"></i></button>
                        <button class="contact-btn" onclick="contactSeller(${ad.id})"><i class="fab fa-telegram"></i> Написать продавцу</button>
                    </div>
                    ${!isOwner ? `<button class="complaint-btn" onclick="reportAd(${ad.id})"><i class="fas fa-flag"></i> Пожаловаться</button>` : 
                        `<div class="my-ad-actions" style="margin-top:15px;"><button class="edit-ad-btn" onclick="editAd(${ad.id})"><i class="fas fa-edit"></i> Редактировать</button><button class="delete-ad-btn" onclick="deleteAd(${ad.id})"><i class="fas fa-trash"></i> Удалить</button></div>`}
                </div>
            `;
        }

        function getCategoryName(cat) {
            const names = { pod: 'Под система', liquid: 'Жидкость', mod: 'Мод', accessory: 'Аксессуар' };
            return names[cat] || cat;
        }

        window.filterAds = (cat) => { window.currentCategory = cat; renderAds(); };
        window.toggleAdForm = () => document.getElementById('addAdForm')?.classList.toggle('active');
        
        // Загрузка фото
        document.addEventListener('DOMContentLoaded', () => {
            const photoInput = document.getElementById('photoInput');
            if (photoInput) {
                photoInput.addEventListener('change', (e) => {
                    const files = Array.from(e.target.files);
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
        
        function displayUploadedPhotos() {
            const container = document.getElementById('uploadedPhotos');
            if (!container) return;
            container.innerHTML = window.selectedPhotos.map((photo, i) => `
                <div class="uploaded-photo-item">
                    <img src="${photo}">
                    <button class="remove-photo-btn" onclick="removePhoto(${i})">×</button>
                </div>
            `).join('');
        }
        
        window.removePhoto = (i) => { window.selectedPhotos.splice(i, 1); displayUploadedPhotos(); };
        
        window.publishAd = () => {
            const title = document.getElementById('adTitle')?.value;
            const price = document.getElementById('adPrice')?.value;
            const category = document.getElementById('adCategory')?.value;
            const description = document.getElementById('adDescription')?.value;
            if (!title || !price || !description) return showNotification('Заполните все поля!', 'error');
            
            const newAd = {
                id: Date.now(), title, price: parseInt(price), category, description,
                photos: window.selectedPhotos.length ? [...window.selectedPhotos] : [],
                sellerId: window.user.id, sellerName: window.user.first_name,
                sellerUsername: window.user.username, likes: 0, dislikes: 0, date: new Date().toISOString()
            };
            window.ads.unshift(newAd);
            saveAds();
            if (!window.userAds.includes(newAd.id)) window.userAds.unshift(newAd.id);
            localStorage.setItem(`userAds_${window.user.id}`, JSON.stringify(window.userAds));
            showNotification('Объявление опубликовано!', 'success');
            window.toggleAdForm();
            renderAds();
            // Очистка
            document.getElementById('adTitle').value = '';
            document.getElementById('adPrice').value = '';
            document.getElementById('adDescription').value = '';
            window.selectedPhotos = [];
            displayUploadedPhotos();
        };
        
        window.rateAd = (adId, type) => {
            const ad = window.ads.find(a => a.id === adId);
            if (!ad) return;
            const votes = JSON.parse(localStorage.getItem(`votes_${window.user.id}`) || '{}');
            const current = votes[adId];
            if (current === 'like') ad.likes--;
            if (current === 'dislike') ad.dislikes--;
            if (current !== type) {
                if (type === 'like') ad.likes++;
                else ad.dislikes++;
                votes[adId] = type;
            } else delete votes[adId];
            localStorage.setItem(`votes_${window.user.id}`, JSON.stringify(votes));
            saveAds();
            renderAds();
            showNotification('Оценка обновлена!', 'success');
        };
        
        window.contactSeller = (adId) => {
            const ad = window.ads.find(a => a.id === adId);
            if (ad?.sellerUsername) window.open(`https://t.me/${ad.sellerUsername}`, '_blank');
            else showNotification('Не удалось связаться', 'error');
        };
        
        window.reportAd = (adId) => {
            const reason = prompt('Укажите причину жалобы:');
            if (reason) {
                window.complaints.push({ id: Date.now(), adId, reporterId: window.user.id, reason, status: 'new', date: new Date().toISOString() });
                localStorage.setItem('complaints', JSON.stringify(window.complaints));
                showNotification('Жалоба отправлена', 'success');
            }
        };
        
        window.editAd = (adId) => {
            const ad = window.ads.find(a => a.id === adId);
            if (!ad || ad.sellerId !== window.user.id) return;
            document.getElementById('adTitle').value = ad.title;
            document.getElementById('adPrice').value = ad.price;
            document.getElementById('adCategory').value = ad.category;
            document.getElementById('adDescription').value = ad.description;
            window.selectedPhotos = ad.photos ? [...ad.photos] : [];
            displayUploadedPhotos();
            window.toggleAdForm();
            const btn = document.querySelector('.publish-btn');
            btn.textContent = 'Обновить';
            btn.onclick = () => window.updateAd(adId);
        };
        
        window.updateAd = (adId) => {
            const index = window.ads.findIndex(a => a.id === adId);
            if (index !== -1) {
                window.ads[index] = {
                    ...window.ads[index],
                    title: document.getElementById('adTitle').value,
                    price: parseInt(document.getElementById('adPrice').value),
                    category: document.getElementById('adCategory').value,
                    description: document.getElementById('adDescription').value,
                    photos: window.selectedPhotos.length ? [...window.selectedPhotos] : []
                };
                saveAds();
                showNotification('Обновлено!', 'success');
                window.toggleAdForm();
                renderAds();
                const btn = document.querySelector('.publish-btn');
                btn.textContent = 'Опубликовать';
                btn.onclick = () => window.publishAd();
            }
        };
        
        window.deleteAd = (adId) => {
            if (confirm('Удалить объявление?')) {
                window.ads = window.ads.filter(ad => ad.id !== adId);
                window.userAds = window.userAds.filter(id => id !== adId);
                localStorage.setItem(`userAds_${window.user.id}`, JSON.stringify(window.userAds));
                saveAds();
                renderAds();
                showNotification('Удалено', 'success');
            }
        };
        
        // ========== ПРОФИЛЬ ==========
        function renderProfile() {
            const profilePage = document.getElementById('profilePage');
            profilePage.innerHTML = `
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar"><i class="fas fa-user"></i></div>
                        <div class="profile-info"><h2>${window.user.first_name}</h2><p>@${window.user.username}</p></div>
                    </div>
                    <div class="profile-stats">
                        <div class="profile-stat"><span class="stat-number">${window.userAds.length}</span><span class="stat-label">Объявлений</span></div>
                        <div class="profile-stat"><span class="stat-number">${window.userRating.likes}</span><span class="stat-label">Лайков</span></div>
                        <div class="profile-stat"><span class="stat-number">${window.userRating.dislikes}</span><span class="stat-label">Дизлайков</span></div>
                    </div>
                </div>
                <div class="profile-tabs">
                    <div class="profile-tab active" data-tab="my-ads">Мои объявления</div>
                    <div class="profile-tab" data-tab="history">История просмотров</div>
                </div>
                <div id="myAdsTab" class="profile-tab-content active"><div id="myAdsList"></div></div>
                <div id="historyTab" class="profile-tab-content"><div id="historyList"></div></div>
            `;
            document.querySelectorAll('.profile-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.dataset.tab;
                    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
                    document.getElementById(`${tabName}Tab`).classList.add('active');
                    if (tabName === 'my-ads') renderMyAds();
                    else renderHistory();
                });
            });
            renderMyAds();
            renderHistory();
        }
        
        function renderMyAds() {
            const container = document.getElementById('myAdsList');
            const myAds = window.ads.filter(ad => ad.sellerId === window.user.id);
            if (!myAds.length) { container.innerHTML = '<div style="text-align:center;padding:40px;">Нет объявлений</div>'; return; }
            container.innerHTML = myAds.map(ad => `
                <div class="my-ad-item">
                    <div class="my-ad-header"><div class="my-ad-title">${ad.title}</div><div class="my-ad-price">${ad.price} ₽</div></div>
                    <div class="my-ad-description">${ad.description.substring(0, 100)}...</div>
                    <div class="my-ad-actions"><button class="edit-ad-btn" onclick="editAd(${ad.id})"><i class="fas fa-edit"></i> Ред.</button><button class="delete-ad-btn" onclick="deleteAd(${ad.id})"><i class="fas fa-trash"></i> Уд.</button></div>
                </div>
            `).join('');
        }
        
        function renderHistory() {
            const container = document.getElementById('historyList');
            if (!window.viewHistory.length) { container.innerHTML = '<div style="text-align:center;padding:40px;">История пуста</div>'; return; }
            container.innerHTML = window.viewHistory.map(item => `
                <div class="history-item"><div class="history-info"><h4>${item.title}</h4><p>${new Date(item.date).toLocaleString()}</p></div><button class="remove-history-btn" onclick="removeFromHistory(${item.id})"><i class="fas fa-trash"></i></button></div>
            `).join('');
        }
        
        window.removeFromHistory = (adId) => {
            window.viewHistory = window.viewHistory.filter(i => i.id !== adId);
            localStorage.setItem(`viewHistory_${window.user.id}`, JSON.stringify(window.viewHistory));
            renderHistory();
            showNotification('Удалено из истории', 'success');
        };
        
        // ========== АДМИН-ПАНЕЛЬ ==========
        function renderAdminPanel() {
            const adminPage = document.getElementById('adminPage');
            const totalAds = window.ads.length;
            const totalUsers = new Set(window.ads.map(ad => ad.sellerId)).size;
            const newComplaints = window.complaints.filter(c => c.status === 'new').length;
            
            adminPage.innerHTML = `
                <div class="admin-page-content">
                    <div class="admin-section"><div class="admin-section-title"><i class="fas fa-chart-line"></i> Статистика</div>
                        <div class="admin-stats-grid">
                            <div class="admin-stat-card"><span class="admin-stat-number">${totalAds}</span><span class="admin-stat-label">Объявлений</span></div>
                            <div class="admin-stat-card"><span class="admin-stat-number">${totalUsers}</span><span class="admin-stat-label">Продавцов</span></div>
                            <div class="admin-stat-card"><span class="admin-stat-number">${window.complaints.length}</span><span class="admin-stat-label">Жалоб</span></div>
                            <div class="admin-stat-card"><span class="admin-stat-number">${newComplaints}</span><span class="admin-stat-label">Новых</span></div>
                        </div>
                    </div>
                    <div class="admin-section"><div class="admin-section-title"><i class="fas fa-cogs"></i> Управление</div>
                        <div class="admin-actions-grid">
                            <button class="admin-action-btn" onclick="showAdminComplaints()"><i class="fas fa-flag"></i><span>Жалобы (${newComplaints})</span></button>
                            <button class="admin-action-btn" onclick="showAllAds()"><i class="fas fa-list"></i><span>Все объявления</span></button>
                        </div>
                    </div>
                    <div id="adminComplaintsPanel" style="display:none;"><button class="admin-back-btn" onclick="hideAdminPanels()"><i class="fas fa-arrow-left"></i> Назад</button><div id="complaintsList"></div></div>
                    <div id="adminAdsPanel" style="display:none;"><button class="admin-back-btn" onclick="hideAdminPanels()"><i class="fas fa-arrow-left"></i> Назад</button><div id="allAdsList"></div></div>
                </div>
            `;
            renderComplaintsList();
            renderAllAdsList();
        }
        
        window.showAdminComplaints = () => {
            document.getElementById('adminComplaintsPanel').style.display = 'block';
            renderComplaintsList();
        };
        window.showAllAds = () => {
            document.getElementById('adminAdsPanel').style.display = 'block';
            renderAllAdsList();
        };
        window.hideAdminPanels = () => {
            document.getElementById('adminComplaintsPanel').style.display = 'none';
            document.getElementById('adminAdsPanel').style.display = 'none';
        };
        
        function renderComplaintsList() {
            const container = document.getElementById('complaintsList');
            if (!container) return;
            if (!window.complaints.length) { container.innerHTML = '<div style="text-align:center;padding:20px;">Нет жалоб</div>'; return; }
            container.innerHTML = window.complaints.map(c => {
                const ad = window.ads.find(a => a.id === c.adId);
                return `<div class="admin-list-item"><div><b>Жалоба #${c.id}</b><br>Объявление: ${ad?.title || 'Удалено'}<br>Причина: ${c.reason}<br>Статус: ${c.status}</div>
                    <div><button class="admin-small-btn" onclick="resolveComplaint(${c.id})">✅ Решить</button>
                    <button class="admin-small-btn delete" onclick="deleteComplaint(${c.id})">🗑 Удалить</button></div></div>`;
            }).join('');
        }
        
        window.resolveComplaint = (id) => {
            const c = window.complaints.find(c => c.id === id);
            if (c) { c.status = 'resolved'; localStorage.setItem('complaints', JSON.stringify(window.complaints)); renderComplaintsList(); showNotification('Жалоба решена', 'success'); }
        };
        window.deleteComplaint = (id) => {
            window.complaints = window.complaints.filter(c => c.id !== id);
            localStorage.setItem('complaints', JSON.stringify(window.complaints));
            renderComplaintsList();
            showNotification('Жалоба удалена', 'success');
        };
        
        function renderAllAdsList() {
            const container = document.getElementById('allAdsList');
            if (!container) return;
            if (!window.ads.length) { container.innerHTML = '<div style="text-align:center;padding:20px;">Нет объявлений</div>'; return; }
            container.innerHTML = window.ads.map(ad => `<div class="admin-list-item"><div><b>${ad.title}</b><br>${ad.price}₽ | ${ad.sellerName}<br>👎 ${ad.dislikes} | 👍 ${ad.likes}</div>
                <div><button class="admin-small-btn view" onclick="viewAdDetails(${ad.id})">👁</button>
                <button class="admin-small-btn delete" onclick="adminDeleteAd(${ad.id})">🗑</button></div></div>`).join('');
        }
        
        window.viewAdDetails = (id) => { switchPage('home'); setTimeout(() => document.querySelector(`.advertisement-card[data-ad-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth' }), 100); };
        window.adminDeleteAd = (id) => { if (confirm('Удалить?')) { window.ads = window.ads.filter(a => a.id !== id); saveAds(); renderAllAdsList(); if (document.getElementById('homePage').classList.contains('active')) renderAds(); showNotification('Удалено', 'success'); } };
        
        // Обработчики галереи
        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('photoModal');
            if (modal) {
                modal.querySelector('.photo-modal-close').addEventListener('click', closePhotoGallery);
                modal.querySelector('.prev').addEventListener('click', () => { if (window.currentGalleryIndex > 0) { window.currentGalleryIndex--; const img = modal.querySelector('.photo-modal-img'); const counter = modal.querySelector('.photo-modal-counter'); img.src = window.currentGalleryPhotos[window.currentGalleryIndex]; counter.textContent = `${window.currentGalleryIndex + 1} / ${window.currentGalleryPhotos.length}`; } });
                modal.querySelector('.next').addEventListener('click', () => { if (window.currentGalleryIndex < window.currentGalleryPhotos.length - 1) { window.currentGalleryIndex++; const img = modal.querySelector('.photo-modal-img'); const counter = modal.querySelector('.photo-modal-counter'); img.src = window.currentGalleryPhotos[window.currentGalleryIndex]; counter.textContent = `${window.currentGalleryIndex + 1} / ${window.currentGalleryPhotos.length}`; } });
                modal.addEventListener('click', (e) => { if (e.target === modal) closePhotoGallery(); });
            }
        });
    </script>
</body>
</html>

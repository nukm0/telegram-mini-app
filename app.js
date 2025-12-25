// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand(); // Развернуть приложение на весь экран

// Инициализируем кнопку Telegram
tg.MainButton.text = "Открыть меню";
tg.MainButton.show();

// Данные пользователя
let user = {
    id: tg.initDataUnsafe.user?.id || Math.floor(Math.random() * 10000),
    username: tg.initDataUnsafe.user?.username || 'User' + Math.floor(Math.random() * 1000),
    isAdmin: false
};

// Хранилище для выбранных фото (максимум 3)
let selectedPhotos = [];

// Хранилище объявлений
let ads = [
    {
        id: 1,
        userId: 123,
        username: "vape_seller",
        category: "liquids",
        title: "Жидкость Berry Mix 50мг",
        description: "Вкусная ягодная смесь, крепость 50мг, 30мл",
        price: 1500,
        photos: [
            "https://images.unsplash.com/photo-1600008646149-eb8835bd979d?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1621607512214-68297480165e?w-400&h=300&fit=crop"
        ],
        date: "2024-01-15"
    },
    {
        id: 2,
        userId: 456,
        username: "vape_shop",
        category: "disposables",
        title: "HQD Crystal Bar",
        description: "Одноразовая электронная сигарета, 4000 тяг, мятный вкус",
        price: 2500,
        photos: [
            "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=300&fit=crop"
        ],
        date: "2024-01-14"
    },
    {
        id: 3,
        userId: 789,
        username: "vape_master",
        category: "pod-systems",
        title: "Voopoo Drag S Pod Kit",
        description: "Мощная под-система, регулируемая мощность, сменные картриджи",
        price: 3500,
        photos: [
            "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=300&fit=crop"
        ],
        date: "2024-01-16"
    }
];

// Проверка на администратора
function checkAdmin() {
    // В реальном приложении проверка должна быть на сервере
    const adminIds = [123456, 789012]; // ID администраторов
    user.isAdmin = adminIds.includes(user.id);
}

// Загрузка при запуске
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем имя пользователя
    if (tg.initDataUnsafe.user) {
        const userName = tg.initDataUnsafe.user.first_name || tg.initDataUnsafe.user.username;
        document.getElementById('userName').textContent = userName;
        user.username = tg.initDataUnsafe.user.username || `user_${user.id}`;
    }
    
    checkAdmin();
    loadAds();
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        tg.showAlert(`Добро пожаловать, ${user.username}! Вы можете добавить до 3 фото в объявление.`);
    }, 500);
});

// ЗАГРУЗКА ОБЪЯВЛЕНИЙ
function loadAds() {
    const adsContainer = document.getElementById('adsContainer');
    adsContainer.innerHTML = '';
    
    if (ads.length === 0) {
        adsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 20px; color: #ccc;"></i>
                <h3>Пока нет объявлений</h3>
                <p>Будьте первым, кто добавит объявление!</p>
            </div>
        `;
        return;
    }
    
    ads.forEach(ad => {
        const adElement = document.createElement('div');
        adElement.className = 'ad-card';
        
        // Создаем карусель для фото
        let photosHTML = '';
        if (ad.photos && ad.photos.length > 0) {
            photosHTML = `
                <div class="ad-photos-carousel" id="carousel-${ad.id}">
                    ${ad.photos.map((photo, index) => `
                        <img src="${photo}" class="carousel-slide ${index === 0 ? 'active' : ''}" 
                             alt="Фото ${index + 1}">
                    `).join('')}
                    
                    ${ad.photos.length > 1 ? `
                        <div class="carousel-dots">
                            ${ad.photos.map((_, index) => `
                                <span class="carousel-dot ${index === 0 ? 'active' : ''}" 
                                      onclick="showCarouselSlide(${ad.id}, ${index})"></span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                ${ad.photos.length > 1 ? `
                    <div class="photo-info">
                        <i class="fas fa-images"></i> ${ad.photos.length} фото (листайте)
                    </div>
                ` : ''}
            `;
        } else {
            photosHTML = `
                <div style="height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                           border-radius: 10px; display: flex; align-items: center; justify-content: center; 
                           color: white; margin-bottom: 10px;">
                    <i class="fas fa-camera-slash" style="font-size: 48px;"></i>
                </div>
            `;
        }
        
        adElement.innerHTML = `
            ${photosHTML}
            <div class="ad-title">
                <i class="fas fa-tag"></i> ${ad.title}
            </div>
            <div class="ad-description">
                <i class="fas fa-align-left"></i> ${ad.description}
            </div>
            <div class="ad-price">
                <i class="fas fa-ruble-sign"></i> ${ad.price} руб.
            </div>
            <div class="ad-seller">
                <i class="fas fa-user"></i> @${ad.username}
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="contactSeller(${ad.userId}, '${ad.username}')" 
                        class="submit-btn" style="flex: 1;">
                    <i class="fas fa-comment"></i> Написать
                </button>
                
                ${ad.userId === user.id ? `
                    <button onclick="deleteAd(${ad.id})" 
                            style="background: #dc3545; flex: 1;" class="submit-btn">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                ` : ''}
            </div>
        `;
        adsContainer.appendChild(adElement);
    });
}

// Показать слайд карусели
function showCarouselSlide(adId, slideIndex) {
    const carousel = document.getElementById(`carousel-${adId}`);
    if (!carousel) return;
    
    // Скрываем все слайды
    const slides = carousel.querySelectorAll('.carousel-slide');
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Показываем выбранный слайд
    if (slides[slideIndex]) {
        slides[slideIndex].classList.add('active');
    }
    
    // Обновляем точки
    const dots = carousel.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
    });
}

// ПОКАЗАТЬ КАТЕГОРИЮ
function showCategory(category) {
    const categoryNames = {
        liquids: 'Жидкости',
        consumables: 'Расходники',
        disposables: 'Одноразовые устройства',
        'pod-systems': 'Под-системы',
        others: 'Другие товары'
    };
    
    openModal(`
        <h2><i class="fas fa-folder"></i> ${categoryNames[category]}</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <p>Все объявления в категории <strong>${categoryNames[category]}</strong>:</p>
            ${ads.filter(ad => ad.category === category).map(ad => `
                <div style="border-bottom: 1px solid #dee2e6; padding: 10px 0;">
                    <strong>${ad.title}</strong><br>
                    <small>${ad.price} руб. • @${ad.username}</small>
                </div>
            `).join('') || '<p>Пока нет объявлений в этой категории.</p>'}
        </div>
        <button onclick="openAddForm('${category}')" class="submit-btn">
            <i class="fas fa-plus"></i> Добавить в эту категорию
        </button>
    `);
}

// ОТКРЫТЬ ФОРМУ ДОБАВЛЕНИЯ С ВОЗМОЖНОСТЬЮ ЗАГРУЗКИ ФОТО
function openAddForm(category = '') {
    // Очищаем предыдущие фото
    selectedPhotos = [];
    
    openModal(`
        <h2><i class="fas fa-plus-circle"></i> Добавить объявление</h2>
        <form id="addForm">
            <div class="form-group">
                <label><i class="fas fa-folder"></i> Категория:</label>
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
                <label><i class="fas fa-heading"></i> Название товара:</label>
                <input type="text" id="title" required placeholder="Например: Жидкость Berry Mix 50мг">
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-align-left"></i> Описание:</label>
                <textarea id="description" required 
                          placeholder="Опишите товар подробно: вкус, крепость, объём, состояние и т.д."
                          rows="4"></textarea>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-ruble-sign"></i> Цена (руб.):</label>
                <input type="number" id="price" required min="1" placeholder="1500">
            </div>
            
            <!-- СЕКЦИЯ ДЛЯ ЗАГРУЗКИ ФОТО -->
            <div class="photo-upload-section">
                <h4><i class="fas fa-camera"></i> Фотографии товара</h4>
                <p>Можно добавить до 3 фотографий. Фото помогут продать товар быстрее!</p>
                
                <div class="photo-preview" id="photoPreview">
                    <!-- Здесь будут отображаться выбранные фото -->
                </div>
                
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button type="button" class="upload-btn" onclick="openPhotoPicker()" 
                            ${selectedPhotos.length >= 3 ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i> Добавить фото
                    </button>
                    
                    <div class="photo-counter ${selectedPhotos.length >= 3 ? 'warning' : ''}" 
                         id="photoCounter">
                        ${selectedPhotos.length}/3 фото
                    </div>
                </div>
                
                ${selectedPhotos.length >= 3 ? `
                    <div style="color: #e74c3c; margin-top: 10px; font-size: 14px;">
                        <i class="fas fa-exclamation-triangle"></i> Максимальное количество фото - 3
                    </div>
                ` : ''}
            </div>
            
            <button type="submit" class="submit-btn">
                <i class="fas fa-paper-plane"></i> Опубликовать объявление
            </button>
        </form>
    `);
    
    // Обновляем превью фото
    updatePhotoPreview();
    
    // Обработка формы
    document.getElementById('addForm').onsubmit = function(e) {
        e.preventDefault();
        addNewAd();
    };
}

// ОТКРЫТЬ ВЫБОР ФОТО ИЗ ГАЛЕРЕИ
function openPhotoPicker() {
    if (selectedPhotos.length >= 3) {
        tg.showAlert("Максимальное количество фото - 3. Удалите одно фото, чтобы добавить новое.");
        return;
    }
    
    // В реальном Telegram Mini App можно использовать tg.showPhotoPicker
    // Но для теста создаем имитацию
    
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.showPhotoPicker) {
        // Реальный Telegram API
        tg.showPhotoPicker({
            limit: 3 - selectedPhotos.length, // Максимум сколько можно выбрать
            callback: function(photos) {
                // photos будет содержать file_id или blob
                console.log("Выбраны фото:", photos);
                // Здесь нужно обработать загрузку фото
                // Временно добавляем заглушки
                addPhotoPlaceholders(3 - selectedPhotos.length);
            }
        });
    } else {
        // Для теста в браузере используем обычный input
        const fileInput = document.getElementById('photoInput');
        fileInput.onchange = function(e) {
            handleSelectedFiles(e.target.files);
        };
        fileInput.click();
    }
}

// ОБРАБОТКА ВЫБРАННЫХ ФАЙЛОВ (для браузера)
function handleSelectedFiles(files) {
    const maxFiles = 3 - selectedPhotos.length;
    const filesToAdd = Math.min(files.length, maxFiles);
    
    for (let i = 0; i < filesToAdd; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedPhotos.push({
                    id: Date.now() + i,
                    url: e.target.result,
                    name: file.name,
                    size: file.size
                });
                updatePhotoPreview();
                
                if (selectedPhotos.length >= 3) {
                    tg.showAlert("Достигнут лимит в 3 фото. Вы можете удалить ненужные фото.");
                }
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Сбрасываем input
    document.getElementById('photoInput').value = '';
}

// ДОБАВИТЬ ЗАГЛУШКИ ДЛЯ ФОТО (для теста)
function addPhotoPlaceholders(count) {
    const placeholderImages = [
        "https://images.unsplash.com/photo-1600008646149-eb8835bd979d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop"
    ];
    
    for (let i = 0; i < count && selectedPhotos.length < 3; i++) {
        selectedPhotos.push({
            id: Date.now() + i,
            url: placeholderImages[selectedPhotos.length % placeholderImages.length],
            name: `photo_${selectedPhotos.length + 1}.jpg`,
            size: 1024 * 1024 // 1MB
        });
    }
    
    updatePhotoPreview();
    
    if (selectedPhotos.length >= 3) {
        tg.showAlert("Достигнут лимит в 3 фото. Вы можете удалить ненужные фото.");
    }
}

// ОБНОВИТЬ ПРЕВЬЮ ФОТО
function updatePhotoPreview() {
    const previewContainer = document.getElementById('photoPreview');
    const counter = document.getElementById('photoCounter');
    
    if (!previewContainer || !counter) return;
    
    // Очищаем контейнер
    previewContainer.innerHTML = '';
    
    // Добавляем выбранные фото
    selectedPhotos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photo.url}" alt="Фото ${index + 1}">
            <button class="remove-photo" onclick="removePhoto(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        previewContainer.appendChild(photoItem);
    });
    
    // Добавляем плейсхолдер для новых фото, если есть место
    if (selectedPhotos.length < 3) {
        const placeholder = document.createElement('div');
        placeholder.className = 'photo-placeholder';
        placeholder.innerHTML = '<i class="fas fa-plus"></i>';
        placeholder.onclick = openPhotoPicker;
        previewContainer.appendChild(placeholder);
    }
    
    // Обновляем счетчик
    counter.textContent = `${selectedPhotos.length}/3 фото`;
    counter.className = `photo-counter ${selectedPhotos.length >= 3 ? 'warning' : ''}`;
}

// УДАЛИТЬ ФОТО
function removePhoto(index) {
    selectedPhotos.splice(index, 1);
    updatePhotoPreview();
}

// ДОБАВИТЬ НОВОЕ ОБЪЯВЛЕНИЕ
function addNewAd() {
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = parseInt(document.getElementById('price').value);
    
    if (!category || !title || !description || !price) {
        tg.showAlert("Пожалуйста, заполните все обязательные поля!");
        return;
    }
    
    if (price <= 0) {
        tg.showAlert("Цена должна быть больше 0!");
        return;
    }
    
    // Получаем URL фото (если нет фото, используем заглушку)
    const photos = selectedPhotos.length > 0 
        ? selectedPhotos.map(photo => photo.url)
        : [`https://via.placeholder.com/400x300/667eea/fff?text=${encodeURIComponent(title.substring(0, 20))}`];
    
    const newAd = {
        id: Date.now(),
        userId: user.id,
        username: user.username,
        category: category,
        title: title,
        description: description,
        price: price,
        photos: photos,
        date: new Date().toISOString().split('T')[0]
    };
    
    // Добавляем в начало списка
    ads.unshift(newAd);
    
    // Закрываем модальное окно
    closeModal();
    
    // Обновляем список объявлений
    loadAds();
    
    // Показываем уведомление
    tg.showAlert(`✅ Объявление "${title}" успешно добавлено!`);
    
    // Очищаем выбранные фото
    selectedPhotos = [];
}

// УДАЛИТЬ ОБЪЯВЛЕНИЕ
function deleteAd(adId) {
    if (confirm('Удалить это объявление?')) {
        ads = ads.filter(ad => ad.id !== adId);
        loadAds();
        tg.showAlert("Объявление удалено!");
    }
}

// СВЯЗАТЬСЯ С ПРОДАВЦОМ
function contactSeller(sellerId, sellerUsername) {
    openModal(`
        <h2><i class="fas fa-comment"></i> Связаться с продавцом</h2>
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; color: #667eea; margin: 20px 0;">
                <i class="fas fa-paper-plane"></i>
            </div>
            <p>Чтобы написать продавцу <strong>@${sellerUsername}</strong>, нажмите кнопку ниже:</p>
            
            <button onclick="sendTelegramMessage(${sellerId}, '${sellerUsername}')" 
                    class="submit-btn" style="margin: 20px 0;">
                <i class="fab fa-telegram"></i> Написать в Telegram
            </button>
            
            <p style="font-size: 14px; color: #666;">
                Вы будете перенаправлены в Telegram для отправки сообщения
            </p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <p><strong>Совет:</strong> Укажите в сообщении:</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Название товара, который вас интересует</li>
                    <li>Ваши вопросы о товаре</li>
                    <li>Предложение о встрече/доставке</li>
                </ul>
            </div>
        </div>
    `);
}

// ОТПРАВИТЬ СООБЩЕНИЕ В TELEGRAM
function sendTelegramMessage(userId, username) {
    // В реальном Telegram Mini App:
    // tg.openTelegramLink(`tg://user?id=${userId}`);
    
    // Для теста в браузере:
    alert(`📨 Открывается чат с пользователем: @${username}\n\nВ реальном Telegram приложении вы перейдёте в диалог с продавцом.`);
    
    // Создаем текст сообщения
    const messageText = `Здравствуйте! Я заинтересован(а) в вашем товаре на VAPE Market.`;
    const encodedMessage = encodeURIComponent(messageText);
    
    // Пытаемся открыть ссылку Telegram (работает в реальном приложении)
    try {
        window.open(`https://t.me/${username}?text=${encodedMessage}`, '_blank');
    } catch (e) {
        console.log("Не удалось открыть Telegram:", e);
    }
    
    closeModal();
}

// ОТКРЫТЬ ПРОФИЛЬ
function openProfile() {
    const myAdsCount = ads.filter(ad => ad.userId === user.id).length;
    
    openModal(`
        <h2><i class="fas fa-user-circle"></i> Мой профиль</h2>
        <div style="text-align: center; padding: 20px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); 
                       border-radius: 50%; display: inline-flex; align-items: center; 
                       justify-content: center; color: white; font-size: 32px; margin-bottom: 15px;">
                ${user.username.charAt(0).toUpperCase()}
            </div>
            
            <h3>@${user.username}</h3>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: left;">
                <p><i class="fas fa-id-card"></i> <strong>ID:</strong> ${user.id}</p>
                <p><i class="fas fa-crown"></i> <strong>Статус:</strong> ${user.isAdmin ? '👑 Администратор' : '👤 Пользователь'}</p>
                <p><i class="fas fa-box-open"></i> <strong>Мои объявления:</strong> ${myAdsCount}</p>
                <p><i class="fas fa-calendar"></i> <strong>На платформе с:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button onclick="showMyAds()" class="submit-btn">
                    <i class="fas fa-clipboard-list"></i> Мои объявления (${myAdsCount})
                </button>
                
                <button onclick="openAddForm()" class="submit-btn" style="background: #28a745;">
                    <i class="fas fa-plus"></i> Добавить новое объявление
                </button>
                
                ${user.isAdmin ? `
                    <button onclick="showAdminPanel()" class="submit-btn" style="background: #dc3545;">
                        <i class="fas fa-user-shield"></i> Админ панель
                    </button>
                ` : ''}
                
                <button onclick="tg.close()" class="submit-btn" style="background: #6c757d;">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </button>
            </div>
        </div>
    `);
}

// ПОКАЗАТЬ МОИ ОБЪЯВЛЕНИЯ
function showMyAds() {
    const myAds = ads.filter(ad => ad.userId === user.id);
    
    if (myAds.length === 0) {
        openModal(`
            <h2><i class="fas fa-clipboard-list"></i> Мои объявления</h2>
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 64px; color: #ccc; margin-bottom: 20px;">
                    <i class="fas fa-box-open"></i>
                </div>
                <h3>У вас пока нет объявлений</h3>
                <p>Начните продавать свои товары прямо сейчас!</p>
                <button onclick="openAddForm()" class="submit-btn" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Добавить первое объявление
                </button>
            </div>
        `);
        return;
    }
    
    let adsHTML = `
        <h2><i class="fas fa-clipboard-list"></i> Мои объявления (${myAds.length})</h2>
        <div style="max-height: 400px; overflow-y: auto;">
    `;
    
    myAds.forEach(ad => {
        const photoCount = ad.photos ? ad.photos.length : 0;
        adsHTML += `
            <div class="ad-card

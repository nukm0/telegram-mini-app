// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И НАСТРОЙКИ ==========
// Текущий пользователь (временные данные)
let currentUser = {
    id: Math.floor(Math.random() * 1000000),
    username: 'user_' + Math.floor(Math.random() * 1000),
    isAdmin: false
};

// Выбранные фотографии для нового объявления (макс. 3)
let selectedPhotos = [];
// Текущая категория для фильтрации
let currentCategory = 'all';

// ========== ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ ==========

// 1. ЗАГРУЗКА ПРИЛОЖЕНИЯ ПРИ ЗАПУСКЕ
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 VAPE Market загружается...');
    
    // Устанавливаем имя пользователя
    document.getElementById('userName').textContent = '@' + currentUser.username;
    
    // Загружаем объявления из базы данных
    await loadAds();
    
    // Проверяем, админ ли пользователь (по ID)
    checkAdminStatus();
    
    console.log('✅ Приложение готово!');
});

// 2. ПРОВЕРКА АДМИНСКИХ ПРАВ
function checkAdminStatus() {
    // Здесь можно добавить проверку по ID пользователя
    // Например: если ID пользователя в списке админов
    const adminIds = [123456, 789012];
    currentUser.isAdmin = adminIds.includes(currentUser.id);
    
    if (currentUser.isAdmin) {
        console.log('👑 Пользователь является администратором');
        // Можно показать админские кнопки
    }
}

// 3. ЗАГРУЗКА ОБЪЯВЛЕНИЙ ИЗ БАЗЫ ДАННЫХ SUPABASE
async function loadAds(category = 'all') {
    const container = document.getElementById('adsContainer');
    if (!container) return;
    
    // Показываем индикатор загрузки
    container.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Загружаем объявления из базы...</p>
        </div>
    `;
    
    try {
        // Создаем базовый запрос к таблице ads
        let query = window.supabaseClient
            .from('ads')
            .select('*')
            .order('created_at', { ascending: false });
        
        // Если выбрана конкретная категория, фильтруем
        if (category !== 'all') {
            query = query.eq('category', category);
        }
        
        // Выполняем запрос к Supabase
        const { data: ads, error } = await query;
        
        if (error) {
            throw new Error('Ошибка загрузки: ' + error.message);
        }
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Если объявлений нет
        if (!ads || ads.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 20px;"></i>
                    <h3>Объявлений пока нет</h3>
                    <p>Будьте первым, кто добавит объявление!</p>
                    <button class="submit-btn" onclick="openAddForm()" style="margin-top: 20px;">
                        <i class="fas fa-plus"></i> Добавить первое объявление
                    </button>
                </div>
            `;
            return;
        }
        
        // Отображаем каждое объявление
        ads.forEach(ad => {
            createAdCard(ad, container);
        });
        
        console.log(`✅ Загружено ${ads.length} объявлений`);
        
    } catch (error) {
        console.error('❌ Ошибка при загрузке объявлений:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить объявления. Проверьте подключение.</p>
                <button class="submit-btn" onclick="loadAds()" style="margin-top: 20px;">
                    <i class="fas fa-sync-alt"></i> Попробовать снова
                </button>
            </div>
        `;
    }
}

// 4. СОЗДАНИЕ КАРТОЧКИ ОБЪЯВЛЕНИЯ
function createAdCard(ad, container) {
    const adElement = document.createElement('div');
    adElement.className = 'ad-card';
    
    // Создаем HTML для фотографий (карусель, если несколько)
    let photosHTML = '';
    if (ad.photos && ad.photos.length > 0) {
        photosHTML = createPhotoCarousel(ad);
    } else {
        photosHTML = `
            <div style="height: 150px; background: linear-gradient(135deg, #667eea, #764ba2); 
                      border-radius: 10px; display: flex; align-items: center; 
                      justify-content: center; color: white; margin-bottom: 10px;">
                <i class="fas fa-camera-slash" style="font-size: 48px;"></i>
            </div>
        `;
    }
    
    // Определяем, является ли это объявление текущего пользователя
    const isMyAd = ad.user_id === currentUser.id;
    
    // Создаем HTML карточки
    adElement.innerHTML = `
        ${photosHTML}
        
        <div class="ad-title">
            <i class="fas fa-tag"></i> ${ad.title}
        </div>
        
        <div class="ad-description">
            <i class="fas fa-align-left"></i> ${ad.description}
        </div>
        
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span class="ad-price">
                <i class="fas fa-ruble-sign"></i> ${ad.price} руб.
            </span>
            <span style="background: #f8f9fa; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                ${getCategoryName(ad.category)}
            </span>
        </div>
        
        <div class="ad-seller">
            <i class="fas fa-user"></i> @${ad.username}
            <span style="float: right; color: #888; font-size: 12px;">
                ${formatDate(ad.created_at)}
            </span>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button onclick="contactSeller(${ad.user_id}, '${ad.username}', '${ad.title}')" 
                    class="submit-btn" style="flex: 2;">
                <i class="fas fa-comment"></i> Написать
            </button>
            
            ${isMyAd ? `
                <button onclick="deleteAd(${ad.id})" 
                        style="background: #dc3545; flex: 1;" class="submit-btn">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    container.appendChild(adElement);
}

// 5. СОЗДАНИЕ КАРУСЕЛИ ФОТОГРАФИЙ
function createPhotoCarousel(ad) {
    const carouselId = `carousel-${ad.id}`;
    let dotsHTML = '';
    
    if (ad.photos.length > 1) {
        dotsHTML = `
            <div class="carousel-dots">
                ${ad.photos.map((_, index) => `
                    <span class="carousel-dot ${index === 0 ? 'active' : ''}" 
                          onclick="showCarouselSlide('${carouselId}', ${index})"></span>
                `).join('')}
            </div>
        `;
    }
    
    return `
        <div class="ad-photos-carousel" id="${carouselId}">
            ${ad.photos.map((photo, index) => `
                <img src="${photo}" class="carousel-slide ${index === 0 ? 'active' : ''}" 
                     alt="Фото ${index + 1} товара ${ad.title}">
            `).join('')}
            ${dotsHTML}
        </div>
    `;
}

// 6. ПОКАЗАТЬ КАТЕГОРИЮ ТОВАРОВ
function showCategory(category) {
    currentCategory = category;
    const categoryNames = {
        liquids: 'Жидкости',
        consumables: 'Расходники',
        disposables: 'Одноразовые устройства',
        'pod-systems': 'Под-системы',
        others: 'Другие товары',
        all: 'Все товары'
    };
    
    openModal(`
        <h2><i class="fas fa-folder"></i> ${categoryNames[category]}</h2>
        <p>Все объявления в категории <strong>${categoryNames[category]}</strong>:</p>
        <button onclick="loadAds('${category}')" class="submit-btn" style="margin: 15px 0;">
            <i class="fas fa-sync-alt"></i> Показать только эту категорию
        </button>
        <button onclick="openAddForm('${category}')" class="submit-btn" style="background: #28a745;">
            <i class="fas fa-plus"></i> Добавить в "${categoryNames[category]}"
        </button>
    `);
}

// 7. ОТКРЫТЬ ФОРМУ ДОБАВЛЕНИЯ ОБЪЯВЛЕНИЯ
function openAddForm(category = '') {
    // Сбрасываем выбранные фото
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
                <textarea id="description" required rows="4" placeholder="Опишите товар подробно..."></textarea>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-ruble-sign"></i> Цена (руб.):</label>
                <input type="number" id="price" required min="1" placeholder="1500">
            </div>
            
            <!-- Секция загрузки фото -->
            <div class="photo-section">
                <h4><i class="fas fa-camera"></i> Фотографии товара (макс. 3)</h4>
                <p>Фото помогут продать товар быстрее!</p>
                
                <div class="photo-preview" id="photoPreview">
                    <!-- Сюда будут добавляться превью фото -->
                </div>
                
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
                    <button type="button" class="upload-btn" onclick="addPhoto()" id="addPhotoBtn">
                        <i class="fas fa-plus"></i> Добавить фото
                    </button>
                    
                    <div class="photo-counter" id="photoCounter">
                        0/3 фото
                    </div>
                </div>
            </div>
            
            <button type="submit" class="submit-btn">
                <i class="fas fa-paper-plane"></i> Опубликовать для всех пользователей
            </button>
        </form>
    `);
    
    // Обновляем превью фото
    updatePhotoPreview();
    
    // Назначаем обработчик формы
    document.getElementById('addForm').onsubmit = async function(e) {
        e.preventDefault();
        await addNewAd();
    };
}

// 8. ДОБАВИТЬ ФОТОГРАФИЮ (имитация)
function addPhoto() {
    if (selectedPhotos.length >= 3) {
        alert('Максимальное количество фото - 3. Удалите одно фото, чтобы добавить новое.');
        return;
    }
    
    // В реальном приложении здесь будет tg.showPhotoPicker()
    // Для теста используем заглушку
    
    const photoNumber = selectedPhotos.length + 1;
    const newPhoto = {
        id: Date.now() + photoNumber,
        url: `https://via.placeholder.com/400x300/667eea/fff?text=Фото+${photoNumber}`,
        name: `photo_${photoNumber}.jpg`
    };
    
    selectedPhotos.push(newPhoto);
    updatePhotoPreview();
    
    // Отключаем кнопку, если достигли лимита
    if (selectedPhotos.length >= 3) {
        document.getElementById('addPhotoBtn').disabled = true;
    }
}

// 9. ОБНОВИТЬ ПРЕВЬЮ ФОТОГРАФИЙ
function updatePhotoPreview() {
    const preview = document.getElementById('photoPreview');
    const counter = document.getElementById('photoCounter');
    
    if (!preview || !counter) return;
    
    // Очищаем контейнер
    preview.innerHTML = '';
    
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
        preview.appendChild(photoItem);
    });
    
    // Добавляем плейсхолдер для новых фото, если есть место
    if (selectedPhotos.length < 3) {
        const placeholder = document.createElement('div');
        placeholder.className = 'photo-item';
        placeholder.style.border = '2px dashed #ccc';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.cursor = 'pointer';
        placeholder.innerHTML = '<i class="fas fa-plus" style="font-size: 24px; color: #999;"></i>';
        placeholder.onclick = addPhoto;
        preview.appendChild(placeholder);
    }
    
    // Обновляем счетчик
    counter.textContent = `${selectedPhotos.length}/3 фото`;
    counter.className = `photo-counter ${selectedPhotos.length >= 3 ? 'warning' : ''}`;
}

// 10. УДАЛИТЬ ФОТОГРАФИЮ
function removePhoto(index) {
    selectedPhotos.splice(index, 1);
    updatePhotoPreview();
    
    // Включаем кнопку добавления фото, если стало меньше 3
    const addBtn = document.getElementById('addPhotoBtn');
    if (addBtn && selectedPhotos.length < 3) {
        addBtn.disabled = false;
    }
}

// 11. ДОБАВИТЬ НОВОЕ ОБЪЯВЛЕНИЕ В БАЗУ ДАННЫХ
async function addNewAd() {
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    
    // Проверяем заполненность полей
    if (!category || !title || !description || !price) {
        alert('Пожалуйста, заполните все обязательные поля!');
        return;
    }
    
    if (parseInt(price) <= 0) {
        alert('Цена должна быть больше 0 рублей!');
        return;
    }
    
    // Подготавливаем фотографии
    const photos = selectedPhotos.length > 0 
        ? selectedPhotos.map(photo => photo.url)
        : [`https://via.placeholder.com/400x300/667eea/fff?text=${encodeURIComponent(title.substring(0, 20))}`];
    
    try {
        // Отправляем данные в Supabase
        const { data, error } = await window.supabaseClient
            .from('ads')
            .insert([
                {
                    user_id: currentUser.id,
                    username: currentUser.username,
                    category: category,
                    title: title,
                    description: description,
                    price: parseInt(price),
                    photos: photos,
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) {
            throw new Error('Ошибка при добавлении в базу: ' + error.message);
        }
        
        // Закрываем модальное окно
        closeModal();
        
        // Перезагружаем объявления
        await loadAds(currentCategory);
        
        // Показываем уведомление об успехе
        alert(`✅ Объявление "${title}" успешно добавлено!\n\nТеперь его видят ВСЕ пользователи приложения.`);
        
        // Сбрасываем выбранные фото
        selectedPhotos = [];
        
    } catch (error) {
        console.error('❌ Ошибка при добавлении объявления:', error);
        alert('❌ Не удалось добавить объявление. Проверьте подключение к интернету и настройки базы данных.');
    }
}

// 12. УДАЛИТЬ ОБЪЯВЛЕНИЕ ИЗ БАЗЫ ДАННЫХ
async function deleteAd(adId) {
    if (!confirm('Вы уверены, что хотите удалить это объявление?\n\nЭто действие нельзя будет отменить.')) {
        return;
    }
    
    try {
        const { error } = await window.supabaseClient
            .from('ads')
            .delete()
            .eq('id', adId);
        
        if (error) {
            throw new Error('Ошибка при удалении: ' + error.message);
        }
        
        // Перезагружаем объявления
        await loadAds(currentCategory);
        
        // Показываем уведомление
        alert('✅ Объявление успешно удалено!');
        
    } catch (error) {
        console.error('❌ Ошибка при удалении объявления:', error);
        alert('❌ Не удалось удалить объявление. Попробуйте позже.');
    }
}

// 13. СВЯЗАТЬСЯ С ПРОДАВЦОМ
function contactSeller(sellerId, sellerUsername, adTitle) {
    openModal(`
        <h2><i class="fas fa-comment"></i> Связаться с продавцом</h2>
        
        <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 48px; color: #667eea;">
                <i class="fas fa-paper-plane"></i>
            </div>
            <h3>${adTitle}</h3>
        </div>
        
        <p>Вы хотите написать продавцу <strong>@${sellerUsername}</strong> по поводу этого товара.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Совет:</strong> В сообщении укажите:</p>
            <ul style="text-align: left; margin: 10px 0;">
                <li>Название товара, который вас интересует</li>
                <li>Ваши вопросы о товаре</li>
                <li>Предложение о встрече или доставке</li>
            </ul>
        </div>
        
        <button onclick="sendTelegramMessage(${sellerId}, '${sellerUsername}', '${adTitle}')" 
                class="submit-btn" style="margin-bottom: 15px;">
            <i class="fab fa-telegram"></i> Написать в Telegram
        </button>
        
        <p style="font-size: 14px; color: #666;">
            Вы будете перенаправлены в Telegram для отправки сообщения
        </p>
    `);
}

// 14. ОТПРАВИТЬ СООБЩЕНИЕ В TELEGRAM
function sendTelegramMessage(userId, username, adTitle) {
    // В реальном приложении используем Telegram API
    // tg.openTelegramLink(`tg://user?id=${userId}`);
    
    // Создаем текст сообщения
    const messageText = `Здравствуйте! Я заинтересован(а) в вашем товаре "${adTitle}" на VAPE Market.`;
    const encodedMessage = encodeURIComponent(messageText);
    
    // Пытаемся открыть Telegram (работает в реальном приложении)
    try {
        // Для теста в браузере
        window.open(`https://t.me/${username}?text=${encodedMessage}`, '_blank');
        console.log(`📨 Отправка сообщения пользователю @${username}`);
    } catch (e) {
        console.log("Не удалось открыть Telegram:", e);
    }
    
    closeModal();
    
    // Информационное сообщение для пользователя
    alert(`📨 Открывается чат с продавцом @${username}\n\nВ реальном Telegram Mini App вы сразу перейдете в диалог.`);
}

// 15. ОТКРЫТЬ ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
function openProfile() {
    openModal(`
        <h2><i class="fas fa-user-circle"></i> Мой профиль</h2>
        
        <div style="text-align: center; margin: 20px 0;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); 
                      border-radius: 50%; display: inline-flex; align-items: center; 
                      justify-content: center; color: white; font-size: 32px;">
                ${currentUser.username.charAt(0).toUpperCase()}
            </div>
            <h3>@${currentUser.username}</h3>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><i class="fas fa-id-card"></i> <strong>ID:</strong> ${currentUser.id}</p>
            <p><i class="fas fa-calendar"></i> <strong>На платформе с:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
            <p><i class="fas fa-crown"></i> <strong>Статус:</strong> ${currentUser.isAdmin ? '👑 Администратор' : '👤 Пользователь'}</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="showMyAds()" class="submit-btn">
                <i class="fas fa-clipboard-list"></i> Мои объявления
            </button>
            
            <button onclick="openAddForm()" class="submit-btn" style="background: #28a745;">
                <i class="fas fa-plus"></i> Добавить новое объявление
            </button>
            
            ${currentUser.isAdmin ? `
                <button onclick="showAdminPanel()" class="submit-btn" style="background: #dc3545;">
                    <i class="fas fa-user-shield"></i> Админ панель
                </button>
            ` : ''}
            
            <button onclick="window.location.reload()" class="submit-btn" style="background: #6c757d;">
                <i class="fas fa-sync-alt"></i> Обновить страницу
            </button>
        </div>
    `);
}

// 16. ПОКАЗАТЬ МОИ ОБЪЯВЛЕНИЯ
async function showMyAds() {
    try {
        // Загружаем только объявления текущего пользователя
        const { data: myAds, error } = await window.supabaseClient
            .from('ads')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        let html = '<h2><i class="fas fa-clipboard-list"></i> Мои объявления</h2>';
        
        if (!myAds || myAds.length === 0) {
            html += `
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 48px; color: #ccc; margin-bottom: 15px;">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <h3>У вас пока нет объявлений</h3>
                    <p>Начните продавать свои товары прямо сейчас!</p>
                    <button onclick="openAddForm()" class="submit-btn" style="margin-top: 20px;">
                        <i class="fas fa-plus"></i> Добавить первое объявление
                    </button>
                </div>
            `;
        } else {
            html += `<p style="color: #666; margin-bottom: 15px;">У вас ${myAds.length} объявлений:</p>`;
            
            myAds.forEach(ad => {
                html += `
                    <div style="border: 1px solid #e9ecef; border-radius: 10px; padding: 15px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between;">
                            <strong>${ad.title}</strong>
                            <span style="color: #28a745; font-weight: bold;">${ad.price} руб.</span>
                        </div>
                        <div style="color: #666; font-size: 14px; margin: 5px 0;">${ad.description.substring(0, 60)}...</div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button onclick="deleteAd(${ad.id})" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-size: 14px;">
                                <i class="fas fa-trash"></i> Удалить
                            </button>
                            <button onclick="editAd(${ad.id})" style="background: #17a2b8; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-size: 14px;">
                                <i class="fas fa-edit"></i> Редактировать
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `<button onclick="openAddForm()" class="submit-btn" style="margin-top: 20px;">
            <i class="fas fa-plus"></i> Добавить новое объявление
        </button>`;
        
        openModal(html);
        
    } catch (error) {
        console.error('Ошибка при загрузке моих объявлений:', error);
        openModal(`
            <div style="text-align: center; padding: 30px; color: #dc3545;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить ваши объявления.</p>
            </div>
        `);
    }
}

// 17. РЕДАКТИРОВАТЬ ОБЪЯВЛЕНИЕ (заглушка)
function editAd(adId) {
    openModal(`
        <h2><i class="fas fa-edit"></i> Редактирование</h2>
        <p>Функция редактирования объявлений пока в разработке.</p>
        <p>Вы можете удалить это объявление и создать новое.</p>
        <button onclick="closeModal()" class="submit-btn" style="margin-top: 20px;">
            Понятно
        </button>
    `);
}

// 18. ПОКАЗАТЬ АДМИН ПАНЕЛЬ
function showAdminPanel() {
    if (!currentUser.isAdmin) return;
    
    openModal(`
        <h2><i class="fas fa-user-shield"></i> Админ панель</h2>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <h3><i class="fas fa-chart-bar"></i> Статистика</h3>
            <p>Функция статистики в разработке...</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <h3><i class="fas fa-cogs"></i> Управление</h3>
            <p>Здесь будут функции управления пользователями и объявлениями.</p>
        </div>
        
        <button onclick="closeModal()" class="submit-btn">
            Закрыть
        </button>
    `);
}

// 19. НАВИГАЦИОННЫЕ ФУНКЦИИ
function showHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadAds();
}

function showChats() {
    openModal(`
        <h2><i class="fas fa-comments"></i> Сообщения</h2>
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 48px; color: #ccc; margin-bottom: 15px;">
                <i class="fas fa-inbox"></i>
            </div>
            <h3>В разработке</h3>
            <p>Система личных сообщений скоро будет доступна.</p>
        </div>
    `);
}

// 20. УПРАВЛЕНИЕ КАРУСЕЛЬЮ ФОТО
function showCarouselSlide(carouselId, slideIndex) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    // Скрываем все слайды
    const slides = carousel.querySelectorAll('.carousel-slide');
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Показываем выбранный слайд
    if (slides[slideIndex]) {
        slides[slideIndex].classList.add('active');
    }
    
    // Обновляем точки навигации
    const dots = carousel.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
    });
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

// 21. ПОЛУЧИТЬ НАЗВАНИЕ КАТЕГОРИИ
function getCategoryName(category) {
    const names = {
        liquids: 'Жидкости',
        consumables: 'Расходники',
        disposables: 'Одноразовые',
        'pod-systems': 'Под-системы',
        others: 'Другое'
    };
    return names[category] || category;
}

// 22. ФОРМАТИРОВАТЬ ДАТУ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// 23. ОТКРЫТЬ МОДАЛЬНОЕ ОКНО
function openModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    if (modal && modalBody) {
        modalBody.innerHTML = content;
        modal.style.display = 'block';
        // Прокручиваем вверх модального окна
        modalBody.scrollTop = 0;
    } else {
        console.error('Модальное окно не найдено!');
    }
}

// 24. ЗАКРЫТЬ МОДАЛЬНОЕ ОКНО
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 25. ЗАКРЫТЬ МОДАЛЬНОЕ ОКНО ПРИ КЛИКЕ ВНЕ ЕГО
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

// ========== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ==========
console.log('✅ app.js загружен успешно!');

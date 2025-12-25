// ========== БАЗОВЫЕ ПЕРЕМЕННЫЕ ==========
let ads = []; // Здесь будут все объявления
let user = { id: 1, username: 'test_user' }; // Тестовый пользователь

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// 1. Загружаем приложение
document.addEventListener('DOMContentLoaded', function() {
    console.log('Приложение загружено!');
    document.getElementById('userName').textContent = user.username;
    loadAds();
});

// 2. Загружаем объявления на страницу
function loadAds() {
    const container = document.getElementById('adsContainer');
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Если объявлений нет, покажем сообщение
    if (ads.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Объявлений пока нет. Будьте первым!</p>';
        return;
    }
    
    // Для каждого объявления создаём карточку
    ads.forEach(ad => {
        const adElement = document.createElement('div');
        adElement.className = 'ad-card';
        adElement.innerHTML = `
            <div class="ad-title">${ad.title}</div>
            <div style="color:#666; margin:5px 0;">${ad.description}</div>
            <div class="ad-price">${ad.price} руб.</div>
            <div style="color:#888; font-size:14px;">Продавец: @${ad.username}</div>
            <button class="submit-btn" onclick="contactSeller('${ad.username}')" style="margin-top:10px;">
                💬 Написать продавцу
            </button>
        `;
        container.appendChild(adElement);
    });
}

// 3. Показать категорию
function showCategory(cat) {
    const names = { liquids: 'Жидкости', consumables: 'Расходники', disposables: 'Одноразовые' };
    openModal(`<h2>Категория: ${names[cat]}</h2><p>Вы выбрали категорию <strong>${names[cat]}</strong>.</p>`);
}

// 4. Открыть форму добавления
function openAddForm() {
    openModal(`
        <h2>📤 Добавить объявление</h2>
        <form id="addForm">
            <div class="form-group">
                <input type="text" placeholder="Название товара" id="adTitle" required>
            </div>
            <div class="form-group">
                <textarea placeholder="Описание" id="adDesc" required></textarea>
            </div>
            <div class="form-group">
                <input type="number" placeholder="Цена в рублях" id="adPrice" required>
            </div>
            <button type="submit" class="submit-btn">Опубликовать</button>
        </form>
    `);
    
    // Вешаем обработчик на форму
    document.getElementById('addForm').onsubmit = function(e) {
        e.preventDefault(); // Отменяем перезагрузку страницы
        addNewAd();
    };
}

// 5. Добавить новое объявление
function addNewAd() {
    const title = document.getElementById('adTitle').value;
    const desc = document.getElementById('adDesc').value;
    const price = document.getElementById('adPrice').value;
    
    if (!title || !desc || !price) {
        alert('Заполните все поля!');
        return;
    }
    
    // Создаём объект объявления
    const newAd = {
        id: Date.now(),
        userId: user.id,
        username: user.username,
        title: title,
        description: desc,
        price: price,
        date: new Date().toLocaleDateString()
    };
    
    // Добавляем в массив и обновляем список
    ads.unshift(newAd);
    closeModal();
    loadAds();
    alert('✅ Объявление добавлено!');
}

// 6. Профиль
function openProfile() {
    openModal(`
        <h2>👤 Профиль</h2>
        <p><strong>Имя:</strong> @${user.username}</p>
        <p><strong>ID:</strong> ${user.id}</p>
        <button class="submit-btn" onclick="showMyAds()">📋 Мои объявления</button>
    `);
}

// 7. Мои объявления
function showMyAds() {
    const myAds = ads.filter(ad => ad.userId === user.id);
    let html = '<h2>📋 Мои объявления</h2>';
    
    if (myAds.length === 0) {
        html += '<p>У вас пока нет объявлений.</p>';
    } else {
        myAds.forEach(ad => {
            html += `<div style="border-bottom:1px solid #eee; padding:10px 0;">
                <strong>${ad.title}</strong> - ${ad.price} руб.
            </div>`;
        });
    }
    
    html += `<button class="submit-btn" onclick="openAddForm()" style="margin-top:15px;">+ Добавить новое</button>`;
    openModal(html);
}

// 8. Написать продавцу
function contactSeller(username) {
    openModal(`
        <h2>💬 Написать продавцу</h2>
        <p>Вы хотите написать пользователю <strong>@${username}</strong>.</p>
        <p>В реальном приложении здесь открывался бы чат Telegram.</p>
        <button class="submit-btn" onclick="closeModal()">Понятно</button>
    `);
}

// 9. Навигация
function showHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

// Открыть модальное окно
function openModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

// Закрыть модальное окно
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Закрыть окно при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

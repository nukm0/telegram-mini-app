// Отображение профиля
function renderProfile() {
    const profilePage = document.getElementById('profilePage');
    
    // Статистика пользователя
    const userAdsCount = window.userAds.length;
    const userLikes = window.userRating.likes;
    const userDislikes = window.userRating.dislikes;
    
    let html = `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="profile-info">
                    <h2>${window.user.first_name}</h2>
                    <p>@${window.user.username || 'user'}</p>
                </div>
            </div>
            
            <div class="profile-stats">
                <div class="profile-stat">
                    <span class="stat-number">${userAdsCount}</span>
                    <span class="stat-label">Объявлений</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-number">${userLikes}</span>
                    <span class="stat-label">Лайков</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-number">${userDislikes}</span>
                    <span class="stat-label">Дизлайков</span>
                </div>
            </div>
        </div>
        
        <div class="profile-tabs">
            <div class="profile-tab active" data-tab="my-ads">Мои объявления</div>
            <div class="profile-tab" data-tab="history">История просмотров</div>
        </div>
        
        <div id="myAdsTab" class="profile-tab-content active">
            <div id="myAdsList"></div>
        </div>
        
        <div id="historyTab" class="profile-tab-content">
            <div id="historyList"></div>
        </div>
    `;
    
    profilePage.innerHTML = html;
    
    // Добавляем обработчики вкладок
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`${tabName}Tab`).classList.add('active');
            
            if (tabName === 'my-ads') {
                renderMyAds();
            } else if (tabName === 'history') {
                renderHistory();
            }
        });
    });
    
    renderMyAds();
    renderHistory();
}

// Отображение моих объявлений
function renderMyAds() {
    const container = document.getElementById('myAdsList');
    const myAds = window.ads.filter(ad => ad.sellerId === window.user.id);
    
    if (myAds.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px;">У вас пока нет объявлений</div>';
        return;
    }
    
    container.innerHTML = myAds.map(ad => `
        <div class="my-ad-item">
            <div class="my-ad-header">
                <div class="my-ad-title">${ad.title}</div>
                <div class="my-ad-price">${ad.price} ₽</div>
            </div>
            <div class="my-ad-description">${ad.description.substring(0, 100)}...</div>
            <div class="my-ad-actions">
                <button class="edit-ad-btn" onclick="editAd(${ad.id})">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button class="delete-ad-btn" onclick="deleteAd(${ad.id})">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `).join('');
}

// Отображение истории просмотров
function renderHistory() {
    const container = document.getElementById('historyList');
    
    if (window.viewHistory.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px;">История просмотров пуста</div>';
        return;
    }
    
    container.innerHTML = window.viewHistory.map(item => `
        <div class="history-item">
            <div class="history-info">
                <h4>${item.title}</h4>
                <p>${new Date(item.date).toLocaleString()}</p>
            </div>
            <button class="remove-history-btn" onclick="removeFromHistory(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Удаление из истории
function removeFromHistory(adId) {
    window.viewHistory = window.viewHistory.filter(item => item.id !== adId);
    localStorage.setItem(`viewHistory_${window.user.id}`, JSON.stringify(window.viewHistory));
    renderHistory();
    showNotification('Запись удалена из истории', 'success');
}

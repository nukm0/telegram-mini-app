// Отображение админ-панели
function renderAdminPanel() {
    const adminPage = document.getElementById('adminPage');
    
    // Статистика
    const totalAds = window.ads.length;
    const totalUsers = new Set(window.ads.map(ad => ad.sellerId)).size;
    const totalComplaints = window.complaints.length;
    const newComplaints = window.complaints.filter(c => c.status === 'new').length;
    
    let html = `
        <div class="admin-page-content">
            <div class="admin-section">
                <div class="admin-section-title">
                    <i class="fas fa-chart-line"></i>
                    Статистика
                </div>
                <div class="admin-stats-grid">
                    <div class="admin-stat-card">
                        <span class="admin-stat-number">${totalAds}</span>
                        <span class="admin-stat-label">Объявлений</span>
                    </div>
                    <div class="admin-stat-card">
                        <span class="admin-stat-number">${totalUsers}</span>
                        <span class="admin-stat-label">Продавцов</span>
                    </div>
                    <div class="admin-stat-card">
                        <span class="admin-stat-number">${totalComplaints}</span>
                        <span class="admin-stat-label">Жалоб всего</span>
                    </div>
                    <div class="admin-stat-card">
                        <span class="admin-stat-number">${newComplaints}</span>
                        <span class="admin-stat-label">Новых жалоб</span>
                    </div>
                </div>
            </div>
            
            <div class="admin-section">
                <div class="admin-section-title">
                    <i class="fas fa-cogs"></i>
                    Управление
                </div>
                <div class="admin-actions-grid">
                    <button class="admin-action-btn" onclick="showAdminSubsection('complaints')">
                        <i class="fas fa-flag"></i>
                        <span>Жалобы (${newComplaints})</span>
                    </button>
                    <button class="admin-action-btn" onclick="showAdminSubsection('banner')">
                        <i class="fas fa-image"></i>
                        <span>Баннер</span>
                    </button>
                    <button class="admin-action-btn" onclick="showAdminSubsection('ads')">
                        <i class="fas fa-list"></i>
                        <span>Все объявления</span>
                    </button>
                    <button class="admin-action-btn" onclick="showAdminSubsection('users')">
                        <i class="fas fa-users"></i>
                        <span>Пользователи</span>
                    </button>
                </div>
            </div>
            
            <div id="adminComplaintsSubsection" class="admin-subsection">
                <button class="admin-back-btn" onclick="hideAdminSubsections()">
                    <i class="fas fa-arrow-left"></i> Назад
                </button>
                <div class="admin-section">
                    <div class="admin-section-title">
                        <i class="fas fa-flag"></i>
                        Жалобы
                    </div>
                    <div id="complaintsList"></div>
                </div>
            </div>
            
            <div id="adminBannerSubsection" class="admin-subsection">
                <button class="admin-back-btn" onclick="hideAdminSubsections()">
                    <i class="fas fa-arrow-left"></i> Назад
                </button>
                <div class="admin-section">
                    <div class="admin-section-title">
                        <i class="fas fa-image"></i>
                        Управление баннером
                    </div>
                    <div class="admin-banner-card">
                        <textarea id="bannerTextArea" class="banner-textarea" placeholder="Текст баннера">${window.bannerText}</textarea>
                        <button class="publish-btn" onclick="saveBanner()">
                            <i class="fas fa-save"></i> Сохранить баннер
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="adminAdsSubsection" class="admin-subsection">
                <button class="admin-back-btn" onclick="hideAdminSubsections()">
                    <i class="fas fa-arrow-left"></i> Назад
                </button>
                <div class="admin-section">
                    <div class="admin-section-title">
                        <i class="fas fa-list"></i>
                        Все объявления
                    </div>
                    <div id="allAdsList"></div>
                </div>
            </div>
            
            <div id="adminUsersSubsection" class="admin-subsection">
                <button class="admin-back-btn" onclick="hideAdminSubsections()">
                    <i class="fas fa-arrow-left"></i> Назад
                </button>
                <div class="admin-section">
                    <div class="admin-section-title">
                        <i class="fas fa-users"></i>
                        Пользователи
                    </div>
                    <div id="usersList"></div>
                </div>
            </div>
        </div>
    `;
    
    adminPage.innerHTML = html;
    renderComplaintsList();
    renderAllAdsList();
    renderUsersList();
}

// Отображение раздела админки
function showAdminSubsection(subsection) {
    hideAdminSubsections();
    document.getElementById(`admin${subsection.charAt(0).toUpperCase() + subsection.slice(1)}Subsection`).classList.add('active');
}

// Скрытие всех разделов
function hideAdminSubsections() {
    document.querySelectorAll('.admin-subsection').forEach(section => {
        section.classList.remove('active');
    });
}

// Отображение списка жалоб
function renderComplaintsList() {
    const container = document.getElementById('complaintsList');
    
    if (window.complaints.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">Нет жалоб</div>';
        return;
    }
    
    container.innerHTML = window.complaints.map(complaint => {
        const ad = window.ads.find(a => a.id === complaint.adId);
        return `
            <div class="admin-list-item">
                <div class="admin-item-info">
                    <h4>Жалоба #${complaint.id}</h4>
                    <p>Объявление: ${ad ? ad.title : 'Не найдено'}</p>
                    <p>Причина: ${complaint.reason}</p>
                    <p>Статус: <span class="status-badge status-${complaint.status}">${complaint.status}</span></p>
                </div>
                <div class="admin-item-actions">
                    <button class="admin-small-btn view" onclick="viewComplaintAd(${complaint.adId})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="admin-small-btn edit" onclick="resolveComplaint(${complaint.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="admin-small-btn delete" onclick="deleteComplaint(${complaint.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Просмотр объявления из жалобы
function viewComplaintAd(adId) {
    const ad = window.ads.find(a => a.id === adId);
    if (ad) {
        switchPage('home');
        setTimeout(() => {
            document.querySelector(`.advertisement-card[data-ad-id="${adId}"]`).scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// Решение жалобы
function resolveComplaint(complaintId) {
    const complaint = window.complaints.find(c => c.id === complaintId);
    if (complaint) {
        complaint.status = 'resolved';
        localStorage.setItem('complaints', JSON.stringify(window.complaints));
        renderComplaintsList();
        showNotification('Жалоба отмечена как решенная', 'success');
    }
}

// Удаление жалобы
function deleteComplaint(complaintId) {
    if (confirm('Удалить жалобу?')) {
        window.complaints = window.complaints.filter(c => c.id !== complaintId);
        localStorage.setItem('complaints', JSON.stringify(window.complaints));
        renderComplaintsList();
        showNotification('Жалоба удалена', 'success');
    }
}

// Отображение всех объявлений
function renderAllAdsList() {
    const container = document.getElementById('allAdsList');
    
    if (window.ads.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">Нет объявлений</div>';
        return;
    }
    
    container.innerHTML = window.ads.map(ad => `
        <div class="admin-list-item">
            <div class="admin-item-info">
                <h4>${ad.title}</h4>
                <p>${ad.price} ₽ | ${getCategoryName(ad.category)}</p>
                <p>Продавец: ${ad.sellerName}</p>
            </div>
            <div class="admin-item-actions">
                <button class="admin-small-btn view" onclick="viewAdDetails(${ad.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="admin-small-btn delete" onclick="adminDeleteAd(${ad.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Просмотр деталей объявления
function viewAdDetails(adId) {
    switchPage('home');
    setTimeout(() => {
        document.querySelector(`.advertisement-card[data-ad-id="${adId}"]`).scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Удаление объявления админом
function adminDeleteAd(adId) {
    if (confirm('Удалить это объявление?')) {
        window.ads = window.ads.filter(ad => ad.id !== adId);
        saveAds();
        renderAllAdsList();
        if (document.getElementById('homePage').classList.contains('active')) {
            renderAds();
        }
        showNotification('Объявление удалено', 'success');
    }
}

// Отображение списка пользователей
function renderUsersList() {
    const container = document.getElementById('usersList');
    const users = new Map();
    
    window.ads.forEach(ad => {
        if (!users.has(ad.sellerId)) {
            users.set(ad.sellerId, {
                id: ad.sellerId,
                name: ad.sellerName,
                username: ad.sellerUsername,
                adsCount: 0,
                totalLikes: 0,
                totalDislikes: 0
            });
        }
        const user = users.get(ad.sellerId);
        user.adsCount++;
        user.totalLikes += ad.likes || 0;
        user.totalDislikes += ad.dislikes || 0;
    });
    
    if (users.size === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">Нет пользователей</div>';
        return;
    }
    
    container.innerHTML = Array.from(users.values()).map(user => `
        <div class="admin-list-item">
            <div class="admin-item-info">
                <h4>${user.name}</h4>
                <p>@${user.username}</p>
                <p>Объявлений: ${user.adsCount} | Лайков: ${user.totalLikes} | Дизлайков: ${user.totalDislikes}</p>
            </div>
            <div class="admin-item-actions">
                <button class="admin-small-btn view" onclick="viewUserAds(${user.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Просмотр объявлений пользователя
function viewUserAds(userId) {
    switchPage('home');
    setTimeout(() => {
        const userAds = window.ads.filter(ad => ad.sellerId === userId);
        if (userAds.length > 0) {
            userAds.forEach(ad => {
                const element = document.querySelector(`.advertisement-card[data-ad-id="${ad.id}"]`);
                if (element) {
                    element.style.border = '2px solid #F59E0B';
                    setTimeout(() => {
                        element.style.border = '';
                    }, 3000);
                }
            });
            document.querySelector(`.advertisement-card[data-ad-id="${userAds[0].id}"]`).scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// Сохранение баннера
function saveBanner() {
    const bannerText = document.getElementById('bannerTextArea').value;
    window.bannerText = bannerText;
    localStorage.setItem('bannerText', bannerText);
    showNotification('Баннер сохранен', 'success');
}

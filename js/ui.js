// Показ уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getIconByType(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Получение иконки для уведомления
function getIconByType(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Открытие галереи фото
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

// Закрытие галереи
function closePhotoGallery() {
    const modal = document.getElementById('photoModal');
    modal.classList.remove('active');
}

// Переключение фото в галерее
function nextPhoto() {
    if (window.currentGalleryIndex < window.currentGalleryPhotos.length - 1) {
        window.currentGalleryIndex++;
        const modal = document.getElementById('photoModal');
        const img = modal.querySelector('.photo-modal-img');
        const counter = modal.querySelector('.photo-modal-counter');
        img.src = window.currentGalleryPhotos[window.currentGalleryIndex];
        counter.textContent = `${window.currentGalleryIndex + 1} / ${window.currentGalleryPhotos.length}`;
    }
}

function prevPhoto() {
    if (window.currentGalleryIndex > 0) {
        window.currentGalleryIndex--;
        const modal = document.getElementById('photoModal');
        const img = modal.querySelector('.photo-modal-img');
        const counter = modal.querySelector('.photo-modal-counter');
        img.src = window.currentGalleryPhotos[window.currentGalleryIndex];
        counter.textContent = `${window.currentGalleryIndex + 1} / ${window.currentGalleryPhotos.length}`;
    }
}

// Добавляем обработчики для галереи
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.querySelector('.photo-modal-close').addEventListener('click', closePhotoGallery);
        modal.querySelector('.prev').addEventListener('click', prevPhoto);
        modal.querySelector('.next').addEventListener('click', nextPhoto);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePhotoGallery();
        });
    }
});

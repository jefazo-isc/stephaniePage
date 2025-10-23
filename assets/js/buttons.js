document.addEventListener('DOMContentLoaded', function() {
    console.log('Script buttons.js cargado correctamente');
    
    const popup = document.getElementById('popup');
    const closeBtn = document.querySelector('.close-btn');
    const buttons = document.querySelectorAll('.btn-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupInfo = document.getElementById('popup-info');
    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    console.log('Botones encontrados:', buttons.length);

    if (popup) {
        popup.classList.add('hidden');
    }
    if (main) main.classList.remove('blur');
    if (header) header.classList.remove('blur');
    if (footer) footer.classList.remove('blur');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const title = button.getAttribute('data-title');
            const info = button.getAttribute('data-info');
            
            if (popupTitle) popupTitle.textContent = title;
            if (popupInfo) popupInfo.textContent = info;
            
            if (popup) popup.classList.remove('hidden');
            if (main) main.classList.add('blur');
            if (header) header.classList.add('blur');
            if (footer) footer.classList.add('blur');
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (popup) popup.classList.add('hidden');
            if (main) main.classList.remove('blur');
            if (header) header.classList.remove('blur');
            if (footer) footer.classList.remove('blur');
        });
    }

    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                popup.classList.add('hidden');
                if (main) main.classList.remove('blur');
                if (header) header.classList.remove('blur');
                if (footer) footer.classList.remove('blur');
            }
        });
    }
});
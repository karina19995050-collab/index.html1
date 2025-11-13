// Хранение данных
const STORAGE_KEYS = {
    START_DATE: 'quitSmoking_startDate',
    CIGARETTES_PER_DAY: 'quitSmoking_cigarettesPerDay',
    PACK_PRICE: 'quitSmoking_packPrice',
    CIGARETTES_PER_PACK: 'quitSmoking_cigarettesPerPack',
    CHECKED_DAYS: 'quitSmoking_checkedDays'
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initSetupForm();
    initCalendar();
    updateStats();
    
    // Показываем нужную вкладку в зависимости от состояния
    const startDate = localStorage.getItem(STORAGE_KEYS.START_DATE);
    if (startDate) {
        showTab('calendar');
    }
});

// Управление вкладками
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            showTab(tabName);
        });
    });
}

function showTab(tabName) {
    // Убираем активный класс со всех кнопок и контента
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Добавляем активный класс выбранной вкладке
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Обновляем контент вкладок при переключении
    if (tabName === 'calendar') {
        initCalendar();
    } else if (tabName === 'stats') {
        updateStats();
    }
}

// Настройка формы
function initSetupForm() {
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
        const cigarettesPerDay = parseInt(document.getElementById('cigarettesPerDay').value);
        const packPrice = parseFloat(document.getElementById('packPrice').value);
        const cigarettesPerPack = parseInt(document.getElementById('cigarettesPerPack').value) || 20;

        if (!cigarettesPerDay || !packPrice) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        // Сохраняем данные
        const startDate = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.START_DATE, startDate);
        localStorage.setItem(STORAGE_KEYS.CIGARETTES_PER_DAY, cigarettesPerDay);
        localStorage.setItem(STORAGE_KEYS.PACK_PRICE, packPrice);
        localStorage.setItem(STORAGE_KEYS.CIGARETTES_PER_PACK, cigarettesPerPack);

        // Отмечаем сегодняшний день
        const today = new Date().toISOString().split('T')[0];
        const checkedDays = getCheckedDays();
        if (!checkedDays.includes(today)) {
            checkedDays.push(today);
            saveCheckedDays(checkedDays);
        }

        // Переключаемся на календарь
        showTab('calendar');
        updateStats();
    });

    // Загружаем сохраненные значения
    const savedCigarettes = localStorage.getItem(STORAGE_KEYS.CIGARETTES_PER_DAY);
    const savedPrice = localStorage.getItem(STORAGE_KEYS.PACK_PRICE);
    const savedPack = localStorage.getItem(STORAGE_KEYS.CIGARETTES_PER_PACK);

    if (savedCigarettes) document.getElementById('cigarettesPerDay').value = savedCigarettes;
    if (savedPrice) document.getElementById('packPrice').value = savedPrice;
    if (savedPack) document.getElementById('cigarettesPerPack').value = savedPack;
}

// Календарь
function initCalendar() {
    const container = document.getElementById('calendarContainer');
    const startDate = localStorage.getItem(STORAGE_KEYS.START_DATE);
    
    if (!startDate) {
        container.innerHTML = '<p class="info-text">Сначала настройте параметры на вкладке "Настройка"</p>';
        return;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    renderCalendar(currentYear, currentMonth, container);
}

function renderCalendar(year, month, container) {
    const startDate = new Date(localStorage.getItem(STORAGE_KEYS.START_DATE));
    const checkedDays = getCheckedDays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; // Понедельник = 0

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    let html = `
        <div class="calendar-nav">
            <button id="prevMonth">←</button>
            <div class="calendar-month">${monthNames[month]} ${year}</div>
            <button id="nextMonth">→</button>
        </div>
        <div class="calendar-grid">
    `;

    // Дни недели
    dayNames.forEach(day => {
        html += `<div class="calendar-day-name">${day}</div>`;
    });

    // Пустые ячейки перед первым днем месяца
    for (let i = 0; i < adjustedStartingDay; i++) {
        html += '<div class="calendar-day"></div>';
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isChecked = checkedDays.includes(dateStr);
        const isToday = dateStr === today.toISOString().split('T')[0];
        const isFuture = date > today;
        const isBeforeStart = date < startDate;
        
        let classes = 'calendar-day';
        if (isChecked) classes += ' checked';
        if (isToday) classes += ' today';
        if (isFuture || isBeforeStart) classes += ' future';

        html += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
    }

    html += '</div>';
    container.innerHTML = html;

    // Обработчики навигации
    document.getElementById('prevMonth').addEventListener('click', () => {
        const newDate = new Date(year, month - 1, 1);
        renderCalendar(newDate.getFullYear(), newDate.getMonth(), container);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        const newDate = new Date(year, month + 1, 1);
        renderCalendar(newDate.getFullYear(), newDate.getMonth(), container);
    });

    // Обработчики кликов по дням
    container.querySelectorAll('.calendar-day:not(.future)').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            const dateStr = dayEl.getAttribute('data-date');
            if (!dateStr) return;

            const checkedDays = getCheckedDays();
            const index = checkedDays.indexOf(dateStr);
            
            if (index > -1) {
                checkedDays.splice(index, 1);
            } else {
                checkedDays.push(dateStr);
            }
            
            saveCheckedDays(checkedDays);
            renderCalendar(year, month, container);
            updateStats();
        });
    });
}

// Работа с отмеченными днями
function getCheckedDays() {
    const stored = localStorage.getItem(STORAGE_KEYS.CHECKED_DAYS);
    return stored ? JSON.parse(stored) : [];
}

function saveCheckedDays(days) {
    days.sort();
    localStorage.setItem(STORAGE_KEYS.CHECKED_DAYS, JSON.stringify(days));
}

// Статистика
function updateStats() {
    const statsContent = document.getElementById('statsContent');
    const startDate = localStorage.getItem(STORAGE_KEYS.START_DATE);

    if (!startDate) {
        statsContent.innerHTML = '<p class="info-text">Сначала настройте параметры на вкладке "Настройка"</p>';
        return;
    }

    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkedDays = getCheckedDays();
    const daysWithoutSmoking = checkedDays.length;
    
    const timeDiff = today - start;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    const cigarettesPerDay = parseInt(localStorage.getItem(STORAGE_KEYS.CIGARETTES_PER_DAY));
    const packPrice = parseFloat(localStorage.getItem(STORAGE_KEYS.PACK_PRICE));
    const cigarettesPerPack = parseInt(localStorage.getItem(STORAGE_KEYS.CIGARETTES_PER_PACK)) || 20;

    const totalCigarettesAvoided = daysWithoutSmoking * cigarettesPerDay;
    const packsAvoided = totalCigarettesAvoided / cigarettesPerPack;
    const moneySaved = packsAvoided * packPrice;

    const motivationMessages = [
        'Вы делаете отличную работу! Продолжайте в том же духе! 💪',
        'Каждый день без сигарет - это победа! 🎉',
        'Вы уже на правильном пути! Ваше здоровье скажет вам спасибо! ❤️',
        'Невероятно! Вы становитесь сильнее с каждым днем! 🌟',
        'Помните: вы контролируете свою жизнь, а не сигареты! ✨'
    ];
    const randomMotivation = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

    statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Дней без курения</div>
                <div class="stat-value">${daysWithoutSmoking}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Время без курения</div>
                <div class="stat-value" style="font-size: 1.8rem;">${daysDiff} дн. ${hours} ч. ${minutes} мин.</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Сэкономлено денег</div>
                <div class="stat-value">${Math.round(moneySaved)} ₽</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Сигарет не выкурено</div>
                <div class="stat-value">${totalCigarettesAvoided}</div>
            </div>
        </div>
        <div class="motivation-text">
            <h3>💚 Мотивация</h3>
            <p>${randomMotivation}</p>
        </div>
    `;
}


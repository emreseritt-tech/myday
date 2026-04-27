let appState = {
    sleep: { history: [], current: 0 },
    water: { history: [], current: 0, dailyGoal: 2000 },
    steps: { history: [], current: 0 },
    mood: { history: [], current: '😊' },
    medicine: { list: [] },
    profile: { name: 'Пользователь' },
    currentScreen: 'dashboard'
};

function loadData() {
    const savedData = localStorage.getItem('myDayData');
    if (savedData) appState = JSON.parse(savedData);
}

function saveAllData() {
    localStorage.setItem('myDayData', JSON.stringify(appState));
}

function init() {
    loadData();
    updateDashboard();
    updateDate();
    showScreen('dashboard');
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.querySelector('.date');
    if (dateElement) dateElement.textContent = now.toLocaleDateString('ru-RU', options);
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenName + '-screen');
    if (screen) screen.classList.add('active');
    appState.currentScreen = screenName;
    updateScreen(screenName);
}

function goBack() { showScreen('dashboard'); }
function navigateTo(screen) { showScreen(screen); }

function updateScreen(name) {
    if (name === 'dashboard') updateDashboard();
    else if (name === 'sleep') updateSleepScreen();
    else if (name === 'water') updateWaterScreen();
    else if (name === 'steps') updateStepsScreen();
    else if (name === 'mood') updateMoodScreen();
    else if (name === 'medicine') updateMedicineScreen();
    else if (name === 'profile') updateProfileScreen();
}

function updateDashboard() {
    document.getElementById('sleep-hours').textContent = appState.sleep.current + ' часов';
    document.getElementById('water-amount').textContent = appState.water.current + ' мл';
    document.getElementById('steps-count').textContent = appState.steps.current + ' шагов';
    document.getElementById('mood-status').textContent = appState.mood.current;
    document.getElementById('medicine-count').textContent = appState.medicine.list.length + ' активных';
}

function updateSleepScreen() {
    document.getElementById('sleep-history').innerHTML = appState.sleep.history.map(item => 
        '<div class="history-item"><span>' + item.date + '</span><span>' + item.hours + ' часов</span></div>'
    ).join('');
}

function updateWaterScreen() {
    const pct = Math.round((appState.water.current / appState.water.dailyGoal) * 100);
    document.getElementById('water-percentage').textContent = pct + '%';
    document.getElementById('water-history').innerHTML = appState.water.history.map(item => 
        '<div class="history-item"><span>' + item.date + '</span><span>' + item.amount + ' мл</span></div>'
    ).join('');
}

function updateStepsScreen() {
    document.getElementById('current-steps').textContent = appState.steps.current;
    document.getElementById('steps-history').innerHTML = appState.steps.history.map(item => 
        '<div class="history-item"><span>' + item.date + '</span><span>' + item.count + ' шагов</span></div>'
    ).join('');
}

function updateMoodScreen() {
    document.getElementById('mood-history').innerHTML = appState.mood.history.map(item => 
        '<div class="history-item"><span>' + item.date + '</span><span>' + item.mood + ' ' + item.status + '</span></div>'
    ).join('');
}

function updateMedicineScreen() {
    document.getElementById('medicine-list').innerHTML = appState.medicine.list.map((med, i) => 
        '<div class="medicine-item"><div><strong>' + med.name + '</strong><div class="time">' + med.time + '</div></div><button onclick="deleteMedicine(' + i + ')" class="cancel-btn"><i class="fas fa-trash"></i></button></div>'
    ).join('');
}

function updateProfileScreen() {
    document.getElementById('profile-name').textContent = appState.profile.name;
    document.getElementById('name-input').value = appState.profile.name;
}

function showAddForm(type) {
    document.getElementById(type + '-form').classList.remove('hidden');
}

function hideAddForm(type) {
    document.getElementById(type + '-form').classList.add('hidden');
}

function saveData(type) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');
    
    if (type === 'sleep') {
        const val = document.getElementById('sleep-input').value;
        if (val) {
            appState.sleep.history.unshift({ date: dateStr, hours: parseInt(val) });
            appState.sleep.current = parseInt(val);
        }
    } else if (type === 'water') {
        const val = document.getElementById('water-input').value;
        if (val) {
            appState.water.history.unshift({ date: dateStr, amount: parseInt(val) });
            appState.water.current += parseInt(val);
        }
    } else if (type === 'steps') {
        const val = document.getElementById('steps-input').value;
        if (val) {
            appState.steps.history.unshift({ date: dateStr, count: parseInt(val) });
            appState.steps.current = parseInt(val);
        }
    } else if (type === 'medicine') {
        const name = document.getElementById('medicine-name').value;
        const time = document.getElementById('medicine-time').value;
        if (name && time) {
            appState.medicine.list.push({ name: name, time: time });
        }
    }
    
    hideAddForm(type);
    saveAllData();
    showNotification('Добавлено!');
    updateDashboard();
    updateScreen(type);
}

function addWater(amount) {
    const dateStr = new Date().toLocaleDateString('ru-RU');
    appState.water.history.unshift({ date: dateStr, amount: amount });
    appState.water.current += amount;
    saveAllData();
    updateWaterScreen();
    showNotification('Добавлено ' + amount + ' мл');
}

function selectMood(emoji, status) {
    const dateStr = new Date().toLocaleDateString('ru-RU');
    appState.mood.history.unshift({ date: dateStr, mood: emoji, status: status });
    appState.mood.current = emoji;
    saveAllData();
    updateMoodScreen();
    showNotification('Настроение сохранено!');
}

function deleteMedicine(index) {
    appState.medicine.list.splice(index, 1);
    saveAllData();
    updateMedicineScreen();
    showNotification('Лекарство удалено');
}

function saveProfile() {
    const name = document.getElementById('name-input').value.trim();
    if (name) {
        appState.profile.name = name;
        saveAllData();
        updateProfileScreen();
        showNotification('Профиль сохранен!');
    }
}

function showStats(category) {
    const display = document.getElementById('stats-display');
    let html = '';
    
    if (category === 'sleep') {
        html = '<h4>Статистика сна</h4>';
        appState.sleep.history.forEach(item => {
            html += '<p>' + item.date + ': ' + item.hours + ' часов</p>';
        });
    } else if (category === 'water') {
        html = '<h4>Статистика воды</h4>';
        html += '<p>Сегодня: ' + appState.water.current + ' мл из ' + appState.water.dailyGoal + ' мл</p>';
        appState.water.history.forEach(item => {
            html += '<p>' + item.date + ': ' + item.amount + ' мл</p>';
        });
    } else if (category === 'steps') {
        html = '<h4>Статистика шагов</h4>';
        appState.steps.history.forEach(item => {
            html += '<p>' + item.date + ': ' + item.count + ' шагов</p>';
        });
    } else if (category === 'mood') {
        html = '<h4>Статистика настроения</h4>';
        appState.mood.history.forEach(item => {
            html += '<p>' + item.date + ': ' + item.mood + ' ' + item.status + '</p>';
        });
    } else if (category === 'medicine') {
        html = '<h4>Активные лекарства</h4>';
        appState.medicine.list.forEach(med => {
            html += '<p>' + med.name + ' - ' + med.time + '</p>';
        });
    }
    
    display.innerHTML = html;
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    messageElement.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
}

document.addEventListener('DOMContentLoaded', init);

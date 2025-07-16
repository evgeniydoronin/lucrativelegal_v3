# 🌐 Удаленная разработка

> Руководство по настройке удаленной разработки для Lucrative Legal Group v3

## 📋 Обзор

Этот документ описывает настройку удаленной разработки между Mac (основная машина) и Arch Linux (удаленная машина) с автоматическим определением IP и синхронизацией в реальном времени.

## 🎯 Цели

- ✅ **Автоматическое определение IP** - не нужно вручную искать адрес
- ✅ **Live reload** - изменения видны мгновенно на всех устройствах
- ✅ **Синхронизация** - скролл, клики, формы синхронизируются
- ✅ **Удобство** - простая настройка и использование

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mac (Dev)     │    │   Network       │    │ Arch Linux      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ VS Code     │ │    │ │   Router    │ │    │ │  Browser    │ │
│ │ Gulp        │◄┼────┼─┤ 192.168.1.x ├─┼────┼─┤ Firefox     │ │
│ │ Browser-Sync│ │    │ │             │ │    │ │ Chrome      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ Port: 3000      │    │                 │    │ http://IP:3000  │
│ UI: 3001        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Настройка на Mac

### 1. Автоматическое определение IP

Наш gulpfile.js уже настроен для автоматического определения IP:

```javascript
// gulpfile.js
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && 
          !interface.internal && 
          interface.address !== '127.0.0.1') {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

function serve() {
  const localIP = getLocalIP();
  
  browserSync.init({
    server: { baseDir: './dist' },
    host: '0.0.0.0',  // ✅ Важно! Слушаем все интерфейсы
    port: 3000,
    ui: { port: 3001 },
    notify: false,
    open: false,
    ghostMode: {
      clicks: true,   // ✅ Синхронизация кликов
      forms: true,    // ✅ Синхронизация форм
      scroll: true    // ✅ Синхронизация скролла
    }
  }, function() {
    const port = browserSync.getOption('port');
    const uiPort = browserSync.getOption('ui.port');
    
    // ✅ Красивый вывод с реальными портами
    console.log('\n🌐 Development Server Started!');
    console.log(`📱 Local:    http://localhost:${port}`);
    console.log(`🌍 Network:  http://${localIP}:${port}`);
    console.log(`⚙️  UI:       http://${localIP}:${uiPort}`);
    console.log('\n📋 For remote access from Arch Linux:');
    console.log(`   http://${localIP}:${port}\n`);
  });
}
```

### 2. Запуск сервера разработки

```bash
# В терминале Mac
cd /path/to/lucrativelegal-v3
npx gulp dev
```

**Результат:**
```
🌐 Development Server Started!
📱 Local:    http://localhost:3000
🌍 Network:  http://192.168.1.128:3000
⚙️  UI:       http://192.168.1.128:3001

📋 For remote access from Arch Linux:
   http://192.168.1.128:3000
```

### 3. Проверка сетевых настроек

```bash
# Проверить IP адрес
ifconfig | grep "inet " | grep -v 127.0.0.1

# Проверить открытые порты
lsof -i :3000
lsof -i :3001

# Проверить firewall (если включен)
sudo pfctl -sr | grep 3000
```

## 🐧 Настройка на Arch Linux

### 1. Установка браузеров

```bash
# Firefox
sudo pacman -S firefox

# Chrome/Chromium
sudo pacman -S chromium

# Или Google Chrome из AUR
yay -S google-chrome
```

### 2. Настройка сети

```bash
# Проверить подключение к сети
ping 192.168.1.1  # Router
ping 192.168.1.128  # Mac IP

# Проверить доступность портов
telnet 192.168.1.128 3000
telnet 192.168.1.128 3001

# Если нужно, настроить DNS
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf
```

### 3. Настройка /etc/hosts (опционально)

```bash
# Добавить удобный алиас
sudo nano /etc/hosts

# Добавить строку:
192.168.1.128  dev.lucrativelegal.local
192.168.1.128  llg.local
```

**Теперь можно использовать:**
- `http://llg.local:3000` - основной сайт
- `http://llg.local:3001` - Browser-Sync UI

## 🚀 Использование

### Основной workflow

1. **На Mac:**
   ```bash
   npx gulp dev
   ```

2. **На Arch Linux:**
   - Открыть браузер
   - Перейти по адресу из консоли Mac
   - Наслаждаться live reload!

### Browser-Sync UI

Откройте `http://IP:3001` для доступа к панели управления:

- **Overview** - общая информация
- **Sync Options** - настройки синхронизации
- **History** - история изменений
- **Plugins** - дополнительные плагины
- **Network Throttle** - эмуляция медленной сети

## 🔄 Синхронизация

### Что синхронизируется

- ✅ **Скролл** - прокрутка страницы
- ✅ **Клики** - нажатия на ссылки и кнопки
- ✅ **Формы** - ввод в поля форм
- ✅ **Перезагрузка** - обновление страницы
- ✅ **CSS инъекции** - изменения стилей без перезагрузки

### Настройка синхронизации

```javascript
// В gulpfile.js можно настроить
ghostMode: {
  clicks: true,     // Синхронизация кликов
  forms: true,      // Синхронизация форм
  scroll: true,     // Синхронизация скролла
  location: false   // Не синхронизировать URL
}
```

## 🛠️ Отладка проблем

### Проблема: Сайт недоступен

**Проверить:**
```bash
# На Mac - проверить что сервер запущен
lsof -i :3000

# На Arch - проверить сетевое подключение
ping 192.168.1.128
telnet 192.168.1.128 3000
```

**Решение:**
- Убедиться что `host: '0.0.0.0'` в настройках
- Проверить firewall на Mac
- Убедиться что устройства в одной сети

### Проблема: IP адрес меняется

**Решение 1 - Статический IP:**
```bash
# На Mac в Системные настройки → Сеть → Wi-Fi → Дополнительно
# Настроить статический IP: 192.168.1.100
```

**Решение 2 - Использовать mDNS:**
```bash
# На Arch Linux установить avahi
sudo pacman -S avahi nss-mdns
sudo systemctl enable --now avahi-daemon

# Теперь можно использовать:
# http://your-mac-name.local:3000
```

### Проблема: Медленная синхронизация

**Настройка в gulpfile.js:**
```javascript
browserSync.init({
  // ... другие настройки
  reloadDelay: 100,      // Уменьшить задержку
  reloadDebounce: 200,   // Уменьшить дебаунс
  injectChanges: true,   // Включить CSS инъекции
});
```

## 📱 Тестирование на мобильных

### Подключение мобильных устройств

1. **Подключить к той же Wi-Fi сети**
2. **Открыть браузер на телефоне/планшете**
3. **Перейти по адресу:** `http://192.168.1.128:3000`

### Удаленная отладка

**Для Android:**
```bash
# Включить USB отладку на устройстве
# Подключить к Mac через USB
# В Chrome на Mac: chrome://inspect
```

**Для iOS:**
```bash
# Включить Web Inspector в Safari на устройстве
# На Mac в Safari: Разработка → [Устройство] → [Страница]
```

## 🔒 Безопасность

### Настройки firewall

**На Mac:**
```bash
# Разрешить порты для локальной сети
sudo pfctl -f /etc/pf.conf
```

**На Arch Linux:**
```bash
# Если используется ufw
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 3001
```

### Ограничение доступа

```javascript
// В gulpfile.js можно ограничить доступ
browserSync.init({
  // ... другие настройки
  middleware: [
    function(req, res, next) {
      const clientIP = req.connection.remoteAddress;
      if (!clientIP.startsWith('192.168.1.')) {
        res.status(403).send('Access denied');
        return;
      }
      next();
    }
  ]
});
```

## 📊 Мониторинг производительности

### Встроенные инструменты

```javascript
// Добавить в main.js для мониторинга
if (window.performance) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    const loadTime = perfData.loadEventEnd - perfData.fetchStart;
    
    console.log(`📊 Page load time: ${loadTime}ms`);
    
    // Отправить данные на Mac для анализа
    fetch(`http://${window.location.hostname}:3001/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loadTime,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    });
  });
}
```

## 🎯 Лучшие практики

### 1. Организация workflow

```bash
# Создать alias для быстрого запуска
echo 'alias llg-dev="cd ~/Projects/lucrativelegal-v3 && npx gulp dev"' >> ~/.zshrc

# Использование
llg-dev
```

### 2. Множественные устройства

- **Mac** - основная разработка
- **Arch Linux** - тестирование на Linux
- **iPhone/Android** - мобильное тестирование
- **iPad** - планшетное тестирование

### 3. Синхронизация изменений

```bash
# На Mac - отслеживание изменений
gulp.watch('src/**/*.scss', styles);
gulp.watch('src/**/*.js', scripts);
gulp.watch('src/**/*.html', html);

# Все изменения автоматически отправляются на все устройства
```

## 🔧 Расширенные настройки

### HTTPS для тестирования

```javascript
// Для тестирования PWA и secure features
browserSync.init({
  // ... другие настройки
  https: {
    key: "path/to/custom.key",
    cert: "path/to/custom.crt"
  }
});
```

### Туннелирование (для внешнего доступа)

```javascript
// Для доступа из интернета (осторожно!)
browserSync.init({
  // ... другие настройки
  tunnel: "llg-dev-tunnel"  // Создаст публичный URL
});
```

---

## 📝 Changelog

### v1.0.0 (14 июля 2025)
- ✅ Автоматическое определение IP
- ✅ Настройка удаленного доступа
- ✅ Синхронизация между устройствами
- ✅ Отладка и мониторинг

---

**Создано для Lucrative Legal Group v3**  
*Дата создания: 14 июля 2025*

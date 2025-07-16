# 🔄 Рабочий процесс разработки

## 📋 Обзор

Описание процесса разработки, инструментов и методологии для проекта Lucrative Legal Group v3.

## 🛠️ Настройка окружения

### Требования

- **Node.js**: 18+ LTS
- **npm**: 9+
- **Git**: 2.30+
- **Browser**: Chrome/Firefox (для тестирования)

### Установка зависимостей

```bash
# Клонирование репозитория
git clone [repository-url] lucrativelegal-v3
cd lucrativelegal-v3

# Установка зависимостей
npm install

# Запуск development сервера
npm run dev

# Открытие в браузере
# http://localhost:3000 - основной сайт
# http://localhost:3001 - Browser-Sync UI
```

## 📦 Package.json структура

```json
{
  "name": "lucrativelegal-v3",
  "version": "3.0.0",
  "description": "Modular website for Lucrative Legal Group with LLG Design System",
  "main": "index.js",
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:browsersync": "node browser-sync.js",
    "dev:gulp": "gulp watch",
    "dev:sass": "gulp sass:watch",
    
    "build": "gulp build",
    "build:sass": "gulp sass:build",
    "build:html": "gulp html:build",
    "build:assets": "gulp assets:copy",
    
    "clean": "rimraf dist/*",
    "lint": "npm-run-all lint:*",
    "lint:js": "eslint src/**/*.js --fix",
    "lint:css": "stylelint src/**/*.scss --fix"
  },
  "devDependencies": {
    "browser-sync": "^3.0.4",
    "del": "^8.0.0",
    "eslint": "^8.57.1",
    "gulp": "^4.0.2",
    "gulp-autoprefixer": "^8.0.0",
    "gulp-clean-css": "^4.3.0",
    "gulp-concat": "^2.6.1",
    "gulp-htmlmin": "^5.0.1",
    "gulp-plumber": "^1.2.1",
    "gulp-rename": "^2.1.0",
    "gulp-sass": "^6.0.1",
    "gulp-sourcemaps": "^3.0.0",
    "gulp-uglify": "^3.0.2",
    "npm-run-all": "^4.1.5",
    "rimraf": "^5.0.10",
    "sass": "^1.89.2",
    "stylelint": "^15.11.0"
  },
  "dependencies": {
    "gsap": "^3.13.0"
  }
}
```

## 🔧 Gulp конфигурация с автоматическим IP

### Современная настройка gulpfile.js

```javascript
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const os = require('os');

// Функция для получения локального IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Ищем IPv4, не внутренний, не loopback
      if (interface.family === 'IPv4' && 
          !interface.internal && 
          interface.address !== '127.0.0.1') {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Browser-Sync сервер с автоматическим IP
function serve() {
  const localIP = getLocalIP();
  
  browserSync.init({
    server: { baseDir: './dist' },
    host: '0.0.0.0',
    port: 3000,
    ui: { port: 3001 },
    notify: false,
    open: false,
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: true
    }
  }, function() {
    // Callback с реальными портами
    const port = browserSync.getOption('port');
    const uiPort = browserSync.getOption('ui.port');
    
    console.log('\n🌐 Development Server Started!');
    console.log(`📱 Local:    http://localhost:${port}`);
    console.log(`🌍 Network:  http://${localIP}:${port}`);
    console.log(`⚙️  UI:       http://${localIP}:${uiPort}`);
    console.log('\n📋 For remote access from Arch Linux:');
    console.log(`   http://${localIP}:${port}\n`);
  });
}
```

## 🎨 Современный Sass с @use

### Переход с @import на @use

```scss
// ❌ Старый способ (deprecated)
@import 'variables';
@import 'base';
@import 'components';

// ✅ Новый способ (современный)
@use 'variables' as *;  // Глобальные переменные
@use 'base';
@use 'components';

// ✅ Для color functions
@use "sass:color";

.button {
  background: color.adjust($primary-color, $lightness: -10%);
}
```

### Структура SCSS файлов

```
src/styles/
├── main.scss           # Главный файл с @use
├── _variables.scss     # Переменные
├── _base.scss         # Базовые стили
├── _grid.scss         # Grid система
├── _utilities.scss    # Утилиты
├── abstracts/         # Абстракции
├── base/             # Базовые стили
├── components/       # Компоненты
├── layout/          # Лейауты
└── utilities/       # Утилиты
```

## 🔧 Browser-Sync конфигурация

```javascript
// Расширенная конфигурация browser-sync.js
const browserSync = require('browser-sync').create();

browserSync.init({
  // Статический сервер для разработки
  server: {
    baseDir: './dist',
    index: 'index.html'
  },
  
  // Настройки сети
  host: '0.0.0.0',              // Доступ с других устройств в сети
  port: 3000,                   // Основной порт (автоматически изменяется)
  ui: {
    port: 3001,                 // UI панель Browser-Sync
    weinre: {
      port: 8080                // Удаленная отладка
    }
  },
  
  // Отслеживаемые файлы
  files: [
    'src/**/*.{html,scss,js}',
    'dist/**/*.{css,js,html}',
    '!dist/**/*.map'            // Исключаем source maps
  ],
  
  // Настройки синхронизации
  ghostMode: {
    clicks: true,               // Синхронизация кликов
    forms: true,                // Синхронизация форм
    scroll: true                // Синхронизация скролла
  },
  
  // Уведомления
  notify: {
    styles: {
      top: 'auto',
      bottom: '0',
      right: '0',
      borderBottomLeftRadius: '5px'
    }
  },
  
  // Дополнительные настройки
  open: false,                  // Не открывать браузер автоматически
  logLevel: 'info',
  logPrefix: 'LLG',
  
  // Middleware для обработки запросов
  middleware: [
    // Обработка компонентов
    function(req, res, next) {
      if (req.url.includes('/components/')) {
        // Логика обработки компонентов
      }
      next();
    }
  ],
  
  // Настройки для мобильных устройств
  tunnel: false,                // Отключаем туннель (можно включить для внешнего доступа)
  
  // Настройки прокси (если нужен)
  // proxy: "localhost:8080",   // Для WordPress разработки
  
  // Настройки перезагрузки
  reloadDelay: 300,             // Задержка перед перезагрузкой
  reloadDebounce: 500,          // Дебаунс для множественных изменений
  
  // Инъекция CSS без перезагрузки
  injectChanges: true,
  
  // Настройки для HTTPS (если нужно)
  // https: {
  //   key: "path/to/custom.key",
  //   cert: "path/to/custom.crt"
  // }
});

// Дополнительные watchers
const chokidar = require('chokidar');

// Watcher для компонентов
chokidar.watch('src/components/**/*').on('change', (path) => {
  console.log(`🔄 Component changed: ${path}`);
  
  // Перестройка компонента
  if (path.endsWith('.scss')) {
    // Компиляция SCSS
    buildComponentCSS(path);
  } else if (path.endsWith('.js')) {
    // Сборка JS
    buildComponentJS(path);
  } else if (path.endsWith('.html')) {
    // Обновление HTML
    buildComponentHTML(path);
  }
});

// Функции сборки компонентов
function buildComponentCSS(filePath) {
  // Логика компиляции SCSS компонента
}

function buildComponentJS(filePath) {
  // Логика сборки JS компонента
}

function buildComponentHTML(filePath) {
  // Логика обновления HTML компонента
}
```

## 📱 Тестирование на устройствах

### Локальная сеть

1. **Запуск сервера**:
   ```bash
   npm run dev
   ```

2. **Получение IP адреса**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr "IPv4"
   ```

3. **Доступ с устройств**:
   - **Desktop**: `http://192.168.1.100:3000`
   - **Mobile**: `http://192.168.1.100:3000`
   - **Tablet**: `http://192.168.1.100:3000`

### Browser-Sync UI

- **URL**: `http://192.168.1.100:3001`
- **Функции**:
  - Синхронизация устройств
  - Настройка задержек
  - История изменений
  - Сетевая информация

### Удаленная отладка

```javascript
// Weinre для удаленной отладки
// Добавляется автоматически в development режиме
<script src="http://192.168.1.100:8080/target/target-script-min.js#anonymous"></script>
```

## 🧩 Создание компонентов

### Генератор компонентов

```bash
# Создание нового компонента
npm run component:create hero

# Создание с опциями
npm run component:create hero --type=layout --with-tests
```

### Скрипт создания компонента

```javascript
// scripts/create-component.js
const fs = require('fs');
const path = require('path');

function createComponent(name, options = {}) {
  const componentDir = `src/components/${name}`;
  
  // Создаем папку компонента
  fs.mkdirSync(componentDir, { recursive: true });
  
  // Создаем файлы
  createHTMLFile(componentDir, name);
  createSCSSFile(componentDir, name);
  createJSFile(componentDir, name);
  createPHPFile(componentDir, name);
  createREADME(componentDir, name);
  createConfig(componentDir, name, options);
  
  if (options.withTests) {
    createTestFile(componentDir, name);
  }
  
  console.log(`✅ Component "${name}" created successfully!`);
}

function createHTMLFile(dir, name) {
  const template = `<!-- ${name} component -->
<div class="${name}" data-component="${name}">
  <div class="${name}__container">
    <h2 class="${name}__title">{{title}}</h2>
    <div class="${name}__content">
      {{content}}
    </div>
  </div>
</div>`;
  
  fs.writeFileSync(path.join(dir, `${name}.html`), template);
}

function createSCSSFile(dir, name) {
  const template = `// ${name} component styles

.${name} {
  // Component styles here
  
  &__container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--spacing-lg);
  }
  
  &__title {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-md);
  }
  
  &__content {
    // Content styles
  }
}`;
  
  fs.writeFileSync(path.join(dir, `${name}.scss`), template);
}

function createJSFile(dir, name) {
  const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Component';
  
  const template = `// ${name} component
export class ${className} {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.defaults, ...options };
    this.init();
  }
  
  get defaults() {
    return {
      // Default options
    };
  }
  
  init() {
    this.setupEventListeners();
    console.log('✅ ${className} initialized');
  }
  
  setupEventListeners() {
    // Event listeners
  }
  
  destroy() {
    // Cleanup
    console.log('🗑️ ${className} destroyed');
  }
  
  static autoInit(selector = '[data-component="${name}"]') {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => new ${className}(el));
  }
}

// Auto-initialization
document.addEventListener('DOMContentLoaded', () => {
  ${className}.autoInit();
});

export default ${className};`;
  
  fs.writeFileSync(path.join(dir, `${name}.js`), template);
}

// Остальные функции создания файлов...
```

## 🔄 Workflow разработки

### 1. Планирование

```bash
# Создание новой ветки для фичи
git checkout -b feature/hero-component

# Создание компонента
npm run component:create hero
```

### 2. Разработка

```bash
# Запуск development сервера
npm run dev

# В другом терминале - тесты
npm run test:watch
```

### 3. Тестирование

```bash
# Линтинг
npm run lint

# Тесты
npm run test

# Сборка для проверки
npm run build
```

### 4. Документация

```bash
# Генерация документации
npm run component:docs

# Обновление README
# Ручное обновление docs/
```

### 5. Коммит и пуш

```bash
# Добавление файлов
git add .

# Коммит с конвенциональным сообщением
git commit -m "feat(hero): add hero component with parallax effect"

# Пуш в удаленный репозиторий
git push origin feature/hero-component
```

## 🧪 Тестирование

### Unit тесты (Jest)

```javascript
// src/components/hero/tests/hero.test.js
import { HeroComponent } from '../hero.js';

describe('HeroComponent', () => {
  let element;
  let component;
  
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-component="hero">
        <h1 class="hero__title">Test Title</h1>
      </div>
    `;
    element = document.querySelector('[data-component="hero"]');
    component = new HeroComponent(element);
  });
  
  afterEach(() => {
    if (component) {
      component.destroy();
    }
    document.body.innerHTML = '';
  });
  
  test('should initialize correctly', () => {
    expect(component.element).toBe(element);
    expect(component.state).toBe('loaded');
  });
  
  test('should find title element', () => {
    expect(component.titleElement).toBeTruthy();
    expect(component.titleElement.textContent).toBe('Test Title');
  });
  
  test('should handle scroll click', () => {
    const scrollSpy = jest.spyOn(window, 'scrollTo');
    component.handleScrollClick({ preventDefault: jest.fn() });
    // Assertions...
  });
});
```

### Visual тестирование

```bash
# Скриншоты для сравнения
npm run test:visual

# Обновление базовых скриншотов
npm run test:visual:update
```

### Cross-browser тестирование

```javascript
// Playwright конфигурация
const { devices } = require('@playwright/test');

module.exports = {
  testDir: './tests',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
};
```

## 📦 Сборка и деплой

### Development сборка

```bash
npm run dev
# - Source maps включены
# - Код не минифицирован
# - Hot reload активен
# - Отладочная информация
```

### Production сборка

```bash
npm run build
# - Минификация CSS/JS
# - Оптимизация изображений
# - Удаление неиспользуемого кода
# - Генерация service worker
```

### Staging деплой

```bash
npm run deploy:staging
# - Сборка production версии
# - Загрузка на staging сервер
# - Запуск smoke тестов
```

### Production деплой

```bash
npm run deploy:production
# - Финальная проверка
# - Создание backup
# - Деплой на production
# - Мониторинг после деплоя
```

## 🔍 Отладка и профилирование

### Browser DevTools

1. **Performance tab**: Анализ производительности
2. **Network tab**: Загрузка ресурсов
3. **Console**: Логи и ошибки
4. **Elements**: Инспекция DOM

### Browser-Sync отладка

```javascript
// Добавление отладочной информации
browserSync.init({
  // ... другие настройки
  logLevel: 'debug',
  logConnections: true,
  logFileChanges: true
});
```

### Performance мониторинг

```javascript
// Встроенный performance monitor
if (window.performance) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
  });
}
```

## 📊 Метрики и аналитика

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
```

## 🔧 Инструменты и расширения

### VS Code расширения

- **Live Server**: Локальный сервер
- **Sass**: Подсветка синтаксиса
- **ES6 String HTML**: Подсветка HTML в JS
- **Auto Rename Tag**: Автопереименование тегов
- **Prettier**: Форматирование кода
- **ESLint**: Линтинг JavaScript

### Browser расширения

- **React DevTools**: Для отладки компонентов
- **Vue DevTools**: Альтернатива для Vue
- **Web Developer**: Инструменты разработчика
- **ColorZilla**: Пипетка цветов

---

**Дата создания**: 14 июля 2025  
**Версия**: 1.0  
**Статус**: В разработке

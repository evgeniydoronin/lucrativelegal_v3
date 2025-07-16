# 🏛️ Lucrative Legal Group v3

> Современный модульный веб-сайт для юридической компании с использованием передовых технологий и архитектурных решений.

## 📋 Обзор проекта

Lucrative Legal Group v3 - это полностью переработанная версия корпоративного сайта, построенная на принципах модульной архитектуры, высокой производительности и готовности к интеграции с WordPress.

### ✨ Ключевые особенности

- 🧩 **Модульная архитектура** - каждая секция как независимый компонент
- 🚀 **Высокая производительность** - оптимизация для всех устройств
- 📱 **Адаптивный дизайн** - идеальная работа на любых экранах
- 🔌 **WordPress Ready** - готовность к интеграции с CMS
- 🎨 **GSAP анимации** - плавные и эффектные переходы
- 🛠️ **Modern Tooling** - современные инструменты разработки
- 🌐 **Cross-browser** - поддержка всех современных браузеров
- ♿ **Accessibility** - соответствие стандартам доступности

## 🚀 Быстрый старт

### Требования

- **Node.js** 18+ LTS
- **npm** 9+
- **Git** 2.30+

### Установка

```bash
# Клонирование репозитория
git clone [repository-url] lucrativelegal-v3
cd lucrativelegal-v3

# Установка зависимостей
npm install

# Запуск development сервера
npm run dev
```

### Доступ к сайту

После запуска `npm run dev` вы увидите:

```
🌐 Development Server Started!
📱 Local:    http://localhost:3000
🌍 Network:  http://192.168.1.128:3000
⚙️  UI:       http://192.168.1.128:3001

📋 For remote access from Arch Linux:
   http://192.168.1.128:3000
```

- **Локально**: http://localhost:3000
- **Удаленно**: http://[автоматически-определенный-IP]:3000
- **Browser-Sync UI**: http://[IP]:3001

## 🏗️ Архитектура

### Структура проекта

```
/v3
├── docs/                       # 📚 Документация
│   ├── ARCHITECTURE_PLAN.md    # План архитектуры
│   ├── COMPONENT_STRUCTURE.md  # Структура компонентов
│   ├── DEVELOPMENT_WORKFLOW.md # Рабочий процесс
│   └── WORDPRESS_INTEGRATION.md # Интеграция с WordPress
├── src/                        # 🔧 Исходный код
│   ├── components/             # 🧩 Модульные компоненты
│   ├── styles/                 # 🎨 Общие стили
│   ├── scripts/                # 📜 Общие скрипты
│   └── assets/                 # 🖼️ Ресурсы
├── dist/                       # 📦 Собранные файлы
├── package.json                # 📋 Конфигурация проекта
├── gulpfile.js                 # 🔄 Gulp конфигурация
├── browser-sync.js             # 🔄 Настройки тестирования
└── README.md                   # 📖 Этот файл
```

### Компонентная система

Каждый компонент содержит:

```
components/hero/
├── hero.html           # HTML разметка
├── hero.scss           # Стили компонента
├── hero.js             # JavaScript логика
├── hero.php            # PHP для WordPress
├── README.md           # Документация
└── config.json         # Конфигурация
```

## 🛠️ Команды разработки

### Development

```bash
npm run dev              # Запуск development сервера
npm run dev:watch        # Запуск с отслеживанием изменений
npm run test:watch       # Запуск тестов в watch режиме
```

### Сборка

```bash
npm run build            # Production сборка
npm run build:dev        # Development сборка
npm run clean            # Очистка dist папки
```

### Тестирование

```bash
npm test                 # Запуск всех тестов
npm run test:unit        # Unit тесты
npm run test:visual      # Visual тесты
npm run test:e2e         # End-to-end тесты
```

### Линтинг

```bash
npm run lint             # Проверка всего кода
npm run lint:js          # Проверка JavaScript
npm run lint:css         # Проверка CSS/SCSS
npm run lint:fix         # Автоисправление ошибок
```

### Компоненты

```bash
npm run component:create hero    # Создание нового компонента
npm run component:docs           # Генерация документации
npm run component:test hero      # Тестирование компонента
```

## 🧩 Компоненты

### Текущие компоненты

| № | Компонент | Статус | Описание |
|---|-----------|--------|----------|
| 01 | **Hero** | 📋 Планируется | Главная секция |
| 02 | **Future Marketing** | 📋 Планируется | Будущее маркетинга |
| 03 | **What's New** | 📋 Планируется | Новости компании |
| 04 | **Awards** | 📋 Планируется | Награды и достижения |
| 05 | **Case Studies** | 📋 Планируется | Кейсы и результаты |
| 06 | **Services** | 📋 Планируется | Услуги компании |
| 07 | **Lawyer Types** | 📋 Планируется | Типы юристов |
| 08 | **Portfolio** | 📋 Планируется | Портфолио работ |
| 09 | **About** | 📋 Планируется | О компании |
| 10 | **Blog** | 📋 Планируется | Блог и статьи |
| 11 | **Testimonials** | 📋 Планируется | Отзывы клиентов |

> **Примечание**: Все секции находятся в стадии планирования и будут разрабатываться в рамках модульной архитектуры.

### Создание нового компонента

```bash
# Создание базового компонента
npm run component:create my-component

# Создание с дополнительными опциями
npm run component:create my-component --type=layout --with-tests
```

## 🎨 Стили и дизайн

### CSS архитектура

- **Методология**: ITCSS + BEM
- **Препроцессор**: SCSS
- **PostCSS**: Autoprefixer, CSSnano
- **CSS Custom Properties**: Для динамических значений

### Цветовая палитра

```scss
:root {
  --color-primary: #667eea;      // Основной синий
  --color-secondary: #764ba2;    // Вторичный фиолетовый
  --color-accent: #f093fb;       // Акцентный розовый
  --color-success: #43e97b;      // Успех
  --color-warning: #fee140;      // Предупреждение
  --color-error: #fa709a;        // Ошибка
}
```

### Типографика

- **Основной шрифт**: Inter (Google Fonts)
- **Размеры**: Fluid typography с clamp()
- **Высота строки**: 1.6 (базовая)

## 📱 Тестирование на устройствах

### Browser-Sync

Автоматическая синхронизация между устройствами:

1. Запустите `npm run dev`
2. Откройте http://[ваш-ip]:3000 на любом устройстве
3. Все действия синхронизируются между устройствами

### Поддерживаемые устройства

- **Desktop**: 1200px+
- **Laptop**: 992px - 1199px
- **Tablet**: 768px - 991px
- **Mobile**: 320px - 767px

### Браузеры

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Производительность

### Метрики

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Оптимизации

- ⚡ **Code Splitting** - разделение JavaScript
- 🖼️ **Image Optimization** - WebP, lazy loading
- 📦 **Tree Shaking** - удаление неиспользуемого кода
- 🎯 **Critical CSS** - инлайн критических стилей
- 🗜️ **Compression** - Gzip/Brotli сжатие

## 🔌 WordPress интеграция

### Подготовка к WordPress

Проект готов к интеграции с WordPress:

- PHP компоненты для каждой секции
- WordPress хуки и фильтры
- Customizer интеграция
- Система загрузки компонентов

### Миграция

```bash
# Сборка для WordPress
npm run build:wordpress

# Копирование в тему
npm run deploy:wordpress
```

## 🧪 Тестирование

### Unit тесты

```bash
npm run test:unit
```

### Visual тесты

```bash
npm run test:visual
```

### E2E тесты

```bash
npm run test:e2e
```

### Performance тесты

```bash
npm run test:performance
```

## 📊 Мониторинг

### Performance Dashboard

Встроенная панель мониторинга производительности:

```javascript
// Открытие панели
window.showPerformanceDashboard();

// Или Ctrl+Shift+P
```

### Метрики в реальном времени

- FPS мониторинг
- Использование памяти
- Время загрузки компонентов
- Network активность

## 🔧 Конфигурация

### Browser-Sync

```javascript
// browser-sync.js
{
  host: '0.0.0.0',        // Доступ с других устройств
  port: 3000,             // Основной порт
  ui: { port: 3001 },     // UI панель
  ghostMode: {            // Синхронизация
    clicks: true,
    forms: true,
    scroll: true
  }
}
```

### Gulp

- **Task-based**: Простые и понятные задачи
- **SCSS компиляция**: Автоматическая обработка стилей
- **JavaScript минификация**: Сжатие JS файлов
- **Live reload**: Автообновление браузера
- **File watching**: Отслеживание изменений

## 📚 Документация

### Основные документы

- [📋 План архитектуры](docs/ARCHITECTURE_PLAN.md)
- [🎨 Дизайн-система](docs/DESIGN_SYSTEM.md)
- [🧩 Структура компонентов](docs/COMPONENT_STRUCTURE.md)
- [🔄 Рабочий процесс](docs/DEVELOPMENT_WORKFLOW.md)
- [🔌 WordPress интеграция](docs/WORDPRESS_INTEGRATION.md)

### API документация

Автогенерируемая документация доступна после сборки:

```bash
npm run docs:generate
open docs/api/index.html
```

## 🤝 Участие в разработке

### Workflow

1. **Fork** репозитория
2. **Создайте** ветку для фичи (`git checkout -b feature/amazing-feature`)
3. **Commit** изменения (`git commit -m 'Add amazing feature'`)
4. **Push** в ветку (`git push origin feature/amazing-feature`)
5. **Создайте** Pull Request

### Стандарты кода

- **JavaScript**: ESLint + Prettier
- **CSS**: Stylelint
- **Commits**: Conventional Commits
- **Документация**: JSDoc для функций

### Тестирование

Все изменения должны включать тесты:

```bash
npm run test              # Перед коммитом
npm run lint              # Проверка стиля
npm run build             # Проверка сборки
```

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👥 Команда

- **Архитектор**: AI Assistant
- **Разработчик**: [Ваше имя]
- **Дизайнер**: [Имя дизайнера]
- **QA**: [Имя тестировщика]

## 📞 Поддержка

### Вопросы и проблемы

- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: support@lucrativelegal.com

### Полезные ссылки

- **GSAP документация**: https://greensock.com/docs/
- **Browser-Sync**: https://browsersync.io/docs
- **WordPress**: https://developer.wordpress.org/
- **Performance**: https://web.dev/performance/

---

## 🎯 Roadmap

### v3.1 (Q3 2025)
- [ ] Storybook интеграция
- [ ] A/B тестирование
- [ ] Advanced analytics
- [ ] PWA поддержка

### v3.2 (Q4 2025)
- [ ] Internationalization
- [ ] Dark mode
- [ ] Advanced animations
- [ ] Micro-interactions

### v4.0 (2026)
- [ ] Headless CMS
- [ ] GraphQL API
- [ ] React/Vue компоненты
- [ ] AI интеграция

---

**Создано с ❤️ для Lucrative Legal Group**

*Последнее обновление: 14 июля 2025*

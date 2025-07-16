# 🎨 LLG Design System

> Дизайн-система Lucrative Legal Group v3 - современная, масштабируемая система для создания премиальных юридических интерфейсов.

## 📋 Обзор системы

LLG Design System основана на принципах fluid design, пропорционального масштабирования и премиального пользовательского опыта. Система обеспечивает консистентность дизайна на всех устройствах от мобильных до сверхшироких экранов.

### ✨ Ключевые принципы

- **Fluid Grid**: Адаптивная сетка без фиксированных ограничений
- **Proportional Scaling**: Пропорциональное масштабирование всех элементов
- **Premium Typography**: Современная типографическая иерархия
- **Consistent Spacing**: Единая система отступов
- **Accessible Design**: Соответствие стандартам доступности

## 🏗️ Grid система

### Основная сетка

```css
.llg-grid {
  @apply grid grid-cols-4 md:grid-cols-8 xl:grid-cols-12;
  @apply llg-gap llg-spacing;
}

.llg-subgrid {
  @apply grid grid-cols-4 md:grid-cols-8 xl:grid-cols-10;
  @apply llg-gap-column;
}

.llg-container {
  @apply max-w-[2400px] mx-auto;
}
```

### Отступы и промежутки

```css
.llg-gap {
  @apply gap-[13px] md:gap-[20px] xl:gap-[24px];
}

.llg-gap-column {
  @apply gap-x-[13px] gap-y-0 md:gap-x-[20px] xl:gap-x-[24px];
}

.llg-spacing {
  @apply px-[16px] md:px-[18px] lg:px-[28px] xl:px-[30px];
}
```

### Breakpoints

```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 576px;   /* Small devices */
  --breakpoint-md: 768px;   /* Medium devices */
  --breakpoint-lg: 1024px;  /* Large devices */
  --breakpoint-xl: 1280px;  /* Extra large devices */
  --breakpoint-2xl: 1536px; /* 2X large devices */
  --breakpoint-3xl: 1920px; /* 3X large devices */
  --breakpoint-edge: 2400px; /* Edge case - center content */
}
```

## 🎯 Цветовая палитра

### Основные цвета

```css
:root {
  /* Primary - основной фиолетовый */
  --llg-primary-50: #f3f0ff;
  --llg-primary-100: #e9e2ff;
  --llg-primary-200: #d6ccff;
  --llg-primary-300: #b8a3ff;
  --llg-primary-400: #9470ff;
  --llg-primary-500: #580eb8;  /* Основной цвет */
  --llg-primary-600: #4c0ca3;
  --llg-primary-700: #420a8e;
  --llg-primary-800: #380879;
  --llg-primary-900: #2e0664;
  
  /* Secondary - дополнительные оттенки */
  --llg-secondary-50: #fafafa;
  --llg-secondary-100: #f4f4f5;
  --llg-secondary-200: #e4e4e7;
  --llg-secondary-300: #d4d4d8;
  --llg-secondary-400: #a1a1aa;
  --llg-secondary-500: #71717a;
  --llg-secondary-600: #52525b;
  --llg-secondary-700: #3f3f46;
  --llg-secondary-800: #27272a;
  --llg-secondary-900: #18181b;
  
  /* Accent - акцентные цвета */
  --llg-accent-success: #10b981;
  --llg-accent-warning: #f59e0b;
  --llg-accent-error: #ef4444;
  --llg-accent-info: #3b82f6;
  
  /* Semantic colors */
  --llg-white: #ffffff;
  --llg-black: #000000;
  --llg-background: #fafafa;
  --llg-surface: #ffffff;
  --llg-border: #e4e4e7;
}
```

### Применение цветов

```css
/* Backgrounds */
.llg-bg-primary { background-color: var(--llg-primary-500); }
.llg-bg-white { background-color: var(--llg-white); }
.llg-bg-black { background-color: var(--llg-black); }

/* Text colors */
.llg-text-primary { color: var(--llg-primary-500); }
.llg-text-white { color: var(--llg-white); }
.llg-text-black { color: var(--llg-black); }
.llg-text-secondary { color: var(--llg-secondary-600); }

/* Border colors */
.llg-border-primary { border-color: var(--llg-primary-500); }
.llg-border-secondary { border-color: var(--llg-border); }
```

## ✍️ Типографика

### Шрифты

```css
/* Google Fonts импорты */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Заголовки - Space Grotesk (геометрический, современный) */
  --llg-font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Основной текст - Open Sans (читаемый, нейтральный) */
  --llg-font-primary: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Моноширинный - для кода */
  --llg-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Шрифтовая пара

**Space Grotesk + Open Sans** - идеальная комбинация для юридического сайта:

- **Space Grotesk** (заголовки) - геометрический, современный, похож на Monument Grotesk
- **Open Sans** (основной текст) - максимальная читаемость, нейтральный, проверенный

### Применение шрифтов

```css
/* Заголовки - Space Grotesk */
.llg-display, .llg-hero, .llg-title,
.llg-heading-xl, .llg-heading-l, .llg-heading-m, .llg-heading-s {
  font-family: var(--llg-font-display); /* Space Grotesk */
}

/* Основной текст - Open Sans */
.llg-body-l, .llg-body, .llg-body-s,
.llg-caption, .llg-small {
  font-family: var(--llg-font-primary); /* Open Sans */
}
```

### Типографическая шкала

```css
/* Display - для героев и больших заголовков */
.llg-display {
  @apply text-[120px] leading-[120px] tracking-[-0.03em]
    md:text-[180px] md:leading-[180px]
    xl:text-[240px] xl:leading-[240px];
  font-family: var(--llg-font-display);
  font-weight: 700;
}

/* Hero - для главных заголовков */
.llg-hero {
  @apply text-[80px] leading-[80px] tracking-[-0.03em]
    md:text-[120px] md:leading-[120px]
    xl:text-[160px] xl:leading-[160px];
  font-family: var(--llg-font-display);
  font-weight: 600;
}

/* Title - для заголовков секций */
.llg-title {
  @apply text-[clamp(42px,8vw,72px)] leading-[clamp(42px,8vw,72px)] tracking-[-0.03em]
    md:text-[80px] md:leading-[80px]
    xl:text-[120px] xl:leading-[120px];
  font-family: var(--llg-font-display);
  font-weight: 600;
}

/* Heading XL */
.llg-heading-xl {
  @apply text-[48px] leading-[48px] tracking-[-0.03em]
    md:text-[64px] md:leading-[64px]
    xl:text-[80px] xl:leading-[80px];
  font-family: var(--llg-font-display);
  font-weight: 600;
}

/* Heading L */
.llg-heading-l {
  @apply text-[36px] leading-[36px] tracking-[-0.03em]
    md:text-[48px] md:leading-[48px]
    xl:text-[56px] xl:leading-[56px];
  font-family: var(--llg-font-display);
  font-weight: 600;
}

/* Heading M */
.llg-heading-m {
  @apply text-[28px] leading-[28px] tracking-[-0.03em]
    md:text-[32px] md:leading-[36px]
    xl:text-[40px] xl:leading-[44px];
  font-family: var(--llg-font-display);
  font-weight: 600;
}

/* Heading S */
.llg-heading-s {
  @apply text-[24px] leading-[28px] tracking-[-0.03em]
    md:text-[28px] md:leading-[32px]
    xl:text-[32px] xl:leading-[36px];
  font-family: var(--llg-font-display);
  font-weight: 600;
}

/* Body Large */
.llg-body-l {
  @apply text-[20px] leading-[28px] tracking-[-0.03em]
    md:text-[22px] md:leading-[32px]
    xl:text-[24px] xl:leading-[34px];
  font-family: var(--llg-font-primary);
  font-weight: 400;
}

/* Body Regular */
.llg-body {
  @apply text-[18px] leading-[26px] tracking-[-0.03em]
    md:text-[19px] md:leading-[28px]
    xl:text-[20px] xl:leading-[30px];
  font-family: var(--llg-font-primary);
  font-weight: 400;
}

/* Body Small */
.llg-body-s {
  @apply text-[16px] leading-[24px] tracking-[-0.03em]
    md:text-[17px] md:leading-[26px]
    xl:text-[18px] xl:leading-[28px];
  font-family: var(--llg-font-primary);
  font-weight: 400;
}

/* Caption */
.llg-caption {
  @apply text-[14px] leading-[20px] tracking-[-0.03em]
    md:text-[15px] md:leading-[22px]
    xl:text-[16px] xl:leading-[24px];
  font-family: var(--llg-font-primary);
  font-weight: 400;
}

/* Small */
.llg-small {
  @apply text-[12px] leading-[16px] tracking-[-0.03em]
    md:text-[13px] md:leading-[18px]
    xl:text-[14px] xl:leading-[20px];
  font-family: var(--llg-font-primary);
  font-weight: 400;
}
```

## 📏 Spacing система

### Базовая шкала

```css
:root {
  /* Base spacing unit: 4px */
  --llg-space-1: 0.25rem;   /* 4px */
  --llg-space-2: 0.5rem;    /* 8px */
  --llg-space-3: 0.75rem;   /* 12px */
  --llg-space-4: 1rem;      /* 16px */
  --llg-space-5: 1.25rem;   /* 20px */
  --llg-space-6: 1.5rem;    /* 24px */
  --llg-space-8: 2rem;      /* 32px */
  --llg-space-10: 2.5rem;   /* 40px */
  --llg-space-12: 3rem;     /* 48px */
  --llg-space-16: 4rem;     /* 64px */
  --llg-space-20: 5rem;     /* 80px */
  --llg-space-24: 6rem;     /* 96px */
  --llg-space-32: 8rem;     /* 128px */
  --llg-space-40: 10rem;    /* 160px */
  --llg-space-48: 12rem;    /* 192px */
  --llg-space-56: 14rem;    /* 224px */
  --llg-space-64: 16rem;    /* 256px */
}
```

### Адаптивные отступы

```css
/* Section spacing */
.llg-section-spacing {
  @apply py-[64px] md:py-[80px] xl:py-[120px];
}

.llg-section-spacing-sm {
  @apply py-[40px] md:py-[60px] xl:py-[80px];
}

.llg-section-spacing-lg {
  @apply py-[80px] md:py-[120px] xl:py-[160px];
}

/* Component spacing */
.llg-component-spacing {
  @apply mb-[32px] md:mb-[40px] xl:mb-[48px];
}

/* Element spacing */
.llg-element-spacing {
  @apply mb-[16px] md:mb-[20px] xl:mb-[24px];
}
```

## 🧩 Компоненты

### Кнопки

```css
/* Base button */
.llg-button {
  @apply inline-flex items-center justify-center;
  @apply px-[24px] py-[16px];
  @apply llg-body font-medium;
  @apply border border-solid;
  @apply transition-all duration-300 ease-out;
  @apply cursor-pointer;
  border-radius: 0;
}

/* Primary button */
.llg-button--primary {
  @apply llg-button;
  @apply bg-llg-primary text-white border-llg-primary;
}

.llg-button--primary:hover {
  @apply bg-llg-primary-600 border-llg-primary-600;
}

/* Secondary button */
.llg-button--secondary {
  @apply llg-button;
  @apply bg-transparent text-llg-primary border-llg-primary;
}

.llg-button--secondary:hover {
  @apply bg-llg-primary text-white;
}

/* Button sizes */
.llg-button--sm {
  @apply px-[16px] py-[12px] llg-body-s;
}

.llg-button--lg {
  @apply px-[32px] py-[20px] llg-body-l;
}
```

### Ссылки

```css
.llg-link {
  @apply relative inline-block;
  @apply transition-all duration-300 ease-out;
}

.llg-link::after {
  content: '';
  @apply absolute bottom-0 left-0;
  @apply w-full h-[1px];
  @apply bg-current;
  @apply scale-x-100 origin-left;
  @apply transition-transform duration-300 ease-out;
}

.llg-link:hover::after {
  @apply scale-x-0 origin-right;
}

/* Link variants */
.llg-link--primary {
  @apply text-llg-primary;
}

.llg-link--white {
  @apply text-white;
}

.llg-link--black {
  @apply text-black;
}
```

### Секции

```css
.llg-section {
  @apply llg-section-spacing llg-spacing;
}

.llg-section--full-height {
  @apply min-h-screen;
}

.llg-section--centered {
  @apply flex items-center justify-center;
}

/* Section backgrounds */
.llg-section--primary {
  @apply bg-llg-primary text-white;
}

.llg-section--white {
  @apply bg-white text-black;
}

.llg-section--black {
  @apply bg-black text-white;
}
```

## 🎭 Анимации

### Базовые переходы

```css
:root {
  --llg-transition-fast: 150ms ease-out;
  --llg-transition-normal: 300ms ease-out;
  --llg-transition-slow: 500ms ease-out;
}

.llg-transition {
  transition: all var(--llg-transition-normal);
}

.llg-transition--fast {
  transition: all var(--llg-transition-fast);
}

.llg-transition--slow {
  transition: all var(--llg-transition-slow);
}
```

### Анимации появления

```css
.llg-fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.llg-fade-in--visible {
  opacity: 1;
  transform: translateY(0);
}

.llg-slide-up {
  transform: translateY(100px);
  transition: transform 0.8s ease-out;
}

.llg-slide-up--visible {
  transform: translateY(0);
}
```

## 📱 Адаптивность

### Принципы

1. **Mobile First**: Дизайн начинается с мобильных устройств
2. **Fluid Scaling**: Элементы масштабируются пропорционально
3. **Content Priority**: Контент адаптируется по приоритету
4. **Touch Friendly**: Интерфейс оптимизирован для касаний

### Адаптивные утилиты

```css
/* Hide/show on different screens */
.llg-hidden-mobile {
  @apply block md:hidden;
}

.llg-hidden-desktop {
  @apply hidden md:block;
}

.llg-mobile-only {
  @apply block md:hidden;
}

.llg-desktop-only {
  @apply hidden md:block;
}

/* Responsive text alignment */
.llg-text-center-mobile {
  @apply text-center md:text-left;
}

.llg-text-left-desktop {
  @apply text-center md:text-left;
}
```

## 🎨 Примеры использования

### Hero секция

```html
<section class="llg-section llg-section--primary llg-section--full-height llg-section--centered">
  <div class="llg-container">
    <div class="llg-grid">
      <div class="col-span-4 md:col-span-8 xl:col-span-10">
        <h1 class="llg-hero llg-text-center-mobile">
          Professional Legal Services
        </h1>
        <p class="llg-body-l llg-element-spacing llg-text-center-mobile">
          Expert legal representation for your business needs
        </p>
        <div class="flex justify-center md:justify-start">
          <button class="llg-button llg-button--secondary">
            Get Started
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Контентная секция

```html
<section class="llg-section llg-section--white">
  <div class="llg-container">
    <div class="llg-grid">
      <div class="col-span-4 md:col-span-6 xl:col-span-8">
        <h2 class="llg-heading-l llg-component-spacing">
          Our Services
        </h2>
        <p class="llg-body llg-element-spacing">
          We provide comprehensive legal services tailored to your needs.
        </p>
        <a href="#" class="llg-link llg-link--primary">
          Learn more about our services
        </a>
      </div>
    </div>
  </div>
</section>
```

## 🔧 Технические требования

### CSS архитектура

1. **Tailwind CSS**: Основной фреймворк
2. **CSS Custom Properties**: Для динамических значений
3. **PostCSS**: Для обработки стилей
4. **CSS Layers**: Для организации стилей

### Структура файлов

```
styles/
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── variables.css
├── components/
│   ├── buttons.css
│   ├── links.css
│   ├── sections.css
│   └── forms.css
├── utilities/
│   ├── spacing.css
│   ├── colors.css
│   └── responsive.css
└── main.css
```

## ♿ Доступность

### Принципы

1. **Контрастность**: Минимум 4.5:1 для обычного текста
2. **Фокус**: Видимые индикаторы фокуса
3. **Семантика**: Правильная HTML разметка
4. **Навигация**: Поддержка клавиатуры

### Реализация

```css
/* Focus states */
.llg-button:focus-visible,
.llg-link:focus-visible {
  @apply outline-2 outline-offset-2 outline-llg-primary;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .llg-button--primary {
    @apply border-2;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .llg-transition,
  .llg-fade-in,
  .llg-slide-up {
    transition: none;
  }
}
```

## 📊 Производительность

### Оптимизации

1. **Critical CSS**: Инлайн критических стилей
2. **CSS Purging**: Удаление неиспользуемых стилей
3. **Minification**: Сжатие CSS файлов
4. **Caching**: Кеширование стилей

### Метрики

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

---

## 📝 Changelog

### v1.0.0 (14 июля 2025)
- ✅ Создание базовой дизайн-системы
- ✅ Grid система на основе HugeInc
- ✅ Типографическая шкала
- ✅ Цветовая палитра с #580eb8
- ✅ Базовые компоненты
- ✅ Адаптивная система

---

**Создано для Lucrative Legal Group v3**  
*Дата создания: 14 июля 2025*

# 🧩 Структура компонентов

## 📋 Обзор

Детальное описание структуры и организации компонентов в проекте Lucrative Legal Group v3.

## 🏗️ Анатомия компонента

### Базовая структура

```
components/[component-name]/
├── [component-name].html      # HTML разметка
├── [component-name].scss      # Стили компонента
├── [component-name].js        # JavaScript логика
├── [component-name].php       # PHP для WordPress
├── README.md                  # Документация
├── config.json               # Конфигурация компонента
└── tests/                    # Тесты (опционально)
    ├── [component-name].test.js
    └── fixtures/
        └── sample-data.json
```

## 📝 HTML структура

### Принципы разметки:

1. **Семантичность**: Использование семантических тегов
2. **Доступность**: ARIA атрибуты, alt текст
3. **BEM классы**: Блок__элемент--модификатор
4. **Data атрибуты**: Для JavaScript хуков

### Пример HTML компонента:

```html
<!-- components/hero/hero.html -->
<section class="hero hero--fullscreen" data-component="hero" data-background="{{background}}">
  <div class="hero__container">
    <div class="hero__content">
      <h1 class="hero__title">{{title}}</h1>
      <p class="hero__subtitle">{{subtitle}}</p>
      <div class="hero__actions">
        <a href="{{cta_link}}" class="hero__cta btn btn--primary">{{cta_text}}</a>
      </div>
    </div>
    <div class="hero__media">
      <div class="hero__background" data-bg-src="{{background}}"></div>
    </div>
  </div>
  <div class="hero__scroll-indicator" data-scroll-target="next-section">
    <span class="hero__scroll-text">Scroll Down</span>
    <div class="hero__scroll-arrow"></div>
  </div>
</section>
```

## 🎨 SCSS структура

### Принципы стилизации:

1. **BEM методология**: Четкая структура классов
2. **SCSS переменные**: Локальные переменные компонента
3. **Миксины**: Переиспользуемые стили
4. **Модульность**: Изоляция стилей

### Пример SCSS компонента:

```scss
// components/hero/hero.scss

// Локальные переменные компонента
$hero-min-height: 100vh;
$hero-padding: var(--spacing-lg);
$hero-title-size: clamp(2rem, 5vw, 4rem);

// Основной блок
.hero {
  position: relative;
  min-height: $hero-min-height;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $hero-padding;
  overflow: hidden;

  // Модификаторы
  &--fullscreen {
    height: 100vh;
  }

  &--centered {
    text-align: center;
  }

  // Элементы
  &__container {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: var(--container-max-width);
    margin: 0 auto;
  }

  &__content {
    position: relative;
    z-index: 3;
  }

  &__title {
    font-size: $hero-title-size;
    font-weight: var(--font-weight-bold);
    line-height: 1.2;
    margin-bottom: var(--spacing-md);
    color: var(--color-text-primary);

    @include media-query(mobile) {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
    }
  }

  &__subtitle {
    font-size: var(--font-size-lg);
    line-height: 1.4;
    margin-bottom: var(--spacing-lg);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;

    @include media-query(mobile) {
      flex-direction: column;
    }
  }

  &__cta {
    // Стили кнопки наследуются от .btn
  }

  &__media {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      z-index: 1;
    }
  }

  &__scroll-indicator {
    position: absolute;
    bottom: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  &__scroll-text {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--color-text-light);
    margin-bottom: var(--spacing-xs);
  }

  &__scroll-arrow {
    width: 20px;
    height: 20px;
    border-right: 2px solid var(--color-text-light);
    border-bottom: 2px solid var(--color-text-light);
    transform: rotate(45deg);
    margin: 0 auto;
    animation: bounce 2s infinite;
  }
}

// Анимации
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) rotate(45deg);
  }
  40% {
    transform: translateY(-10px) rotate(45deg);
  }
  60% {
    transform: translateY(-5px) rotate(45deg);
  }
}

// Состояния
.hero[data-state="loading"] {
  .hero__content {
    opacity: 0;
    transform: translateY(20px);
  }
}

.hero[data-state="loaded"] {
  .hero__content {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
}
```

## 📜 JavaScript структура

### Принципы разработки:

1. **ES6 Classes**: Объектно-ориентированный подход
2. **Event-driven**: Взаимодействие через события
3. **Lifecycle methods**: init, destroy, update
4. **Error handling**: Обработка ошибок
5. **Performance**: Оптимизация производительности

### Пример JavaScript компонента:

```javascript
// components/hero/hero.js

export class HeroComponent {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.defaults, ...options };
    this.state = 'loading';
    
    // Элементы
    this.titleElement = null;
    this.backgroundElement = null;
    this.scrollIndicator = null;
    
    // Анимации
    this.animations = [];
    
    this.init();
  }

  // Настройки по умолчанию
  get defaults() {
    return {
      animationDuration: 1000,
      animationDelay: 200,
      autoplay: true,
      parallax: true,
      scrollIndicator: true
    };
  }

  // Инициализация
  async init() {
    try {
      this.findElements();
      this.setupEventListeners();
      this.loadBackground();
      await this.startAnimations();
      this.setState('loaded');
      
      console.log('✅ Hero component initialized');
    } catch (error) {
      console.error('❌ Hero component initialization failed:', error);
      this.setState('error');
    }
  }

  // Поиск элементов
  findElements() {
    this.titleElement = this.element.querySelector('.hero__title');
    this.backgroundElement = this.element.querySelector('.hero__background');
    this.scrollIndicator = this.element.querySelector('.hero__scroll-indicator');
    
    if (!this.titleElement) {
      throw new Error('Hero title element not found');
    }
  }

  // Настройка событий
  setupEventListeners() {
    // Скролл индикатор
    if (this.scrollIndicator && this.options.scrollIndicator) {
      this.scrollIndicator.addEventListener('click', this.handleScrollClick.bind(this));
    }

    // Параллакс эффект
    if (this.options.parallax) {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    // Изменение размера окна
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  // Загрузка фонового изображения
  loadBackground() {
    if (!this.backgroundElement) return;

    const bgSrc = this.backgroundElement.dataset.bgSrc;
    if (!bgSrc) return;

    const img = new Image();
    img.onload = () => {
      this.backgroundElement.style.backgroundImage = `url(${bgSrc})`;
      this.backgroundElement.classList.add('loaded');
    };
    img.onerror = () => {
      console.warn('Failed to load hero background image:', bgSrc);
    };
    img.src = bgSrc;
  }

  // Запуск анимаций
  async startAnimations() {
    if (!this.options.autoplay) return;

    // Анимация заголовка
    if (this.titleElement) {
      const titleAnimation = this.animateTitle();
      this.animations.push(titleAnimation);
    }

    // Анимация скролл индикатора
    if (this.scrollIndicator) {
      const scrollAnimation = this.animateScrollIndicator();
      this.animations.push(scrollAnimation);
    }

    // Ждем завершения всех анимаций
    await Promise.all(this.animations);
  }

  // Анимация заголовка
  animateTitle() {
    return new Promise(resolve => {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(this.titleElement, 
          { 
            opacity: 0, 
            y: 50 
          },
          { 
            opacity: 1, 
            y: 0, 
            duration: this.options.animationDuration / 1000,
            delay: this.options.animationDelay / 1000,
            ease: 'power2.out',
            onComplete: resolve
          }
        );
      } else {
        // Fallback CSS анимация
        this.titleElement.style.animation = `fadeInUp ${this.options.animationDuration}ms ease-out ${this.options.animationDelay}ms forwards`;
        setTimeout(resolve, this.options.animationDuration + this.options.animationDelay);
      }
    });
  }

  // Анимация скролл индикатора
  animateScrollIndicator() {
    return new Promise(resolve => {
      if (!this.scrollIndicator) {
        resolve();
        return;
      }

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(this.scrollIndicator,
          { 
            opacity: 0, 
            y: 20 
          },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.6,
            delay: 1,
            ease: 'power2.out',
            onComplete: resolve
          }
        );
      } else {
        setTimeout(() => {
          this.scrollIndicator.style.opacity = '1';
          resolve();
        }, 1000);
      }
    });
  }

  // Обработка клика по скролл индикатору
  handleScrollClick(event) {
    event.preventDefault();
    
    const target = event.currentTarget.dataset.scrollTarget;
    const targetElement = document.getElementById(target) || 
                         document.querySelector(`[data-section="${target}"]`);
    
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Обработка скролла (параллакс)
  handleScroll() {
    if (!this.options.parallax || !this.backgroundElement) return;

    const scrollY = window.pageYOffset;
    const rate = scrollY * -0.5;
    
    this.backgroundElement.style.transform = `translateY(${rate}px)`;
  }

  // Обработка изменения размера
  handleResize() {
    // Пересчет размеров при необходимости
    this.updateDimensions();
  }

  // Обновление размеров
  updateDimensions() {
    // Логика обновления размеров
  }

  // Установка состояния
  setState(newState) {
    this.state = newState;
    this.element.dataset.state = newState;
    
    // Эмитируем событие изменения состояния
    this.element.dispatchEvent(new CustomEvent('hero:stateChange', {
      detail: { state: newState }
    }));
  }

  // Обновление опций
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  // Уничтожение компонента
  destroy() {
    // Останавливаем анимации
    this.animations.forEach(animation => {
      if (animation && animation.kill) {
        animation.kill();
      }
    });

    // Удаляем обработчики событий
    if (this.scrollIndicator) {
      this.scrollIndicator.removeEventListener('click', this.handleScrollClick);
    }
    
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);

    // Очищаем ссылки
    this.element = null;
    this.titleElement = null;
    this.backgroundElement = null;
    this.scrollIndicator = null;
    this.animations = [];

    console.log('🗑️ Hero component destroyed');
  }

  // Статический метод для автоинициализации
  static autoInit(selector = '[data-component="hero"]') {
    const elements = document.querySelectorAll(selector);
    const instances = [];

    elements.forEach(element => {
      if (!element.heroInstance) {
        element.heroInstance = new HeroComponent(element);
        instances.push(element.heroInstance);
      }
    });

    return instances;
  }
}

// Автоинициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  HeroComponent.autoInit();
});

// Экспорт для использования в других модулях
export default HeroComponent;
```

## 🔌 PHP структура (WordPress)

### Принципы PHP компонентов:

1. **Переменные**: Извлечение из $args
2. **Безопасность**: Экранирование вывода
3. **Гибкость**: Настраиваемые параметры
4. **Хуки**: WordPress actions и filters

### Пример PHP компонента:

```php
<?php
// components/hero/hero.php

// Настройки по умолчанию
$defaults = [
    'title' => 'Professional Legal Services',
    'subtitle' => 'Expert legal consultation and comprehensive solutions',
    'background' => '',
    'cta_text' => 'Get Started',
    'cta_link' => '#contact',
    'show_scroll_indicator' => true,
    'css_class' => '',
    'parallax' => true
];

// Объединяем с переданными параметрами
$args = wp_parse_args($args ?? [], $defaults);

// Извлекаем переменные
extract($args);

// Генерируем уникальный ID
$component_id = 'hero-' . uniqid();

// CSS классы
$css_classes = ['hero', 'hero--fullscreen'];
if (!empty($css_class)) {
    $css_classes[] = $css_class;
}
if ($parallax) {
    $css_classes[] = 'hero--parallax';
}

// Data атрибуты
$data_attrs = [
    'data-component' => 'hero',
    'data-parallax' => $parallax ? 'true' : 'false'
];

// Подключаем стили и скрипты
wp_enqueue_style('hero-component', get_template_directory_uri() . '/components/hero/hero.css');
wp_enqueue_script('hero-component', get_template_directory_uri() . '/components/hero/hero.js', ['jquery'], '1.0.0', true);

// Применяем фильтры WordPress
$title = apply_filters('hero_title', $title);
$subtitle = apply_filters('hero_subtitle', $subtitle);
?>

<section 
    id="<?php echo esc_attr($component_id); ?>" 
    class="<?php echo esc_attr(implode(' ', $css_classes)); ?>"
    <?php foreach ($data_attrs as $attr => $value): ?>
        <?php echo esc_attr($attr); ?>="<?php echo esc_attr($value); ?>"
    <?php endforeach; ?>
>
    <div class="hero__container">
        <div class="hero__content">
            <?php if (!empty($title)): ?>
                <h1 class="hero__title"><?php echo esc_html($title); ?></h1>
            <?php endif; ?>
            
            <?php if (!empty($subtitle)): ?>
                <p class="hero__subtitle"><?php echo esc_html($subtitle); ?></p>
            <?php endif; ?>
            
            <?php if (!empty($cta_text) && !empty($cta_link)): ?>
                <div class="hero__actions">
                    <a href="<?php echo esc_url($cta_link); ?>" class="hero__cta btn btn--primary">
                        <?php echo esc_html($cta_text); ?>
                    </a>
                </div>
            <?php endif; ?>
        </div>
        
        <?php if (!empty($background)): ?>
            <div class="hero__media">
                <div class="hero__background" data-bg-src="<?php echo esc_url($background); ?>"></div>
            </div>
        <?php endif; ?>
    </div>
    
    <?php if ($show_scroll_indicator): ?>
        <div class="hero__scroll-indicator" data-scroll-target="next-section">
            <span class="hero__scroll-text"><?php _e('Scroll Down', 'textdomain'); ?></span>
            <div class="hero__scroll-arrow"></div>
        </div>
    <?php endif; ?>
</section>

<?php
// WordPress action для дополнительной функциональности
do_action('after_hero_component', $args);
?>
```

## 📋 Конфигурация компонента

### config.json

```json
{
  "name": "hero",
  "version": "1.0.0",
  "description": "Hero section component with background image and call-to-action",
  "category": "layout",
  "tags": ["hero", "banner", "cta", "background"],
  "dependencies": {
    "css": [],
    "js": ["gsap"],
    "php": []
  },
  "options": {
    "title": {
      "type": "string",
      "default": "Professional Legal Services",
      "required": true,
      "description": "Main heading text"
    },
    "subtitle": {
      "type": "string",
      "default": "",
      "required": false,
      "description": "Subtitle text"
    },
    "background": {
      "type": "string",
      "default": "",
      "required": false,
      "description": "Background image URL"
    },
    "cta_text": {
      "type": "string",
      "default": "Get Started",
      "required": false,
      "description": "Call-to-action button text"
    },
    "cta_link": {
      "type": "string",
      "default": "#contact",
      "required": false,
      "description": "Call-to-action button link"
    },
    "parallax": {
      "type": "boolean",
      "default": true,
      "required": false,
      "description": "Enable parallax effect"
    }
  },
  "breakpoints": {
    "mobile": "320px",
    "tablet": "768px",
    "desktop": "1024px"
  },
  "performance": {
    "critical": true,
    "lazy_load": false,
    "preload": ["background"]
  }
}
```

## 📚 Документация компонента

### README.md

```markdown
# Hero Component

Полноэкранная hero секция с фоновым изображением и призывом к действию.

## Использование

### HTML
```html
<div data-component="hero" data-background="image.jpg">
  <!-- Контент -->
</div>
```

### JavaScript
```javascript
import { HeroComponent } from './hero.js';
const hero = new HeroComponent(element, options);
```

### PHP (WordPress)
```php
<?php get_component('hero', [
  'title' => 'Custom Title',
  'background' => 'custom-bg.jpg'
]); ?>
```

## Опции

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| title | string | "Professional Legal Services" | Заголовок |
| subtitle | string | "" | Подзаголовок |
| background | string | "" | Фоновое изображение |
| parallax | boolean | true | Параллакс эффект |

## События

- `hero:stateChange` - Изменение состояния компонента
- `hero:loaded` - Компонент загружен
- `hero:destroyed` - Компонент уничтожен

## Методы

- `init()` - Инициализация
- `destroy()` - Уничтожение
- `updateOptions(options)` - Обновление опций
- `setState(state)` - Установка состояния
```

---

**Дата создания**: 14 июля 2025  
**Версия**: 1.0  
**Статус**: В разработке

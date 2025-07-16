# 🎨 Sass Migration Guide

> Руководство по современному Sass с @use в Lucrative Legal Group v3

## 📋 Обзор

Проект использует современный Sass с модульной системой `@use` вместо устаревшего `@import`.

## 🎯 Ключевые принципы

### Модульная система @use

```scss
// main.scss
@use 'variables' as *;  // Глобальные переменные
@use 'base';
@use 'grid';
@use 'utilities';

// CSS @import для внешних ресурсов в конце
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

### Импорт в компонентах

```scss
// _base.scss
@use "sass:color";
@use "variables" as *;

.button {
  color: $primary-color;
  background: color.adjust($primary-color, $lightness: -10%);
}
```

## 📁 Структура файлов

```
src/styles/
├── main.scss              # Главный файл с @use
├── _variables.scss         # Переменные
├── _base.scss             # Базовые стили
├── _grid.scss             # Grid система
├── _utilities.scss        # Утилиты
├── abstracts/             # Абстракции
├── base/                  # Базовые стили
├── components/            # Компоненты
├── layout/               # Лейауты
└── utilities/            # Утилиты
```

## 🔧 Правила использования

### 1. Порядок @use

```scss
// ✅ @use всегда в начале файла
@use "sass:color";
@use "variables" as *;
@use "mixins" as mix;

.component {
  color: $primary-color;
}
```

### 2. Namespace стратегии

```scss
// Глобальный namespace для переменных
@use "variables" as *;
$primary-color  // Доступно напрямую

// Именованный namespace для миксинов
@use "mixins" as mix;
@include mix.button-style;

// Автоматический namespace
@use "utilities";
@include utilities.text-center;
```

### 3. Встроенные модули Sass

```scss
// Цветовые функции
@use "sass:color";
color.adjust($color, $lightness: -10%)
color.scale($color, $lightness: -25%)

// Математические функции
@use "sass:math";
math.div(100px, 2)

// Строковые функции
@use "sass:string";
string.to-upper-case($string)
```

## 🎨 Современные color functions

### Замена устаревших функций

```scss
@use "sass:color";

// Современные функции
color.adjust($color, $lightness: -10%)     // Вместо darken()
color.adjust($color, $lightness: 10%)      // Вместо lighten()
color.adjust($color, $alpha: -0.2)         // Вместо transparentize()
color.scale($color, $lightness: -25%)      // Пропорциональное изменение
color.mix($color1, $color2, 50%)           // Смешивание цветов
```

## 🔄 Gulp конфигурация

### Современная настройка

```javascript
// gulpfile.js
const sass = require('gulp-sass')(require('sass'));

function styles() {
  return gulp
    .src('src/styles/main.scss')
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: ['node_modules']
    }))
    .pipe(gulp.dest('dist/css/'));
}
```

## 🚨 Важные моменты

### Что нужно помнить

1. **@use только в начале** - до любых CSS правил
2. **Один раз на файл** - каждый модуль импортируется только один раз
3. **Явные зависимости** - каждый файл импортирует то что использует
4. **Namespace изоляция** - переменные не конфликтуют

### Отладка проблем

```scss
// ❌ Ошибка: @use после CSS правил
.component { color: red; }
@use "variables" as *;

// ✅ Правильно: @use в начале
@use "variables" as *;
.component { color: red; }
```

## 📊 Преимущества

- ✅ **Производительность** - файлы компилируются один раз
- ✅ **Безопасность** - нет случайных перезаписей переменных
- ✅ **Читаемость** - явные зависимости между файлами
- ✅ **Современность** - актуальный стандарт Sass
- ✅ **Отсутствие warnings** - никаких deprecation предупреждений

## 🔧 Команды для работы

```bash
# Компиляция SCSS
npx gulp styles

# Отслеживание изменений
npx gulp dev

# Production сборка
npx gulp build
```

---

**Создано для Lucrative Legal Group v3**  
*Дата создания: 14 июля 2025*

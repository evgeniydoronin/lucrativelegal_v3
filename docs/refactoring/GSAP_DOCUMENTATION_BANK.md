# 📚 Банк знаний GSAP документации для рефакторинга

## 🎯 Цель документа

Этот документ содержит структурированные ссылки на официальную документацию GSAP, которые понадобятся при решении каждой из выявленных проблем рефакторинга. Перед началом работы над каждой проблемой необходимо изучить соответствующие разделы документации.

---

## 🔴 Проблема #001: GSAP ScrollTrigger конфликты

### 📖 Обязательная документация для изучения:

#### **Основы ScrollTrigger**
- **[ScrollTrigger Plugin](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)** - Полная документация по ScrollTrigger
- **[ScrollTrigger.create()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.create/)** - Создание standalone ScrollTrigger
- **[ScrollTrigger.refresh()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh())** - Пересчет позиций

#### **Управление производительностью**
- **[ScrollTrigger.config()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config/)** - Глобальные настройки
- **[refreshPriority](https://gsap.com/docs/v3/Plugins/ScrollTrigger/#refreshPriority)** - Приоритет обновления
- **[ScrollTrigger.sort()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.sort())** - Сортировка порядка обновления

#### **Методы управления**
- **[ScrollTrigger.getAll()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.getAll())** - Получение всех экземпляров
- **[ScrollTrigger.killAll()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.killAll())** - Удаление всех ScrollTrigger
- **[ScrollTrigger.getById()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.getById())** - Поиск по ID

#### **Интеграция с Timeline**
- **[Timeline](https://gsap.com/docs/v3/GSAP/Timeline/)** - Основы работы с Timeline
- **[gsap.timeline()](https://gsap.com/docs/v3/GSAP/gsap.timeline())** - Создание Timeline

### 🎯 Ключевые концепции для изучения:
- Как работает система refreshPriority
- Правильный порядок создания ScrollTrigger
- Методы очистки и управления жизненным циклом
- Интеграция ScrollTrigger с Timeline

---

## 🔴 Проблема #002: Сложность Hero Cube компонента

### 📖 Обязательная документация для изучения:

#### **Основы GSAP**
- **[GSAP Object](https://gsap.com/docs/v3/GSAP/)** - Основной объект GSAP
- **[Tween](https://gsap.com/docs/v3/GSAP/Tween/)** - Базовый класс анимации
- **[Timeline](https://gsap.com/docs/v3/GSAP/Timeline/)** - Контейнер для анимаций

#### **Методы создания анимаций**
- **[gsap.to()](https://gsap.com/docs/v3/GSAP/gsap.to/)** - Анимация к значению
- **[gsap.from()](https://gsap.com/docs/v3/GSAP/gsap.from/)** - Анимация от значения
- **[gsap.fromTo()](https://gsap.com/docs/v3/GSAP/gsap.fromTo/)** - Анимация от-к значению
- **[gsap.set()](https://gsap.com/docs/v3/GSAP/gsap.set/)** - Мгновенная установка значений

#### **Управление Timeline**
- **[Timeline.add()](https://gsap.com/docs/v3/GSAP/Timeline/add/)** - Добавление анимаций
- **[Timeline.to()](https://gsap.com/docs/v3/GSAP/Timeline/to/)** - Добавление to() анимации
- **[Timeline.addLabel()](https://gsap.com/docs/v3/GSAP/Timeline/addLabel/)** - Добавление меток
- **[Position Parameter](https://gsap.com/resources/position-parameter/)** - Позиционирование в Timeline

#### **Методы управления**
- **[Timeline.play()](https://gsap.com/docs/v3/GSAP/Timeline/play/)** - Воспроизведение
- **[Timeline.pause()](https://gsap.com/docs/v3/GSAP/Timeline/pause/)** - Пауза
- **[Timeline.kill()](https://gsap.com/docs/v3/GSAP/Timeline/kill/)** - Удаление
- **[Timeline.progress()](https://gsap.com/docs/v3/GSAP/Timeline/progress/)** - Прогресс

### 🎯 Ключевые концепции для изучения:
- Модульная архитектура Timeline
- Правильное использование меток и позиционирования
- Жизненный цикл анимаций
- Методы очистки и управления памятью

---

## 🔴 Проблема #003: Проблемы производительности

### 📖 Обязательная документация для изучения:

#### **Конфигурация производительности**
- **[gsap.config()](https://gsap.com/docs/v3/GSAP/gsap.config())** - Глобальные настройки GSAP
- **[force3D](https://gsap.com/docs/v3/GSAP/gsap.config()/#force3D)** - Управление GPU ускорением
- **[autoSleep](https://gsap.com/docs/v3/GSAP/gsap.config()/#autoSleep)** - Автоматическое отключение

#### **Методы оптимизации**
- **[Tween.kill()](https://gsap.com/docs/v3/GSAP/Tween/kill/)** - Удаление анимаций
- **[Timeline.kill()](https://gsap.com/docs/v3/GSAP/Timeline/kill/)** - Удаление Timeline
- **[gsap.killTweensOf()](https://gsap.com/docs/v3/GSAP/gsap.killTweensOf())** - Удаление по объекту

#### **Управление временем**
- **[Timeline.timeScale()](https://gsap.com/docs/v3/GSAP/Timeline/timeScale/)** - Скорость воспроизведения
- **[Tween.timeScale()](https://gsap.com/docs/v3/GSAP/Tween/timeScale/)** - Скорость Tween

#### **ScrollTrigger оптимизация**
- **[ScrollTrigger.config()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config/)** - Настройки производительности
- **[anticipatePin](https://gsap.com/docs/v3/Plugins/ScrollTrigger/#anticipatePin)** - Предвосхищение pin
- **[fastScrollEnd](https://gsap.com/docs/v3/Plugins/ScrollTrigger/#fastScrollEnd)** - Быстрое завершение

### 🎯 Ключевые концепции для изучения:
- Настройки lagSmoothing для плавности
- Управление willChange CSS свойством
- Оптимизация ScrollTrigger refresh
- Правильная очистка анимаций

---

## 🟡 Проблема #004: Дублирование SCSS кода

### 📖 Обязательная документация для изучения:

#### **Основы Sass/SCSS**
- **[Sass Mixins](https://sass-lang.com/documentation/at-rules/mixin)** - Создание и использование миксинов
- **[Sass Functions](https://sass-lang.com/documentation/at-rules/function)** - Создание переиспользуемых функций
- **[Sass Guide](https://sass-lang.com/guide)** - Полное руководство по Sass

#### **Методологии и архитектура CSS**
- **[BEM Methodology](https://getbem.com/introduction/)** - Методология именования CSS классов

### 🎯 Ключевые концепции для изучения:
- Создание и параметризация миксинов
- Организация Sass переменных и функций
- Структурирование CSS архитектуры
- BEM именование для консистентности
- Модульная организация стилей

---

## 🟡 Проблема #005: Архитектура компонентов

### 📖 Обязательная документация для изучения:

#### **Основы управления анимациями**
- **[GSAP Object](https://gsap.com/docs/v3/GSAP/)** - Основной API
- **[gsap.registerPlugin()](https://gsap.com/docs/v3/GSAP/gsap.registerPlugin())** - Регистрация плагинов
- **[gsap.defaults()](https://gsap.com/docs/v3/GSAP/gsap.defaults())** - Настройки по умолчанию

#### **Жизненный цикл анимаций**
- **[Tween.invalidate()](https://gsap.com/docs/v3/GSAP/Tween/invalidate())** - Сброс начальных значений
- **[Timeline.invalidate()](https://gsap.com/docs/v3/GSAP/Timeline/invalidate())** - Сброс Timeline
- **[Tween.revert()](https://gsap.com/docs/v3/GSAP/Tween/revert())** - Возврат к исходному состоянию

#### **Управление состоянием**
- **[Timeline.paused()](https://gsap.com/docs/v3/GSAP/Timeline/paused/)** - Состояние паузы
- **[Timeline.isActive()](https://gsap.com/docs/v3/GSAP/Timeline/isActive/)** - Активность Timeline
- **[Tween.isActive()](https://gsap.com/docs/v3/GSAP/Tween/isActive/)** - Активность Tween

#### **Callbacks и события**
- **[Timeline callbacks](https://gsap.com/docs/v3/GSAP/Timeline/#special-properties-and-callbacks)** - Обратные вызовы
- **[onComplete](https://gsap.com/docs/v3/GSAP/Timeline/#onComplete)** - Завершение
- **[onUpdate](https://gsap.com/docs/v3/GSAP/Timeline/#onUpdate)** - Обновление

### 🎯 Ключевые концепции для изучения:
- Паттерны создания и уничтожения анимаций
- Управление состоянием компонентов
- Правильное использование callbacks
- Методы очистки ресурсов

---

## 🟡 Проблема #006: Дублирование обработчиков событий

### 📖 Обязательная документация для изучения:

#### **Основы JavaScript событий**
- **[JavaScript Events](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events)** - Полное руководство по событиям
- **[addEventListener API](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)** - Документация по addEventListener

#### **Продвинутые техники событий**
- **[Event Delegation](https://javascript.info/event-delegation)** - Делегирование событий
- **[Event Deep Dive](https://web.dev/eventing-deepdive/)** - Глубокое погружение в события

### 🎯 Ключевые концепции для изучения:
- Делегирование событий для оптимизации
- Правильное удаление обработчиков событий
- Предотвращение утечек памяти
- Debouncing и throttling для производительности
- Создание собственных событий (Custom Events)

---

## 🔧 Дополнительные ресурсы для всех проблем

### **Общие концепции GSAP**
- **[GSAP Installation](https://gsap.com/docs/v3/Installation/)** - Установка и подключение
- **[GSAP Getting Started](https://gsap.com/docs/v3/GSAP/gsap.timeline()#getting-started)** - Начало работы
- **[GSAP Eases](https://gsap.com/docs/v3/Eases/)** - Функции плавности

### **Продвинутые техники**
- **[gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia())** - Адаптивные анимации
- **[gsap.context()](https://gsap.com/docs/v3/GSAP/gsap.context())** - Контекст для очистки
- **[gsap.globalTimeline](https://gsap.com/docs/v3/GSAP/gsap.globalTimeline/)** - Глобальная временная шкала

### **Отладка и тестирование**
- **[ScrollTrigger markers](https://gsap.com/docs/v3/Plugins/ScrollTrigger/#markers)** - Визуальные маркеры
- **[Timeline.getChildren()](https://gsap.com/docs/v3/GSAP/Timeline/getChildren/)** - Получение дочерних элементов
- **[ScrollTrigger.getAll()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.getAll())** - Все ScrollTrigger

---

## 📋 Чекбокс изучения документации

### Перед началом каждой проблемы отметьте изученные разделы:

#### **Проблема #001 - ScrollTrigger конфликты**
- [ ] ScrollTrigger Plugin основы
- [ ] ScrollTrigger.create() и управление
- [ ] refreshPriority и производительность
- [ ] Интеграция с Timeline
- [ ] Методы очистки и управления

#### **Проблема #002 - Hero Cube сложность**
- [ ] GSAP Object и основы
- [ ] Timeline управление и позиционирование
- [ ] Методы создания анимаций
- [ ] Жизненный цикл и очистка
- [ ] Модульная архитектура

#### **Проблема #003 - Производительность**
- [ ] gsap.config() настройки
- [ ] ScrollTrigger оптимизация
- [ ] Методы управления памятью
- [ ] force3D и GPU ускорение
- [ ] Правильная очистка ресурсов

#### **Проблема #004 - Дублирование SCSS кода**
- [ ] Sass Mixins основы
- [ ] Sass Functions создание
- [ ] Sass Guide изучение
- [ ] BEM Methodology понимание
- [ ] Модульная организация стилей

#### **Проблема #005 - Архитектура компонентов**
- [ ] Жизненный цикл анимаций
- [ ] Управление состоянием
- [ ] Callbacks и события
- [ ] Паттерны создания/уничтожения
- [ ] gsap.context() для очистки

#### **Проблема #006 - Дублирование обработчиков событий**
- [ ] JavaScript Events основы
- [ ] addEventListener API изучение
- [ ] Event Delegation понимание
- [ ] Event Deep Dive изучение
- [ ] Предотвращение утечек памяти

---

## 🎯 Рекомендации по изучению

### **Порядок изучения:**
1. **Сначала** изучите основы GSAP Object и Timeline
2. **Затем** углубитесь в ScrollTrigger документацию
3. **После этого** изучите методы оптимизации производительности
4. **В конце** изучите продвинутые техники управления

### **Практические советы:**
- 📖 **Читайте примеры кода** в документации
- 🧪 **Тестируйте концепции** на простых примерах
- 📝 **Делайте заметки** по ключевым методам
- 🔄 **Возвращайтесь** к документации во время реализации

### **Важные моменты:**
- ⚠️ **Всегда регистрируйте плагины** через gsap.registerPlugin()
- 🧹 **Очищайте ресурсы** правильно для избежания утечек памяти
- 📊 **Используйте markers** для отладки ScrollTrigger
- 🎯 **Тестируйте производительность** на реальных устройствах

---

**Создано:** 19.01.2025  
**Последнее обновление:** 19.01.2025  
**Версия:** 1.0  
**Статус:** 📚 Готов к использованию

# Hero Cube Baseline Metrics - До рефакторинга

**Дата измерения:** 19.01.2025 14:37  
**Файл:** src/scripts/components/hero-cube.js

## 📊 Метрики кода

### Размер и сложность
- **Общее количество строк:** 700+
- **Количество методов:** 25
- **Количество свойств класса:** 30+
- **Цикломатическая сложность:** Высокая

### Выявленные ответственности (8 основных)
1. **Cube Animation Management** - управление 3D анимациями куба
2. **Video Control** - управление воспроизведением видео
3. **Positioning Logic** - переключение между fixed/absolute режимами
4. **Text Visibility Management** - управление видимостью заголовков
5. **Scale Effect Handling** - обработка эффекта масштабирования
6. **Play Button Logic** - логика магнитной кнопки воспроизведения
7. **Scroll Progress Calculation** - расчет прогресса скролла
8. **Performance Optimization** - throttling и оптимизация

### ScrollTrigger использование
- **ScrollTrigger.create:** 1 вызов
- **Сложность onUpdate:** Очень высокая (один метод делает все)

### Проблемы производительности
- **Throttling:** Адаптивный (16ms базовый)
- **DOM запросы:** Множественные в каждом кадре
- **GSAP вызовы:** Неоптимизированные
- **Memory leaks:** Потенциальные (сложная очистка)

## 🎯 Цели рефакторинга

### Архитектурные цели
- [ ] Разбить на 5-6 микросервисов
- [ ] Сократить основной файл до <200 строк
- [ ] Внедрить BaseComponent архитектуру
- [ ] Использовать AnimationService

### Производительные цели
- [ ] Оптимизировать ScrollTrigger использование
- [ ] Уменьшить DOM запросы
- [ ] Улучшить throttling
- [ ] Добавить proper cleanup

### Метрики для сравнения
- **Размер основного файла:** 700+ → <200 строк
- **Количество методов в основном классе:** 25 → <10
- **ScrollTrigger вызовы:** 1 сложный → оптимизированные
- **Производительность:** Измерить FPS до/после

## 📋 План микросервисов

### 1. CubeAnimationService
- Управление 3D анимациями куба
- Отслеживание граней
- Rotation logic

### 2. VideoControlService  
- Управление воспроизведением видео
- Play button logic
- Video state management

### 3. PositioningService
- Fixed/absolute режимы
- Viewport calculations
- Position transitions

### 4. TextVisibilityService
- Управление видимостью заголовков
- Text animations
- Visibility logic

### 5. ScaleEffectService
- Эффект масштабирования квадрата
- Scale calculations
- Viewport filling logic

### 6. HeroCubeController (основной)
- Координация всех сервисов
- ScrollTrigger management
- Lifecycle management

## 🔍 Baseline для тестирования

### Функциональность для проверки
1. ✅ 3D куб вращается при скролле
2. ✅ Переключение fixed/absolute режимов
3. ✅ Подмена куба на квадрат
4. ✅ Масштабирование квадрата
5. ✅ Появление магнитной кнопки
6. ✅ Запуск видео по клику
7. ✅ Скрытие/показ заголовков
8. ✅ Обратная анимация при скролле вверх

### Performance baseline
- **FPS при скролле:** Измерить в браузере
- **Memory usage:** Измерить в DevTools
- **ScrollTrigger count:** 1 (сложный)
- **DOM queries per frame:** Множественные

---

**Следующий шаг:** Создание микросервисов и рефакторинг

// =============================================================================
// Hero Stars Scroll Effect - Зеркальное изменение цветов при скролле
// =============================================================================

/**
 * Инициализация эффекта изменения цветов звездного неба при скролле
 */
window.initHeroStarsScrollEffect = function() {
    'use strict';
    
    console.log('🌟 Инициализация Hero Stars Scroll Effect...');
    
    const heroStarsElement = document.querySelector('.hero-stars-animation');
    const heroSection = document.querySelector('#hero');
    
    if (!heroStarsElement || !heroSection) {
        console.warn('⚠️ Hero stars или hero секция не найдены');
        return;
    }
    
    // Цветовые схемы для перехода (усиленная контрастность)
    const colorSchemes = {
        original: {
            gradient1: 'rgba(80, 11, 169, 0.4)',      // Фиолетовый
            gradient2: 'rgba(192, 113, 224, 0.25)',   // Светло-фиолетовый
            gradient3: 'rgba(8, 4, 10, 0.25)',        // Темно-фиолетовый
            base: '#000000'                            // Черный
        },
        peak: {
            gradient1: 'rgba(255, 50, 0, 0.7)',       // Ярко-красный (усилен)
            gradient2: 'rgba(255, 150, 0, 0.5)',      // Оранжевый (усилен)
            gradient3: 'rgba(0, 255, 100, 0.4)',      // Ярко-зеленый (усилен)
            base: '#002244'                            // Темно-синий (усилен)
        }
    };
    
    /**
     * Получение прогресса скролла относительно hero секции
     * @returns {number} Прогресс от 0 до 1
     */
    function getHeroScrollProgress() {
        const heroRect = heroSection.getBoundingClientRect();
        const heroHeight = heroSection.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // Прогресс от 0 (верх hero в viewport) до 1 (низ hero покидает viewport)
        const progress = Math.max(0, Math.min(1, -heroRect.top / (heroHeight - windowHeight * 0.2)));
        
        return progress;
    }
    
    /**
     * Создание зеркального эффекта: 0->1->0
     * @param {number} progress Линейный прогресс от 0 до 1
     * @returns {number} Зеркальный прогресс
     */
    function getMirroredProgress(progress) {
        // Создаем зеркальный эффект
        return progress <= 0.5 
            ? progress * 2          // 0 до 0.5 становится 0 до 1
            : (1 - progress) * 2;   // 0.5 до 1 становится 1 до 0
    }
    
    /**
     * Парсинг rgba строки в объект
     * @param {string} rgbaString rgba строка
     * @returns {object} Объект с r, g, b, a значениями
     */
    function parseRgba(rgbaString) {
        const match = rgbaString.match(/rgba?\(([^)]+)\)/);
        if (!match) return { r: 0, g: 0, b: 0, a: 1 };
        
        const values = match[1].split(',').map(v => parseFloat(v.trim()));
        return {
            r: values[0] || 0,
            g: values[1] || 0,
            b: values[2] || 0,
            a: values[3] !== undefined ? values[3] : 1
        };
    }
    
    /**
     * Интерполяция между двумя цветами
     * @param {string} color1 Первый цвет (rgba)
     * @param {string} color2 Второй цвет (rgba)
     * @param {number} factor Фактор интерполяции (0-1)
     * @returns {string} Интерполированный цвет
     */
    function interpolateColor(color1, color2, factor) {
        const c1 = parseRgba(color1);
        const c2 = parseRgba(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        const a = c1.a + (c2.a - c1.a) * factor;
        
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
    }
    
    /**
     * Интерполяция hex цветов
     * @param {string} color1 Первый цвет (hex)
     * @param {string} color2 Второй цвет (hex)
     * @param {number} factor Фактор интерполяции (0-1)
     * @returns {string} Интерполированный hex цвет
     */
    function interpolateHexColor(color1, color2, factor) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Обновление цветов звездного неба
     * @param {number} progress Прогресс скролла (0-1)
     */
    function updateStarsColors(progress) {
        const mirroredProgress = getMirroredProgress(progress);
        
        // Интерполируем между исходными и пиковыми цветами
        const newGradient1 = interpolateColor(
            colorSchemes.original.gradient1,
            colorSchemes.peak.gradient1,
            mirroredProgress
        );
        
        const newGradient2 = interpolateColor(
            colorSchemes.original.gradient2,
            colorSchemes.peak.gradient2,
            mirroredProgress
        );
        
        const newGradient3 = interpolateColor(
            colorSchemes.original.gradient3,
            colorSchemes.peak.gradient3,
            mirroredProgress
        );
        
        const newBase = interpolateHexColor(
            colorSchemes.original.base,
            colorSchemes.peak.base,
            mirroredProgress
        );
        
        // Применяем новые цвета через CSS переменные
        heroStarsElement.style.setProperty('--gradient-1-color', newGradient1);
        heroStarsElement.style.setProperty('--gradient-2-color', newGradient2);
        heroStarsElement.style.setProperty('--gradient-3-color', newGradient3);
        heroStarsElement.style.setProperty('--base-color', newBase);
        
        // Дебаг информация (можно убрать в продакшене)
        if (window.DEBUG_HERO_STARS) {
            console.log(`🌟 Progress: ${progress.toFixed(3)}, Mirrored: ${mirroredProgress.toFixed(3)}`);
        }
    }
    
    /**
     * Throttle функция для оптимизации производительности
     * @param {Function} func Функция для throttle
     * @param {number} limit Лимит в миллисекундах
     * @returns {Function} Throttled функция
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Обработчик скролла с throttling
    const handleScroll = throttle(function() {
        const progress = getHeroScrollProgress();
        updateStarsColors(progress);
    }, 16); // ~60fps
    
    // Инициализация
    function init() {
        // Устанавливаем начальные цвета
        updateStarsColors(0);
        
        // Добавляем обработчик скролла
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', throttle(function() {
            const progress = getHeroScrollProgress();
            updateStarsColors(progress);
        }, 100), { passive: true });
        
        console.log('✅ Hero Stars Scroll Effect инициализирован');
    }
    
    // Публичные методы
    const heroStarsScrollAPI = {
        updateColors: updateStarsColors,
        getProgress: getHeroScrollProgress,
        enableDebug: () => { window.DEBUG_HERO_STARS = true; },
        disableDebug: () => { window.DEBUG_HERO_STARS = false; },
        destroy: () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            // Возвращаем исходные цвета
            updateStarsColors(0);
            console.log('🌟 Hero Stars Scroll Effect уничтожен');
        }
    };
    
    // Запуск инициализации
    init();
    
    // Делаем API глобально доступным
    window.heroStarsScrollAPI = heroStarsScrollAPI;
    
    return heroStarsScrollAPI;
};

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.HeroStarsScrollEffect = window.initHeroStarsScrollEffect;
}

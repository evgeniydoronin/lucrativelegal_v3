// =============================================================================
// Word Animator Component - LLG v3 (HugeInc Style)
// =============================================================================

// Глобальная функция инициализации
window.initWordAnimator = function() {
    'use strict';
    
    console.log('🎭 Initializing Word Animator (HugeInc Style)');

    // Проверка зависимостей
    function checkDependencies() {
        if (typeof gsap === 'undefined') {
            console.error('❌ Word Animator: GSAP is not loaded.');
            return false;
        }
        
        if (typeof ScrollTrigger === 'undefined') {
            console.error('❌ Word Animator: ScrollTrigger is not loaded.');
            return false;
        }
        
        return true;
    }

    // Основной класс компонента
    class WordAnimatorClass {
        constructor() {
            this.elements = [];
            this.init();
        }
        
        init() {
            this.findElements();
            this.processElements();
            console.log(`✅ Word Animator initialized with ${this.elements.length} word-animate elements and ${this.scrollBlurElements.length} scroll-blur elements`);
        }
        
        findElements() {
            // Находим все элементы с классом js-word-animate
            const wordAnimateElements = document.querySelectorAll('.js-word-animate');
            // Находим все элементы с классом js-scroll-blur-effect (включая адаптивные)
            const scrollBlurElements = document.querySelectorAll('.js-scroll-blur-effect, .js-scroll-blur-effect-adaptive');
            
            this.elements = Array.from(wordAnimateElements);
            this.scrollBlurElements = Array.from(scrollBlurElements);
        }
        
        processElements() {
            // Обрабатываем обычные word-animate элементы
            this.elements.forEach(element => {
                this.processWordElement(element);
                this.setupWordScrollTrigger(element);
            });
            
            // Обрабатываем scroll-blur-effect элементы
            this.scrollBlurElements.forEach(element => {
                this.processScrollBlurElement(element);
                this.setupScrollBlurTrigger(element);
            });
        }
        
        processWordElement(element) {
            const text = element.dataset.text || element.textContent;
            const words = text.trim().split(/\s+/);
            
            // Очищаем содержимое
            element.innerHTML = '';
            
            // Создаем div для каждого слова (как у HugeInc)
            words.forEach((word, index) => {
                const wordDiv = document.createElement('div');
                wordDiv.className = 'word';
                wordDiv.textContent = word;
                wordDiv.style.cssText = `
                    display: inline-block;
                    position: relative;
                    margin-right: ${index < words.length - 1 ? '0.3em' : '0'};
                    opacity: 0;
                    transform: translateY(100%);
                `;
                element.appendChild(wordDiv);
            });
            
            // Сохраняем ссылки на слова
            element.wordElements = element.querySelectorAll('.word');
        }
        
        setupWordScrollTrigger(element) {
            ScrollTrigger.create({
                trigger: element,
                start: 'top 80%',
                onEnter: () => {
                    this.animateWordsIn(element);
                },
                onLeave: () => {
                    this.animateWordsOut(element);
                },
                onEnterBack: () => {
                    this.animateWordsIn(element);
                },
                onLeaveBack: () => {
                    this.animateWordsOut(element);
                }
            });
        }
        
        animateWordsIn(element) {
            const words = element.wordElements;
            if (!words) return;
            
            gsap.to(words, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            });
        }
        
        animateWordsOut(element) {
            const words = element.wordElements;
            if (!words) return;
            
            gsap.to(words, {
                opacity: 0,
                y: "100%",
                duration: 0.6,
                stagger: 0.05,
                ease: "power2.in"
            });
        }
        
        // 🌫️ SCROLL BLUR EFFECT METHODS (Adaptive for Long Texts)
        processScrollBlurElement(element) {
            const text = element.dataset.text || element.textContent;
            const words = text.trim().split(/\s+/);
            
            // 🎯 АДАПТИВНАЯ ЛОГИКА: определяем тип текста
            const isLongText = words.length > 10;
            const isAdaptive = element.classList.contains('js-scroll-blur-effect-adaptive');
            
            // Сохраняем информацию о типе текста
            element.isLongText = isLongText;
            element.isAdaptive = isAdaptive;
            
            // Очищаем содержимое
            element.innerHTML = '';
            
            // Создаем div для каждого слова с адаптивными стилями
            words.forEach((word, index) => {
                const wordDiv = document.createElement('div');
                wordDiv.className = 'word blur-word';
                wordDiv.textContent = word;
                
                // 🔧 АДАПТИВНЫЕ ПАРАМЕТРЫ для начального состояния
                let initialOpacity, initialBlur;
                
                if (isLongText || isAdaptive) {
                    // 🎯 ВСЕ СЛОВА НАЧИНАЮТСЯ ОДИНАКОВО РАЗМЫТЫМИ
                    initialOpacity = 0.7;  // Фиксированное значение для всех слов
                    initialBlur = 4;       // Фиксированное значение для всех слов
                } else {
                    // Для коротких текстов: прогрессивное размытие
                    initialOpacity = Math.max(0.2, 0.8 - (index * 0.15));
                    initialBlur = Math.min(15, 3 + (index * 4));
                }
                
                wordDiv.style.cssText = `
                    display: inline-block;
                    position: relative;
                    margin-right: ${index < words.length - 1 ? '0.3em' : '0'};
                    opacity: ${initialOpacity};
                    filter: blur(${initialBlur}px);
                    will-change: opacity, filter;
                `;
                element.appendChild(wordDiv);
            });
            
            // Сохраняем ссылки на слова
            element.blurWordElements = element.querySelectorAll('.blur-word');
        }
        
        setupScrollBlurTrigger(element) {
            const words = element.blurWordElements;
            if (!words || words.length === 0) return;
            
            // 🎯 АДАПТИВНЫЕ ПАРАМЕТРЫ ScrollTrigger
            const isLongText = element.isLongText;
            const isAdaptive = element.isAdaptive;
            
            // Для длинных текстов увеличиваем диапазон анимации
            let endPosition;
            if (isLongText || isAdaptive) {
                endPosition = words.length > 30 ? 'top 30%' : 'top 50%'; // Больше места для длинных текстов
            } else {
                endPosition = 'top 75%'; // Как раньше для коротких
            }
            
            ScrollTrigger.create({
                trigger: element,
                start: 'top 100%', // Начинаем анимацию когда заголовок входит в экран
                end: endPosition, // Адаптивная конечная точка
                scrub: 1, // Плавная привязка к скроллу
                onUpdate: (self) => {
                    this.updateScrollBlurEffect(element, self.progress);
                    this.updateParallaxEffect(element, self.progress);
                }
            });
        }
        
        updateScrollBlurEffect(element, progress) {
            const words = element.blurWordElements;
            if (!words) return;
            
            // 🎯 АДАПТИВНАЯ МАТЕМАТИКА для длинных текстов
            const isLongText = element.isLongText;
            const isAdaptive = element.isAdaptive;
            const wordCount = words.length;
            
            words.forEach((word, index) => {
                // 🔧 АДАПТИВНАЯ ЗАДЕРЖКА (ускоренная для длинных текстов)
                let delayStep;
                if (isLongText || isAdaptive) {
                    // Для длинных текстов: еще быстрее + ограничиваем максимум
                    const maxDelay = 0.5; // Максимум 50% от общего времени (было 70%)
                    delayStep = Math.min(0.04, maxDelay / wordCount); // Уменьшили с 0.08 до 0.04
                } else {
                    // Для коротких текстов: как раньше
                    delayStep = 0.10; // ← УМЕНЬШИ для быстрее
                }
                
                const delay = index * delayStep;
                const adjustedProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
                
                // 🔧 АДАПТИВНЫЕ НАЧАЛЬНЫЕ ЗНАЧЕНИЯ (должны совпадать с processScrollBlurElement)
                let startOpacity, startBlur;
                if (isLongText || isAdaptive) {
                    // 🎯 ВСЕ СЛОВА НАЧИНАЮТСЯ ОДИНАКОВО РАЗМЫТЫМИ
                    startOpacity = 0.7;  // Фиксированное значение для всех слов
                    startBlur = 4;       // Фиксированное значение для всех слов
                } else {
                    // Для коротких текстов: прогрессивное размытие
                    startOpacity = Math.max(0.2, 0.8 - (index * 0.15));
                    startBlur = Math.min(15, 3 + (index * 4));
                }
                
                // Рассчитываем финальные значения
                let opacity = startOpacity + (1 - startOpacity) * adjustedProgress;
                let blur = startBlur * (1 - adjustedProgress);
                
                // Применяем стили
                gsap.set(word, {
                    opacity: opacity,
                    filter: `blur(${blur}px)`
                });
            });
        }
        
        // 🎯 PARALLAX EFFECT METHOD (Donor Site Style)
        updateParallaxEffect(element, progress) {
            // Проверяем, является ли элемент подзаголовком (section-description)
            if (element.classList.contains('section-description')) {
                // 🔧 ИСПРАВЛЕНИЕ: отключаем параллакс для адаптивных длинных текстов
                const isAdaptive = element.classList.contains('js-scroll-blur-effect-adaptive');
                
                if (!isAdaptive) {
                    // Обычные подзаголовки: выезжают справа (как у донора)
                    const translateX = (1 - progress) * 100; // От 100px до 0px
                    const translateY = (1 - progress) * 50;  // Легкое движение по Y
                    
                    gsap.set(element, {
                        x: translateX,
                        y: translateY
                    });
                } else {
                    // 🔧 ВОССТАНОВЛЕННЫЙ ПАРАЛЛАКС: адаптивные длинные тексты с уменьшенным сдвигом
                    const translateX = (1 - progress) * 30; // От 30px до 0px (было 0, стало 30)
                    const translateY = (1 - progress) * 20; // От 20px до 0px
                    
                    gsap.set(element, {
                        x: translateX, // Возвращаем горизонтальный сдвиг
                        y: translateY
                    });
                }
            } else if (element.classList.contains('section-title')) {
                // Основной заголовок - легкое параллакс движение
                const translateY = (1 - progress) * 20; // От 20px до 0px
                
                gsap.set(element, {
                    y: translateY
                });
            }
        }
        
        // Метод для добавления новых элементов динамически
        addElement(element) {
            if (!element.classList.contains('js-word-animate')) {
                element.classList.add('js-word-animate');
            }
            
            this.processWordElement(element);
            this.setupWordScrollTrigger(element);
            this.elements.push(element);
        }
        
        // Метод для обновления всех элементов
        refresh() {
            ScrollTrigger.refresh();
        }
        
        destroy() {
            // Cleanup ScrollTrigger
            ScrollTrigger.getAll().forEach(trigger => {
                this.elements.forEach(element => {
                    if (trigger.trigger === element) {
                        trigger.kill();
                    }
                });
            });
            
            // Cleanup GSAP анимации
            this.elements.forEach(element => {
                gsap.killTweensOf(element.wordElements);
            });
            
            this.elements = [];
        }
    }

    // Инициализация с проверками
    if (!checkDependencies()) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    const wordAnimator = new WordAnimatorClass();
    
    // Делаем доступным глобально
    window.wordAnimator = wordAnimator;
    
    // Refresh ScrollTrigger после загрузки всех ресурсов
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
    
    return wordAnimator;
}

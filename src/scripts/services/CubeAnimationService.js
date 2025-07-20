// =============================================================================
// Cube Animation Service - Управление 3D анимациями куба
// =============================================================================

class CubeAnimationService {
    constructor(cubeElement, animationService) {
        this.cube = cubeElement;
        this.animationService = animationService;
        
        // Отслеживание поворотов граней
        this.lastFaceAngle = 0;
        this.currentFace = 'purple';
        this.faceHistory = [];
        
        // Определение граней по углам поворота
        this.faceAngles = {
            '0': { name: 'purple', color: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', emoji: '💜' },
            '90': { name: 'green', color: 'linear-gradient(135deg, #34A853 0%, #FBBC04 100%)', emoji: '💚' },
            '180': { name: 'blue', color: 'linear-gradient(135deg, #1877F2 0%, #00BCD4 100%)', emoji: '💙' },
            '270': { name: 'orange', color: 'linear-gradient(135deg, #EA4335 0%, #FF6D01 100%)', emoji: '🧡' },
            '360': { name: 'purple', color: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', emoji: '💜' }
        };
        
        // Текущее состояние вращения
        this.currentRotation = { x: 0, y: 0 };
        this.rotationComplete = false;
        
        this.init();
    }
    
    init() {
        console.log('🎲 CubeAnimationService initialized');
        
        // Выводим начальную грань
        const initialFaceInfo = this.faceAngles['0'];
        console.log(`🎲${initialFaceInfo.emoji} ${initialFaceInfo.name.toUpperCase()} ГРАНЬ ИЗНАЧАЛЬНО ВИДНА! (0°)`);
    }
    
    /**
     * Применяет вращение к кубу
     * @param {number} targetRotation - Целевой угол вращения в градусах
     * @param {boolean} isScalingMode - Находится ли куб в режиме масштабирования
     */
    applyRotation(targetRotation, isScalingMode = false) {
        // Применяем вращение с использованием AnimationService
        if (this.animationService && this.animationService.scrollTriggerManager) {
            // Используем AnimationService для оптимизированного управления анимациями
            gsap.set(this.cube, {
                rotationY: targetRotation,
                rotationX: 0, // Всегда 0 - только горизонтальное вращение
                overwrite: true // Предотвращаем конфликты анимаций
            });
        } else {
            // Fallback к прямому GSAP
            gsap.set(this.cube, {
                rotationY: targetRotation,
                rotationX: 0,
                overwrite: true
            });
        }
        
        // Обновляем текущее состояние
        this.currentRotation.y = targetRotation;
        
        // ✅ ИСПРАВЛЕНИЕ: Сбрасываем rotationComplete если куб вернулся к началу
        if (targetRotation <= 10 && this.rotationComplete) {
            this.rotationComplete = false;
            console.log('🎲 Куб вернулся к началу - rotationComplete сброшен');
        }
        
        // Проверяем завершение полного оборота
        if (targetRotation >= 360 && !this.rotationComplete) {
            this.rotationComplete = true;
            console.log('🎲 Полный оборот куба завершен! (360°)');
            return true; // Сигнализируем о завершении
        }
        
        // Отслеживание граней (только если не в режиме масштабирования)
        if (!isScalingMode) {
            this.trackFaceRotation(targetRotation);
        }
        
        return false;
    }
    
    /**
     * Отслеживание поворотов граней куба
     * @param {number} currentRotation - Текущий угол вращения
     */
    trackFaceRotation(currentRotation) {
        // Нормализуем угол к диапазону 0-360
        const normalizedAngle = ((currentRotation % 360) + 360) % 360;
        
        // Определяем ближайшую грань (каждые 90 градусов)
        let closestFaceAngle;
        let minDistance = Infinity;
        
        const faceAngles = [0, 90, 180, 270, 360];
        
        for (const angle of faceAngles) {
            const normalizedFaceAngle = ((angle % 360) + 360) % 360;
            const distance = Math.abs(normalizedAngle - normalizedFaceAngle);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestFaceAngle = angle;
            }
        }
        
        // Проверяем, достаточно ли близко к грани (в пределах 10 градусов)
        if (minDistance <= 10) {
            const faceKey = closestFaceAngle.toString();
            const faceInfo = this.faceAngles[faceKey];
            
            if (faceInfo && this.currentFace !== faceInfo.name) {
                // Смена грани!
                const previousFace = this.currentFace;
                this.currentFace = faceInfo.name;
                
                // Сохраняем в историю
                this.faceHistory.push({
                    face: faceInfo.name,
                    angle: closestFaceAngle,
                    timestamp: Date.now(),
                    previousFace: previousFace
                });
                
                // Выводим сообщение в консоль
                console.log(`🎲${faceInfo.emoji} ${faceInfo.name.toUpperCase()} ГРАНЬ ПОЛНОСТЬЮ ВИДНА! (${closestFaceAngle}°)`);
                
                // Дополнительная информация
                if (this.faceHistory.length > 1) {
                    console.log(`🔄 Переход: ${previousFace} → ${faceInfo.name}`);
                }
                
                // Специальные сообщения для полных оборотов
                if (faceInfo.name === 'purple' && closestFaceAngle === 360 && this.faceHistory.length > 1) {
                    const purpleCount = this.faceHistory.filter(h => h.face === 'purple').length;
                    console.log(`🎉 ПОЛНЫЙ ОБОРОТ #${purpleCount - 1} ЗАВЕРШЕН!`);
                }
            }
        }
    }
    
    /**
     * Программное управление кубом
     * @param {number} x - Поворот по X
     * @param {number} y - Поворот по Y  
     * @param {number} duration - Длительность анимации
     */
    rotateTo(x, y, duration = 1) {
        // Проверяем поддержку reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        this.currentRotation.x = x;
        this.currentRotation.y = y;
        
        if (this.animationService && this.animationService.scrollTriggerManager) {
            // Используем AnimationService для создания анимации
            const timeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                id: 'cube_manual_rotation'
            });
            
            if (timeline) {
                timeline.to(this.cube, {
                    rotationX: x,
                    rotationY: y,
                    duration: duration,
                    ease: "power2.out"
                });
            }
        } else {
            // Fallback к прямому GSAP
            gsap.to(this.cube, {
                rotationX: x,
                rotationY: y,
                duration: duration,
                ease: "power2.out"
            });
        }
    }
    
    /**
     * Сброс куба в исходное положение
     * @param {number} duration - Длительность анимации
     * @param {boolean} preserveRotationComplete - Сохранить ли состояние завершения вращения
     */
    reset(duration = 1, preserveRotationComplete = false) {
        console.log('🎲 Сброс куба в исходное положение');
        
        // Проверяем поддержку reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        this.currentRotation.x = 0;
        this.currentRotation.y = 0;
        
        // ✅ ИСПРАВЛЕНИЕ: Не сбрасываем rotationComplete если куб уже завершил полный оборот
        // Это предотвращает проблему с повторным скроллом
        if (!preserveRotationComplete) {
            this.rotationComplete = false;
            console.log('🔄 rotationComplete сброшен в false');
        } else {
            console.log('🔄 rotationComplete сохранен:', this.rotationComplete);
        }
        
        this.currentFace = 'purple';
        
        if (this.animationService && this.animationService.scrollTriggerManager) {
            // Используем AnimationService
            const timeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                id: 'cube_reset'
            });
            
            if (timeline) {
                timeline.to(this.cube, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: duration,
                    ease: "power2.out"
                });
            }
        } else {
            // Fallback к прямому GSAP
            gsap.to(this.cube, {
                rotationX: 0,
                rotationY: 0,
                duration: duration,
                ease: "power2.out"
            });
        }
    }
    
    /**
     * Скрытие боковых граней при масштабировании
     * @param {number} progress - Прогресс масштабирования (0-1)
     */
    hideSideFaces(progress) {
        const faces = this.cube.querySelectorAll('.cube-face');
        faces.forEach(face => {
            if (!face.classList.contains('cube-face--front')) {
                // Постепенно скрываем все грани кроме передней
                face.style.opacity = Math.max(0, 1 - (progress * 2));
            }
        });
    }
    
    /**
     * Показ всех граней куба
     */
    showAllFaces() {
        const faces = this.cube.querySelectorAll('.cube-face');
        faces.forEach(face => {
            face.style.opacity = 1;
        });
    }
    
    /**
     * Получение текущего состояния куба
     */
    getState() {
        return {
            currentRotation: { ...this.currentRotation },
            currentFace: this.currentFace,
            rotationComplete: this.rotationComplete,
            faceHistory: [...this.faceHistory]
        };
    }
    
    /**
     * Получение информации о текущей грани
     */
    getCurrentFaceInfo() {
        const faceKey = Math.round(this.currentRotation.y % 360).toString();
        return this.faceAngles[faceKey] || this.faceAngles['0'];
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        // Очищаем историю граней
        this.faceHistory = [];
        
        // Сбрасываем состояние
        this.currentRotation = { x: 0, y: 0 };
        this.rotationComplete = false;
        this.currentFace = 'purple';
        
        console.log('🎲 CubeAnimationService destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.CubeAnimationService = CubeAnimationService;
}

// =============================================================================
// Services Component - LLG v3 (Based on HugeInc Effect from v2.0)
// =============================================================================

// HugeInc Effect - Services Cards Scrolling
window.initServicesSlider = function() {
    'use strict';
    
    // console.log('🔧 DEBUG: initServicesSlider() called');

    // Check for necessary libraries
    function checkDependencies() {
        // console.log('🔧 DEBUG: Checking dependencies...');
        
        if (typeof gsap === 'undefined') {
            console.error('❌ Services Slider: GSAP is not loaded.');
            return false;
        } else {
            // console.log('✅ GSAP is loaded:', gsap.version);
        }
        
        if (typeof ScrollTrigger === 'undefined') {
            console.error('❌ Services Slider: ScrollTrigger is not loaded.');
            return false;
        } else {
            // console.log('✅ ScrollTrigger is loaded');
        }
        
        if (typeof Lenis === 'undefined') {
            console.warn('⚠️ Services Slider: Lenis is not loaded. Smooth scroll will be disabled.');
        } else {
            // console.log('✅ Lenis is loaded');
        }
        
        return true;
    }

    // Main function to initialize the cards effect
    function initCardsEffect() {
        // console.log('🔧 DEBUG: initCardsEffect() called');
        
        const section = document.querySelector('.llg-services-section');
        // console.log('🔧 DEBUG: section found:', !!section, section);
        if (!section) {
            console.error('❌ Section .llg-services-section not found!');
            return;
        }

        const pinSpacer = section.querySelector('.pin-spacer');
        const cardsViewer = section.querySelector('.js-cards-viewer');
        const cards = section.querySelectorAll('.js-card');
        const clientNumberEl = section.querySelector('.js-client-number');

        // console.log('🔧 DEBUG: Elements found:');
        // console.log('  - pinSpacer:', !!pinSpacer, pinSpacer);
        // console.log('  - cardsViewer:', !!cardsViewer, cardsViewer);
        // console.log('  - cards:', cards.length, cards);
        // console.log('  - clientNumberEl:', !!clientNumberEl, clientNumberEl);

        if (!pinSpacer || !cardsViewer || cards.length === 0) {
            console.error('❌ Services Slider: Required elements for the effect are not found.');
            console.error('Missing elements:', {
                pinSpacer: !pinSpacer,
                cardsViewer: !cardsViewer,
                cards: cards.length === 0
            });
            return;
        }

        // Set pin-spacer height based on cards and take fixed header into account
        const spacerHeight = cards.length * 150; // 150vh per card как в оригинале v2.0
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;

        // console.log('🔧 DEBUG: Height calculations:');
        // console.log('  - cards.length:', cards.length);
        // console.log('  - spacerHeight:', spacerHeight + 'vh');
        // console.log('  - header found:', !!header);
        // console.log('  - headerHeight:', headerHeight + 'px');

        // Extra headerHeight so последняя карточка полностью прокручивается
        const finalHeight = `calc(${spacerHeight}vh + ${headerHeight}px)`;
        pinSpacer.style.height = finalHeight;
        // console.log('🔧 DEBUG: pinSpacer height set to:', finalHeight);

        // Move sticky viewer below fixed header
        if (headerHeight) {
            const viewerTop = `${headerHeight}px`;
            const viewerHeight = `calc(100vh - ${headerHeight}px)`;
            cardsViewer.style.top = viewerTop;
            cardsViewer.style.height = viewerHeight;
            // console.log('🔧 DEBUG: cardsViewer positioned:');
            // console.log('  - top:', viewerTop);
            // console.log('  - height:', viewerHeight);
        } else {
            // console.log('🔧 DEBUG: No header found, using default positioning');
        }

        // console.log('🔧 DEBUG: Creating ScrollTrigger timeline...');
        
        const mainTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: pinSpacer,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 2,
                pin: cardsViewer,
                anticipatePin: 1,
                onUpdate: (self) => {
                    // console.log('🔧 DEBUG: ScrollTrigger progress:', self.progress);
                    updateCardCounter(self.progress, cards.length);
                    
                    // Debug positioning and styling
                    // const viewerRect = cardsViewer.getBoundingClientRect();
                    // const viewerStyles = window.getComputedStyle(cardsViewer);
                    // console.log('🔧 DEBUG: cardsViewer position:', {
                    //     top: viewerRect.top,
                    //     left: viewerRect.left,
                    //     width: viewerRect.width,
                    //     height: viewerRect.height,
                    //     background: viewerStyles.backgroundColor,
                    //     position: viewerStyles.position,
                    //     zIndex: viewerStyles.zIndex
                    // });
                },
                onEnter: () => {
                    // console.log('🔧 DEBUG: ScrollTrigger entered - pinning started');
                    // Ensure black background is maintained
                    cardsViewer.style.backgroundColor = '#000000';
                },
                onLeave: () => {}, // console.log('🔧 DEBUG: ScrollTrigger left'),
                onEnterBack: () => {}, // console.log('🔧 DEBUG: ScrollTrigger entered back'),
                onLeaveBack: () => {}, // console.log('🔧 DEBUG: ScrollTrigger left back'),
            }
        });
        
        // console.log('🔧 DEBUG: Timeline created:', mainTimeline);

        // Initialize all cards with hidden state
        cards.forEach((card, index) => {
            const image = card.querySelector('.js-card-image');
            const description = card.querySelector('.js-card-description');
            const scrollTitle = card.querySelector('.js-scroll-title');

            // console.log(`🔧 DEBUG: Processing card ${index + 1}:`, {
            //     card: !!card,
            //     image: !!image,
            //     description: !!description,
            //     scrollTitle: !!scrollTitle
            // });

            // Set initial hidden state for ALL cards (including first one)
            gsap.set(card, { opacity: 0, visibility: 'hidden' });
            gsap.set([image], { opacity: 0, y: 50 });
            gsap.set(description, { opacity: 0, x: 50 });
            if (scrollTitle) {
                gsap.set(scrollTitle, { opacity: 0, y: '75vh' });
            }

            const startTime = index / cards.length;
            const endTime = (index + 1) / cards.length;
            const duration = 1 / cards.length;

            const appearanceDuration = duration * 0.35;
            const disappearanceDuration = duration * 0.25;

            // Card appearance
            mainTimeline.to(card, {
                opacity: 1,
                visibility: 'visible',
                duration: appearanceDuration * 0.3,
                ease: 'power2.out'
            }, startTime);

            // Elements animation
            mainTimeline.to(image, {
                opacity: 1,
                y: 0,
                x: 0,
                transform: "translate(-50%, -50%)", // Явно восстановить CSS transform
                duration: appearanceDuration * 0.4,
                ease: 'power2.out'
            }, startTime + appearanceDuration * 0.1);

            mainTimeline.to(description, {
                opacity: 1,
                x: 0,
                duration: appearanceDuration * 0.5,
                ease: 'power2.out'
            }, startTime + appearanceDuration * 0.1);

            // Scrolling title animation
            if (scrollTitle) {
                mainTimeline.fromTo(scrollTitle, {
                    opacity: 1,
                    y: '75vh'
                }, {
                    y: '-75vh',
                    duration: duration,
                    ease: 'none'
                }, startTime);
                mainTimeline.set(scrollTitle, { opacity: 1 }, startTime);
                if (index < cards.length - 1) {
                    mainTimeline.set(scrollTitle, { opacity: 0 }, endTime);
                }
            }

            // Card disappearance
            if (index < cards.length - 1) {
                const disappearanceStart = endTime - disappearanceDuration;
                mainTimeline.to([description], {
                    opacity: 0,
                    x: -50,
                    duration: disappearanceDuration * 0.5,
                    ease: 'power2.out'
                }, disappearanceStart);

                mainTimeline.to([image], {
                    opacity: 0,
                    y: 50,
                    duration: disappearanceDuration * 0.4,
                    ease: 'power2.out'
                }, disappearanceStart + disappearanceDuration * 0.2);

                mainTimeline.to(card, {
                    opacity: 0,
                    visibility: 'hidden',
                    duration: disappearanceDuration * 0.3,
                    ease: 'power2.out'
                }, disappearanceStart + disappearanceDuration * 0.7);
            }
        });

        function updateCardCounter(progress, totalCards) {
            if (!clientNumberEl) return;
            const currentCard = Math.floor(progress * totalCards) + 1;
            const clampedCard = Math.min(currentCard, totalCards);
            const totalPadded = totalCards.toString().padStart(2, '0');
            clientNumberEl.innerHTML = `<span class="js-client-number-units">${clampedCard.toString().padStart(2, '0')}</span>/${totalPadded}`;
        }
        
        console.log('✅ Services Slider initialized.');
        
        // Initialize modal functionality
        initServiceModal();
    }

    // Service Modal functionality
    function initServiceModal() {
        const cards = document.querySelectorAll('.js-card');
        const modal = document.getElementById('service-modal');
        const closeBtn = modal?.querySelector('.service-modal__close');
        const modalTitle = modal?.querySelector('#service-modal-title');
        const modalSubtitle = modal?.querySelector('#service-modal-subtitle');
        const modalDescription = modal?.querySelector('#service-modal-description');
        const modalVideo = modal?.querySelector('#service-modal-video');
        const modalImage = modal?.querySelector('#service-modal-image');
        const modalCategory = modal?.querySelector('#service-modal-category');

        if (!modal) {
            console.warn('Service modal element not found');
            return;
        }

        // Add click listeners to service cards
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const serviceId = card.dataset.serviceId;
                
                // Get service data from JSON
                const servicesDataScript = document.getElementById('llg-services-data');
                if (!servicesDataScript) {
                    console.error('Services data not found');
                    return;
                }
                
                let servicesData;
                try {
                    servicesData = JSON.parse(servicesDataScript.textContent);
                } catch (e) {
                    console.error('Error parsing services data:', e);
                    return;
                }
                
                const serviceData = servicesData[serviceId];
                if (!serviceData) {
                    console.error('Service data not found for:', serviceId);
                    return;
                }

                // Populate modal content
                if (modalTitle) modalTitle.textContent = serviceData.title;
                if (modalSubtitle) modalSubtitle.textContent = serviceData.subtitle;
                if (modalCategory) modalCategory.textContent = serviceData.category;
                
                // Set description
                const modalDescriptionEl = modal?.querySelector('#service-modal-description');
                if (modalDescriptionEl) {
                    modalDescriptionEl.textContent = serviceData.description;
                }
                
                // Set benefits
                const modalBenefits = modal?.querySelector('#service-modal-benefits');
                if (modalBenefits && serviceData.benefits) {
                    modalBenefits.innerHTML = serviceData.benefits
                        .map(benefit => `<li>${benefit}</li>`)
                        .join('');
                }
                
                // Set approach
                const modalApproach = modal?.querySelector('#service-modal-approach');
                if (modalApproach) {
                    modalApproach.innerHTML = `<p>${serviceData.approach}</p>`;
                }
                
                // Set results
                const modalResults = modal?.querySelector('#service-modal-results');
                if (modalResults) {
                    modalResults.innerHTML = `<p>${serviceData.results}</p>`;
                }
                
                // Set image source and theme
                const imageWrapper = modal?.querySelector('.service-modal__image-wrapper');
                const leftColumn = modal?.querySelector('.service-modal__left');
                
                if (modalImage && serviceData.image) {
                    modalImage.src = serviceData.image;
                    modalImage.alt = serviceData.title;
                }
                
                // Apply theme to both left column and image wrapper for background
                if (imageWrapper) {
                    imageWrapper.setAttribute('data-theme', serviceId);
                }
                if (leftColumn) {
                    leftColumn.setAttribute('data-theme', serviceId);
                }
                
                // Set video source
                if (modalVideo && serviceData.video) {
                    const videoSource = modalVideo.querySelector('source');
                    if (videoSource) {
                        videoSource.src = serviceData.video;
                        modalVideo.load(); // Reload video with new source
                    }
                }
                
                // Set YouTube video
                const youtubeFrame = modal?.querySelector('#service-modal-youtube');
                if (youtubeFrame && serviceData.youtube) {
                    youtubeFrame.src = `https://www.youtube.com/embed/${serviceData.youtube}`;
                }

                // Show modal using native dialog API
                showModal();
            });
        });

        // Close modal handlers
        if (closeBtn) {
            closeBtn.addEventListener('click', hideModal);
        }

        // ESC key to close modal (handled automatically by dialog element)
        modal.addEventListener('cancel', (e) => {
            e.preventDefault(); // Prevent default ESC behavior
            hideModal();
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });

        function showModal() {
            // Reset scroll position for content
            const modalContent = modal?.querySelector('.service-modal__content');
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
            
            // Initialize Lenis for modal content if available
            if (typeof Lenis !== 'undefined' && modalContent) {
                // Create Lenis instance for modal content
                const modalLenis = new Lenis({
                    wrapper: modalContent,
                    content: modalContent,
                    lerp: 0.1,
                    duration: 1.2,
                    orientation: 'vertical',
                    gestureOrientation: 'vertical',
                    smoothWheel: true,
                    wheelMultiplier: 1,
                    touchMultiplier: 2,
                    infinite: false,
                });
                
                // Store modal Lenis instance for cleanup
                modal._modalLenis = modalLenis;
                
                // Start modal Lenis
                function modalRaf(time) {
                    modalLenis.raf(time);
                    if (modal.open) {
                        requestAnimationFrame(modalRaf);
                    }
                }
                requestAnimationFrame(modalRaf);
                
                console.log('✅ Modal Lenis initialized');
            }
            
            // Block body scroll when modal opens
            document.body.style.overflow = 'hidden';
            modal.showModal();
        }

        function hideModal() {
            // Cleanup modal Lenis instance
            if (modal._modalLenis) {
                modal._modalLenis.destroy();
                modal._modalLenis = null;
                console.log('✅ Modal Lenis destroyed');
            }
            
            // Restore body scroll when modal closes
            document.body.style.overflow = '';
            modal.close();
            
            // Reset scroll position when closing
            const modalContent = modal?.querySelector('.service-modal__content');
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
            
            // Pause video when modal closes
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.currentTime = 0;
            }
            
            // Stop YouTube video when modal closes
            const youtubeFrame = modal?.querySelector('#service-modal-youtube');
            if (youtubeFrame) {
                youtubeFrame.src = ''; // Stops the video
            }
        }

        console.log('✅ Service Modal initialized.');
    }

    // Debounced resize handler
    function handleResize() {
        ScrollTrigger.refresh();
    }

    // Main initialization logic
    if (!checkDependencies()) return;

    gsap.registerPlugin(ScrollTrigger);
    initCardsEffect();

    // Re-calculate after all assets (images/fonts) are loaded
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
}

// Function is now called from main.js, no DOMContentLoaded needed here

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initServicesSlider };
}

/* ==========================================================================
   INTERACTIVE LOGIC - PORTFOLIO (PAULA DELGADO)
   ========================================================================== */

// --- Google Translate Initialization Callback (Global Scope - Defined Early) ---
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elements ---
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const sections = document.querySelectorAll('section');

    // --- Header Scroll Effect ---
    const checkScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Run once in case of page refresh mid-scroll

    // --- Mobile Hamburger Menu ---
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close menu when clicking nav link on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    // --- Active Link / Scroll Spy ---
    const activeScrollSpy = () => {
        let scrollPosition = window.scrollY + 150; // offset for header height and triggering early

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', activeScrollSpy);
    activeScrollSpy();

    // --- Intersection Observer for Scroll Animations ---
    const revealElements = [
        document.querySelector('.about-grid'),
        ...document.querySelectorAll('.info-card'),
        ...document.querySelectorAll('.timeline-item'),
        document.querySelector('.carousel-container'),
        ...document.querySelectorAll('.skills-card'),
        document.querySelector('.contact-grid')
    ];

    // Initialize elements with 'reveal' class
    revealElements.forEach(el => {
        if (el) el.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        if (el) revealObserver.observe(el);
    });

    // --- Contact Form Real Submission with Fetch API ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.textContent;
            
            // Get form inputs
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            // Simple validation
            if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
                showStatus('Please complete all required fields.', 'error');
                return;
            }

            // Start Loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            showStatus('', '');

            // Send actual POST request using fetch
            fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    showStatus('Message sent successfully! I will get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        if (data && Object.prototype.hasOwnProperty.call(data, 'errors')) {
                            showStatus(data.errors.map(error => error.message).join(", "), 'error');
                        } else {
                            showStatus('There was a problem sending your message. Please try again.', 'error');
                        }
                    });
                }
            })
            .catch(error => {
                showStatus('Connection error. Please check your internet connection.', 'error');
            })
            .finally(() => {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.style.opacity = '1';
            });
        });
    }

    // --- Projects Carousel Slider Logic ---
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    
    if (track && prevBtn && nextBtn && dotsContainer) {
        const cards = Array.from(track.children);
        let currentIndex = 0;
        let cardsPerView = 3;
        
        // Determine how many cards to show
        const updateCardsPerView = () => {
            const width = window.innerWidth;
            if (width <= 768) {
                cardsPerView = 1;
            } else if (width <= 1024) {
                cardsPerView = 2;
            } else {
                cardsPerView = 3;
            }
        };
        
        // Generate dots
        const createDots = () => {
            dotsContainer.innerHTML = '';
            const maxScrollIndex = cards.length - cardsPerView;
            const dotsCount = maxScrollIndex >= 0 ? maxScrollIndex + 1 : 1;
            
            for (let i = 0; i < dotsCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (i === currentIndex) dot.classList.add('active');
                dot.setAttribute('aria-label', `Go to project ${i + 1}`);
                dot.addEventListener('click', () => {
                    goToSlide(i);
                });
                dotsContainer.appendChild(dot);
            }
        };
        
        const updateCarousel = () => {
            if (cards.length === 0) return;
            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            const maxScrollIndex = cards.length - cardsPerView;
            
            // Boundary checks
            if (currentIndex > maxScrollIndex) {
                currentIndex = Math.max(0, maxScrollIndex);
            }
            
            const translateX = currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${translateX}px)`;
            
            // Update buttons
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxScrollIndex;
            
            // Update dots
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };
        
        const goToSlide = (index) => {
            currentIndex = index;
            updateCarousel();
        };
        
        // Button Event Listeners
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            const maxScrollIndex = cards.length - cardsPerView;
            if (currentIndex < maxScrollIndex) {
                currentIndex++;
                updateCarousel();
            }
        });
        
        // Swipe/Touch Support for mobile devices
        let startX = 0;
        let isDragging = false;
        let currentTranslate = 0;
        
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            track.style.transition = 'none'; // remove transition during drag
            
            const transformMatrix = window.getComputedStyle(track).transform;
            if (transformMatrix && transformMatrix !== 'none') {
                const values = transformMatrix.split('(')[1].split(')')[0].split(',');
                currentTranslate = parseFloat(values[4]) || 0;
            } else {
                currentTranslate = 0;
            }
        }, { passive: true });
        
        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            track.style.transform = `translateX(${currentTranslate + diffX}px)`;
        }, { passive: true });
        
        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform var(--transition-smooth)';
            
            const endX = e.changedTouches[0].clientX;
            const diffX = endX - startX;
            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            const threshold = (cardWidth + gap) / 4; // 25% swipe threshold
            
            const maxScrollIndex = cards.length - cardsPerView;
            
            if (diffX < -threshold && currentIndex < maxScrollIndex) {
                currentIndex++;
            } else if (diffX > threshold && currentIndex > 0) {
                currentIndex--;
            }
            
            updateCarousel();
        }, { passive: true });
        
        // Initialize & Resize handlers
        const init = () => {
            updateCardsPerView();
            createDots();
            setTimeout(updateCarousel, 100);
        };
        
        window.addEventListener('resize', () => {
            updateCardsPerView();
            createDots();
            updateCarousel();
        });
        
        init();
    }

    // Helper to display status message
    function showStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = 'form-status'; // reset
        
        if (type === 'success') {
            formStatus.classList.add('success');
        } else if (type === 'error') {
            formStatus.classList.add('error');
        }
    }

    // --- Google Translate Language Change Banner Listener ---
    const initTranslateListener = () => {
        const closeBtn = document.getElementById('lang-banner-close');
        const bannerEl = document.getElementById('lang-banner');
        const triggerBtn = document.getElementById('lang-banner-trigger');
        
        // Show/hide Banner toggle logic
        if (closeBtn && bannerEl && triggerBtn) {
            closeBtn.addEventListener('click', () => {
                bannerEl.style.display = 'none';
                triggerBtn.style.display = 'flex';
            });
            
            triggerBtn.addEventListener('click', () => {
                bannerEl.style.display = 'flex';
                triggerBtn.style.display = 'none';
            });
        }
    };

    initTranslateListener();
});

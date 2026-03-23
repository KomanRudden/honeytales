/* ==========================================
   Honey Tales Africa - Book Pages JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('show');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('show');
        });
    });

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- Scroll fade-in animations ---
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

    // --- Sample Pages Lightbox ---
    const lightbox = document.getElementById('pageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const thumbs = Array.from(document.querySelectorAll('.sample-thumb'));
    let currentIndex = 0;

    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = thumbs[index].src;
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
    }

    function showSlide(index) {
        currentIndex = (index + thumbs.length) % thumbs.length;
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = thumbs[currentIndex].src;
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    thumbs.forEach((thumb, i) => {
        thumb.addEventListener('click', () => openLightbox(i));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => showSlide(currentIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => showSlide(currentIndex + 1));

    lightbox && lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
        if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
    });

    // --- Book Cover Video (play once after 2s) ---
    const bookCoverVideo = document.getElementById('bookCoverVideo');
    if (bookCoverVideo) {
        bookCoverVideo.addEventListener('loadeddata', () => {
            bookCoverVideo.currentTime = 0.001;
        });
        window.addEventListener('load', () => {
            setTimeout(() => bookCoverVideo.play(), 2000);
        });
    }

    // --- Fact Card Hover Animations ---
    // Assign animation index and set up delayed hover with enter/leave animations
    document.querySelectorAll('.fact-card').forEach((card, i) => {
        card.dataset.anim = i % 3;

        let enterTimer = null;
        let isActive = false;

        card.addEventListener('mouseenter', () => {
            if (card.classList.contains('fact-card--leaving')) return;
            enterTimer = setTimeout(() => {
                isActive = true;
                card.classList.add('fact-card--active');
            }, 190);
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(enterTimer);
            enterTimer = null;
            if (!isActive) return;
            isActive = false;
            card.classList.remove('fact-card--active');
            card.classList.add('fact-card--leaving');

            const cleanup = () => {
                card.classList.remove('fact-card--leaving');
                card.removeEventListener('animationend', cleanup);
            };
            card.addEventListener('animationend', cleanup);
        });
    });

    // --- WhatsApp Widget ---
    const whatsappFab = document.getElementById('whatsappFab');
    const whatsappPopup = document.getElementById('whatsappPopup');
    const whatsappClose = document.getElementById('whatsappClose');
    const whatsappBadge = whatsappFab && whatsappFab.querySelector('.whatsapp-badge');

    if (whatsappFab) {
        whatsappFab.addEventListener('click', () => {
            whatsappPopup.classList.toggle('show');
            if (whatsappBadge) whatsappBadge.style.display = 'none';
        });
    }

    if (whatsappClose) {
        whatsappClose.addEventListener('click', (e) => {
            e.stopPropagation();
            whatsappPopup.classList.remove('show');
        });
    }

    document.addEventListener('click', (e) => {
        const widget = document.getElementById('whatsappWidget');
        if (widget && !widget.contains(e.target)) {
            whatsappPopup && whatsappPopup.classList.remove('show');
        }
    });

});

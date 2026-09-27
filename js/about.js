/* ==========================================
   Honey Tales Africa - Author Page JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- "44 Poems" counts up when it scrolls into view ---
    const counters = document.querySelectorAll('.bio-count[data-count]');
    if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                countObserver.unobserve(entry.target);
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const duration = 1200;
                const start = performance.now();
                function tick(now) {
                    const progress = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(target * eased);
                    if (progress < 1) requestAnimationFrame(tick);
                }
                el.textContent = '0';
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.6 });
        counters.forEach(el => countObserver.observe(el));
    }

    // --- Reviews: one speech bubble at a time ---
    const carousel = document.getElementById('testimonialCarousel');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.testimonial-card'));
    const dots = Array.from(carousel.querySelectorAll('.testimonial-dot'));
    const INTERVAL = 7000;
    let current = 0;
    let timer = null;

    function show(index) {
        const next = (index + slides.length) % slides.length;
        if (next === current && slides[current].classList.contains('is-active')) return;
        const leaving = slides[current];
        leaving.classList.remove('is-active');
        leaving.classList.add('is-leaving');
        setTimeout(() => leaving.classList.remove('is-leaving'), 500);
        current = next;
        slides[current].classList.add('is-active');
        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === current);
            dot.setAttribute('aria-current', i === current ? 'true' : 'false');
        });
    }

    function startTimer() {
        if (reduceMotion) return;
        stopTimer();
        timer = setInterval(() => show(current + 1), INTERVAL);
    }

    function stopTimer() {
        clearInterval(timer);
        timer = null;
    }

    slides[0].classList.add('is-active');
    dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === 0);
        dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => { show(i); startTimer(); });
    });
    carousel.querySelectorAll('.testimonial-nav').forEach(btn => {
        btn.addEventListener('click', () => {
            show(current + parseInt(btn.dataset.dir, 10));
            startTimer();
        });
    });

    // Pause while someone is reading or using the controls
    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    carousel.addEventListener('focusin', stopTimer);
    carousel.addEventListener('focusout', startTimer);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopTimer(); else startTimer();
    });

    startTimer();
});

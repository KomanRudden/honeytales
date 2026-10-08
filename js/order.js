/* ==========================================
   Honey Tales Africa – Order Page JS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // English / Afrikaans strings (js/i18n.js); plain English where it isn't loaded
    const i18n = window.HT_I18N;
    const t = (key) => i18n ? i18n.t(key) : key;

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // --- Mobile nav toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle) {
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
    }

    // --- Live exchange rates ---
    let fxRates = null;
    const orderFxConvert = document.getElementById('orderFxConvert');

    fetch('https://api.frankfurter.app/latest?from=ZAR&to=USD,GBP,EUR')
        .then(r => r.json())
        .then(data => {
            fxRates = data.rates;
            updateOrderFx(0);
        })
        .catch(() => {});

    function updateOrderFx(zarAmount) {
        if (!orderFxConvert) return;
        if (!fxRates || zarAmount === 0) {
            orderFxConvert.textContent = '';
            return;
        }
        const usd = (zarAmount * fxRates.USD).toFixed(0);
        const gbp = (zarAmount * fxRates.GBP).toFixed(0);
        const eur = (zarAmount * fxRates.EUR).toFixed(0);
        orderFxConvert.textContent = `≈ $${usd} · £${gbp} · €${eur}`;
    }

    // --- Book qty counters ---
    function initQtyCounters(container, totalAmountEl) {
        if (!container) return;

        const tiles = container.querySelectorAll('.order-book-tile, .book-order-tile');

        function recalcTotal() {
            let total = 0;
            tiles.forEach(tile => {
                const qty = parseInt(tile.dataset.qty || 0);
                const price = parseInt(tile.dataset.price || 190);
                total += qty * price;
            });
            if (totalAmountEl) totalAmountEl.textContent = `R${total}`;
            updateOrderFx(total);
        }

        tiles.forEach(tile => {
            tile.dataset.qty = '0';
            const display = tile.querySelector('.qty-display');
            const minusBtn = tile.querySelector('.qty-minus');
            const plusBtn = tile.querySelector('.qty-plus');

            minusBtn.disabled = true;

            plusBtn.addEventListener('click', () => {
                const qty = parseInt(tile.dataset.qty) + 1;
                tile.dataset.qty = qty;
                display.textContent = qty;
                tile.classList.add('has-qty');
                minusBtn.disabled = false;
                recalcTotal();
            });

            minusBtn.addEventListener('click', () => {
                const qty = Math.max(0, parseInt(tile.dataset.qty) - 1);
                tile.dataset.qty = qty;
                display.textContent = qty;
                if (qty === 0) {
                    tile.classList.remove('has-qty');
                    minusBtn.disabled = true;
                }
                recalcTotal();
            });
        });

        return function getOrderSummary() {
            const lines = [];
            tiles.forEach(tile => {
                const qty = parseInt(tile.dataset.qty || 0);
                if (qty > 0) {
                    lines.push(`${qty}× ${tile.dataset.title}`);
                }
            });
            return lines;
        };
    }

    // --- Order Form ---
    const orderForm = document.getElementById('orderForm');
    const orderSuccess = document.getElementById('orderSuccess');
    if (!orderForm) return;

    const totalAmountEl = document.getElementById('orderTotalAmount');
    const getOrderSummary = initQtyCounters(orderForm, totalAmountEl);
    if (i18n) i18n.initEditionPicker(orderForm.querySelector('.order-book-grid'), document.getElementById('otherEditionToggle'));

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Name
        const name = document.getElementById('name');
        const nameError = document.getElementById('nameError');
        if (name.value.trim().length < 2) {
            nameError.textContent = t('errName');
            name.classList.add('error');
            isValid = false;
        } else {
            nameError.textContent = '';
            name.classList.remove('error');
        }

        // Email
        const email = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
            emailError.textContent = t('errEmail');
            email.classList.add('error');
            isValid = false;
        } else {
            emailError.textContent = '';
            email.classList.remove('error');
        }

        // Phone
        const phone = document.getElementById('phone');
        const phoneError = document.getElementById('phoneError');
        const phoneVal = phone.value.replace(/[\s\-()]/g, '');
        if (phoneVal.length < 7) {
            phoneError.textContent = t('errPhone');
            phone.classList.add('error');
            isValid = false;
        } else {
            phoneError.textContent = '';
            phone.classList.remove('error');
        }

        // Address
        const address = document.getElementById('address');
        const addressError = document.getElementById('addressError');
        if (address.value.trim().length < 5) {
            addressError.textContent = t('errAddress');
            address.classList.add('error');
            isValid = false;
        } else {
            addressError.textContent = '';
            address.classList.remove('error');
        }

        // Country
        const country = document.getElementById('country');
        const countryError = document.getElementById('countryError');
        if (country.value.trim().length < 2) {
            countryError.textContent = t('errCountry');
            country.classList.add('error');
            isValid = false;
        } else {
            countryError.textContent = '';
            country.classList.remove('error');
        }

        // Books
        const booksError = document.getElementById('booksError');
        const booksOrdered = document.getElementById('booksOrdered');
        const summary = getOrderSummary();
        if (summary.length === 0) {
            booksError.textContent = t('errBooks');
            isValid = false;
        } else {
            booksError.textContent = '';
            booksOrdered.value = summary.join(', ') + ' — Total: ' + (totalAmountEl ? totalAmountEl.textContent : '');
        }

        if (!isValid) return;

        const submitBtn = orderForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = t('sending');

        fetch('https://formspree.io/f/xqeyoekr', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(orderForm)
        })
        .then(response => {
            if (response.ok) {
                orderSuccess.classList.add('show');
                orderForm.reset();
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                alert(t('sendFailed'));
                submitBtn.disabled = false;
                submitBtn.textContent = t('sendOrder');
            }
        })
        .catch(() => {
            alert(t('sendFailed'));
            submitBtn.disabled = false;
            submitBtn.textContent = t('sendOrder');
        });
    });

    // Clear error on input
    orderForm.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const err = input.parentElement.querySelector('.error-message');
            if (err) err.textContent = '';
        });
    });
});

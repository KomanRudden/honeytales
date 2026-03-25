/* ==========================================
   Honey Tales Africa - Main JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Live exchange rates (ZAR) ---
    let fxRates = null;
    const contactFxConvert = document.getElementById('contactFxConvert');
    const FX_CACHE_KEY = 'ht_fx_rates';
    const FX_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

    // Load from cache immediately so rates are available without waiting for the API
    try {
        const cached = JSON.parse(localStorage.getItem(FX_CACHE_KEY));
        if (cached && Date.now() - cached.ts < FX_CACHE_TTL) {
            fxRates = cached.rates;
        }
    } catch (e) {}

    // Always fetch fresh rates and update cache in background
    fetch('https://api.frankfurter.app/latest?from=ZAR&to=USD,GBP,EUR')
        .then(r => r.json())
        .then(data => {
            fxRates = data.rates;
            try {
                localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ rates: fxRates, ts: Date.now() }));
            } catch (e) {}
        })
        .catch(() => {});

    function startPriceCycle() {
        function run() {
            if (!fxRates) { setTimeout(run, 500); return; }
            const values = [
                `$${(180 * fxRates.USD).toFixed(0)}`,
                `£${(180 * fxRates.GBP).toFixed(0)}`,
                `€${(180 * fxRates.EUR).toFixed(0)}`,
                'R180'
            ];
            let idx = 0;
            function cycle() {
                scrollUp(statPrice, values[idx], () => {
                    idx = (idx + 1) % values.length;
                    setTimeout(cycle, 3000);
                });
            }
            cycle();
        }
        setTimeout(run, 30000);
    }

    function updateContactFx(zarAmount) {
        if (!contactFxConvert) return;
        if (!fxRates || zarAmount === 0) { contactFxConvert.textContent = ''; return; }
        const usd = (zarAmount * fxRates.USD).toFixed(0);
        const gbp = (zarAmount * fxRates.GBP).toFixed(0);
        const eur = (zarAmount * fxRates.EUR).toFixed(0);
        contactFxConvert.textContent = `≈ $${usd} · £${gbp} · €${eur}`;
    }

    // --- Hero Stats Scroll-Up Animations ---
    function scrollUp(el, value, onDone) {
        el.innerHTML = `<span class="stat-scroll">${value}</span>`;
        const inner = el.querySelector('.stat-scroll');
        inner.addEventListener('animationend', () => {
            // flatten — replace span with text so pop works on el directly
            el.textContent = value;
            pop(el, onDone);
        }, { once: true });
    }

    function pop(el, onDone) {
        el.classList.remove('stat-pop');
        void el.offsetWidth;
        el.classList.add('stat-pop');
        if (onDone) setTimeout(onDone, 600);
    }

    const statBooks = document.getElementById('statBooks');
    const statPoems = document.getElementById('statPoems');
    const statAge   = document.getElementById('statAge');
    const statPrice = document.getElementById('statPrice');

    if (statBooks) {
        // Chain: Books → Poems → Price → Age → Videos
        scrollUp(statBooks, '4', () => {
            scrollUp(statPoems, '44', () => {
                scrollUp(statPrice, 'R180', () => {
                    startPriceCycle(); // begin cycling currencies after 10s
                    // Lock width to final "Ages 0-100" size so the ? doesn't cause reflow
                    statAge.textContent = 'Ages 0\u2013100';
                    statAge.style.minWidth = statAge.offsetWidth + 'px';
                    statAge.style.textAlign = 'center';
                    statAge.textContent = '\u2013';

                    // Age: first scroll up "Ages 0–?", then 1s later scroll up "Ages 0–100"
                    scrollUp(statAge, 'Ages 0\u2013?', () => {
                        setTimeout(() => {
                            scrollUp(statAge, 'Ages 0\u2013100', () => {
                                startHeroVideos();
                            });
                        }, 1000);
                    });
                });
            });
        });
    }

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('show');
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('show');
        });
    });

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Hero Videos - play in sequence after counters finish ---
    const heroVideos = Array.from(document.querySelectorAll('.hero-book video'));

    function setPlayingBook(index) {
        heroVideos.forEach((v, i) => {
            v.closest('.hero-book').classList.toggle('is-playing', i === index);
        });
    }

    if (heroVideos.length) {
        heroVideos.forEach((video, i) => {
            // Seek to first frame so the video displays its own content instead of a poster
            video.addEventListener('loadeddata', () => {
                video.currentTime = 0.001;
                if (video.querySelector('source[src*="friends"]')) {
                    video.defaultPlaybackRate = 0.8;
                    video.playbackRate = 0.8;
                }
            });

            video.addEventListener('ended', () => {
                const next = heroVideos[i + 1];
                if (next) {
                    setPlayingBook(i + 1);
                    next.play();
                } else {
                    video.closest('.hero-book').classList.remove('is-playing');
                }
            });
        });
    }

    function startHeroVideos() {
        if (heroVideos.length) {
            setPlayingBook(0);
            heroVideos[0].play();
        }
    }

    // --- Scroll fade-in animations ---
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => fadeObserver.observe(el));

    // --- WhatsApp Widget ---
    const whatsappFab = document.getElementById('whatsappFab');
    const whatsappPopup = document.getElementById('whatsappPopup');
    const whatsappClose = document.getElementById('whatsappClose');
    const whatsappBadge = whatsappFab.querySelector('.whatsapp-badge');

    whatsappFab.addEventListener('click', () => {
        whatsappPopup.classList.toggle('show');
        // Hide badge once opened
        if (whatsappBadge) {
            whatsappBadge.style.display = 'none';
        }
    });

    whatsappClose.addEventListener('click', (e) => {
        e.stopPropagation();
        whatsappPopup.classList.remove('show');
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        const widget = document.getElementById('whatsappWidget');
        if (!widget.contains(e.target)) {
            whatsappPopup.classList.remove('show');
        }
    });

    // --- Order Books Toggle ---
    const orderToggle = document.getElementById('orderBooksToggle');
    const bookOrderSelector = document.getElementById('bookOrderSelector');

    if (orderToggle) {
        orderToggle.addEventListener('change', () => {
            bookOrderSelector.classList.toggle('show', orderToggle.checked);
        });
    }

    // --- Contact section book qty counters ---
    let contactGetSummary = null;
    if (bookOrderSelector) {
        const contactTotalEl = document.getElementById('contactTotalAmount');
        const tiles = bookOrderSelector.querySelectorAll('.book-order-tile');

        function recalcContactTotal() {
            let total = 0;
            tiles.forEach(tile => {
                const qty = parseInt(tile.dataset.qty || 0);
                total += qty * parseInt(tile.dataset.price || 180);
            });
            if (contactTotalEl) contactTotalEl.textContent = `R${total}`;
            updateContactFx(total);
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
                recalcContactTotal();
            });

            minusBtn.addEventListener('click', () => {
                const qty = Math.max(0, parseInt(tile.dataset.qty) - 1);
                tile.dataset.qty = qty;
                display.textContent = qty;
                if (qty === 0) {
                    tile.classList.remove('has-qty');
                    minusBtn.disabled = true;
                }
                recalcContactTotal();
            });
        });

        contactGetSummary = function() {
            const lines = [];
            tiles.forEach(tile => {
                const qty = parseInt(tile.dataset.qty || 0);
                if (qty > 0) lines.push(`${qty}× ${tile.dataset.title}`);
            });
            return lines;
        };
    }

    // --- Contact Form Validation & Submission ---
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Name validation
        const name = document.getElementById('name');
        const nameError = document.getElementById('nameError');
        if (name.value.trim().length < 2) {
            nameError.textContent = 'Please enter your name';
            name.classList.add('error');
            isValid = false;
        } else {
            nameError.textContent = '';
            name.classList.remove('error');
        }

        // Email validation
        const email = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
            emailError.textContent = 'Please enter a valid email address';
            email.classList.add('error');
            isValid = false;
        } else {
            emailError.textContent = '';
            email.classList.remove('error');
        }

        // Phone validation
        const phone = document.getElementById('phone');
        const phoneError = document.getElementById('phoneError');
        const phoneVal = phone.value.replace(/[\s\-()]/g, '');
        if (phoneVal.length < 7) {
            phoneError.textContent = 'Please enter your cell number';
            phone.classList.add('error');
            isValid = false;
        } else {
            phoneError.textContent = '';
            phone.classList.remove('error');
        }

        // Books & address validation (if ordering)
        const booksError = document.getElementById('booksError');
        const booksOrdered = document.getElementById('booksOrdered');
        const addressError = document.getElementById('addressError');
        const deliveryAddress = document.getElementById('deliveryAddress');

        if (orderToggle && orderToggle.checked) {
            const summary = contactGetSummary ? contactGetSummary() : [];
            const totalEl = document.getElementById('contactTotalAmount');

            if (summary.length === 0) {
                booksError.textContent = 'Please add at least one book';
                isValid = false;
            } else {
                booksError.textContent = '';
                booksOrdered.value = summary.join(', ') + (totalEl ? ' — Total: ' + totalEl.textContent : '');
            }

            if (deliveryAddress.value.trim().length < 5) {
                addressError.textContent = 'Please enter your delivery address';
                deliveryAddress.classList.add('error');
                isValid = false;
            } else {
                addressError.textContent = '';
                deliveryAddress.classList.remove('error');
            }

            const deliveryCountry = document.getElementById('deliveryCountry');
            const countryError = document.getElementById('countryError');
            if (deliveryCountry.value.trim().length < 2) {
                countryError.textContent = 'Please enter your country';
                deliveryCountry.classList.add('error');
                isValid = false;
            } else {
                countryError.textContent = '';
                deliveryCountry.classList.remove('error');
            }
        } else {
            booksOrdered.value = '';
        }

        // Message validation
        const message = document.getElementById('message');
        const messageError = document.getElementById('messageError');
        if (message.value.trim().length < 2) {
            messageError.textContent = 'Please enter a message';
            message.classList.add('error');
            isValid = false;
        } else {
            messageError.textContent = '';
            message.classList.remove('error');
        }

        if (isValid) {
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            fetch('https://formspree.io/f/xqeyoekr', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm)
            })
            .then(response => {
                if (response.ok) {
                    formSuccess.classList.add('show');
                    contactForm.reset();
                    bookOrderSelector.classList.remove('show');
                    setTimeout(() => formSuccess.classList.remove('show'), 5000);
                } else {
                    alert('Something went wrong. Please email us directly at admin@honeytales.co.za');
                }
            })
            .catch(() => {
                alert('Something went wrong. Please email us directly at admin@honeytales.co.za');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            });
        }
    });

    // Clear error styling on input
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorSpan = input.parentElement.querySelector('.error-message');
            if (errorSpan) errorSpan.textContent = '';
        });
    });

    // --- Poem Card Modal with Animal Facts ---
    const animalFacts = {
        lions: {
            title: 'Lions',
            facts: [
                'Lions are the only cats that live in groups called prides, which can have up to 30 members.',
                'A lion\'s roar can be heard from 8 kilometres away!',
                'Lions sleep for up to 20 hours a day to save energy for hunting.',
                'Female lions do most of the hunting, often working together as a team.',
                'Lion cubs are born with spots that fade as they grow older.'
            ]
        },
        rhino: {
            title: 'Rhino',
            facts: [
                'A rhino\'s horn is made of keratin, the same material as your fingernails!',
                'White rhinos aren\'t actually white \u2013 the name comes from the Dutch word "wijd" meaning wide, describing their mouth.',
                'Rhinos have very poor eyesight but an excellent sense of smell and hearing.',
                'A group of rhinos is called a "crash."',
                'Baby rhinos can stand up within an hour of being born.'
            ]
        },
        zebras: {
            title: 'Zebras',
            facts: [
                'Every zebra has a unique pattern of stripes, just like human fingerprints!',
                'Zebra stripes may help confuse flies and other biting insects.',
                'Baby zebras can run within just one hour of being born.',
                'Zebras sleep standing up so they can quickly escape from predators.',
                'A group of zebras is called a "dazzle" \u2013 how fitting!'
            ]
        },
        bees: {
            title: 'Bees',
            facts: [
                'A single bee can visit up to 5,000 flowers in one day!',
                'Honey bees communicate by doing a special "waggle dance" to tell other bees where food is.',
                'Bees have five eyes \u2013 two large ones and three tiny ones on top of their head.',
                'A teaspoon of honey is the life\'s work of about 12 bees.',
                'The queen bee can lay up to 2,000 eggs in a single day!'
            ]
        },
        ladybird: {
            title: 'Ladybird',
            facts: [
                'Ladybirds can eat up to 5,000 aphids (tiny plant bugs) in their lifetime!',
                'A ladybird\'s bright colours warn predators that they taste terrible.',
                'When scared, ladybirds play dead and release a smelly yellow liquid from their knees.',
                'There are over 5,000 different species of ladybirds around the world.',
                'In many cultures, ladybirds are considered a symbol of good luck.'
            ]
        },
        giraffe: {
            title: 'Giraffe',
            facts: [
                'Giraffes are the tallest animals on Earth \u2013 they can grow up to 5.5 metres tall!',
                'A giraffe\'s tongue is about 50 centimetres long and is dark purple to protect it from sunburn.',
                'Giraffes only need about 30 minutes of sleep per day, often in short naps.',
                'Baby giraffes can stand and walk within an hour of being born \u2013 and they\'re already 1.8 metres tall!',
                'No two giraffes have the same pattern of spots, just like human fingerprints.'
            ]
        },
        tortoise: {
            title: 'Mrs Tortoise',
            facts: [
                'Some tortoises can live for over 150 years \u2013 they\'re one of the longest-lived animals!',
                'A tortoise\'s shell is actually part of its skeleton, made up of about 60 bones.',
                'Tortoises have been on Earth for over 200 million years \u2013 they lived alongside dinosaurs!',
                'Tortoises can feel touch through their shell because it has nerve endings.',
                'The largest tortoise species can weigh over 400 kilograms.'
            ]
        },
        elephants: {
            title: 'Elephants',
            facts: [
                'Elephants are the largest land animals on Earth and can weigh up to 6,000 kilograms!',
                'An elephant\'s trunk has over 40,000 muscles and can pick up something as small as a peanut.',
                'Elephants are one of the few animals that can recognise themselves in a mirror.',
                'Baby elephants suck their trunks for comfort, just like human babies suck their thumbs!',
                'Elephants never forget \u2013 they have incredible memories and can remember friends for decades.'
            ]
        },
        gecko: {
            title: 'Gecko',
            facts: [
                'Geckos can walk on walls and even upside down on ceilings thanks to millions of tiny hairs on their feet!',
                'Most geckos don\'t have eyelids, so they lick their eyes to keep them clean.',
                'Geckos can drop their tail to escape predators \u2013 and it grows back!',
                'Some gecko species can change colour to blend in with their surroundings.',
                'Geckos are one of the few lizards that can make sounds \u2013 they chirp and click!'
            ]
        },
        shongololo: {
            title: 'Shongololo',
            facts: [
                'Shongololo is the Zulu name for a millipede \u2013 it means "to roll up."',
                'Despite their name meaning "thousand feet," most millipedes have between 80 and 400 legs.',
                'Millipedes are among the oldest land creatures \u2013 over 400 million years old!',
                'When threatened, shongololos curl into a tight spiral to protect their soft underside.',
                'Shongololos are helpful garden creatures \u2013 they break down dead leaves and enrich the soil.'
            ]
        },
        hyena: {
            title: 'Hyena',
            facts: [
                'A spotted hyena\'s giggle-like call can be heard up to 5 kilometres away!',
                'Hyenas have one of the strongest bites in the animal kingdom \u2013 strong enough to crush bone.',
                'Female spotted hyenas are larger and more dominant than males.',
                'Hyenas are actually more closely related to cats than to dogs!',
                'Hyena cubs are born with their eyes open and can see from birth.'
            ]
        },
        meerkat: {
            title: 'Meerkat',
            facts: [
                'Meerkats live in groups called "mobs" or "gangs" of up to 30 members!',
                'Meerkat sentries stand on their hind legs to watch for predators and bark to warn the group.',
                'Meerkats are immune to certain venoms, so they can eat scorpions and some snakes without harm!',
                'Baby meerkats are taught to hunt by adults who bring them live prey to practise with.',
                'Meerkats have dark patches around their eyes that act like built-in sunglasses, reducing glare.'
            ]
        }
    };

    const poemModal = document.getElementById('poemModal');
    const poemModalImg = document.getElementById('poemModalImg');
    const poemModalTitle = document.getElementById('poemModalTitle');
    const poemModalFacts = document.getElementById('poemModalFacts');
    const poemModalClose = document.getElementById('poemModalClose');

    function openPoemModal(card) {
        const animal = card.dataset.animal;
        const imgSrc = card.querySelector('img:not(.click-me-hint)').src;
        const data = animalFacts[animal];

        if (!data) return;

        poemModalImg.src = imgSrc;
        poemModalImg.alt = data.title + ' illustration';
        poemModalTitle.textContent = data.title;

        poemModalFacts.innerHTML = '';
        data.facts.forEach(fact => {
            const li = document.createElement('li');
            li.textContent = fact;
            poemModalFacts.appendChild(li);
        });

        poemModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closePoemModal() {
        poemModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Click handlers for animal items
    document.querySelectorAll('.animal-item[data-animal]').forEach(card => {
        card.addEventListener('click', () => openPoemModal(card));
    });

    // Close modal handlers
    poemModalClose.addEventListener('click', closePoemModal);

    poemModal.addEventListener('click', (e) => {
        if (e.target === poemModal) {
            closePoemModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && poemModal.classList.contains('show')) {
            closePoemModal();
        }
    });

});

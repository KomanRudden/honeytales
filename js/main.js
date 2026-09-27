/* ==========================================
   Honey Tales Africa - Main JavaScript
   ========================================== */

// --- Banner height sync (runs immediately, before DOMContentLoaded) ---
(function syncBannerOffset() {
    function update() {
        const banner = document.querySelector('.free-delivery-banner');
        const navbar = document.getElementById('navbar');
        if (!banner || !navbar) return;

        const bannerH = banner.offsetHeight;
        navbar.style.top = bannerH + 'px';

        requestAnimationFrame(function() {
            const totalH = bannerH + navbar.offsetHeight;
            document.documentElement.style.setProperty('--banner-h', bannerH + 'px');

            // Push each page's top section below the full header
            const hero = document.querySelector('.about-hero');
            if (hero) hero.style.paddingTop = (totalH + 20) + 'px';

            const orderPage = document.querySelector('.order-page');
            if (orderPage) orderPage.style.paddingTop = (totalH + 40) + 'px';
        });
    }
    document.addEventListener('DOMContentLoaded', update);
    window.addEventListener('resize', update);
})();

document.addEventListener('DOMContentLoaded', () => {

    // English / Afrikaans strings (js/i18n.js); plain English where it isn't loaded
    const i18n = window.HT_I18N;
    const t = (key) => i18n ? i18n.t(key) : key;

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

    let ageShown = false;
    if (i18n && statAge) {
        i18n.onChange(() => {
            statAge.style.minWidth = '';
            if (ageShown) statAge.textContent = t('ageFinal');
        });
    }

    if (statBooks) {
        // Chain: Books → Poems → Price → Age → Videos
        scrollUp(statBooks, '4', () => {
            scrollUp(statPoems, '44', () => {
                scrollUp(statPrice, 'R180', () => {
                    startPriceCycle(); // begin cycling currencies after 10s
                    // Lock width to final "Ages 0-100" size so the ? doesn't cause reflow
                    statAge.textContent = t('ageFinal');
                    statAge.style.minWidth = statAge.offsetWidth + 'px';
                    statAge.style.textAlign = 'center';
                    statAge.textContent = '\u2013';

                    // Age: first scroll up "Ages 0–?", then 1s later scroll up "Ages 0–100"
                    scrollUp(statAge, t('ageInterim'), () => {
                        setTimeout(() => {
                            scrollUp(statAge, t('ageFinal'), () => {
                                ageShown = true;
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

    function initCardIconAnimations() {
        if (typeof gsap === 'undefined' || !gsap) return;
        const cards = document.querySelectorAll('.fact-card[data-anim]');
        cards.forEach(card => {
            const icon = card.querySelector('.fact-card-icon img');
            if (!icon) return;
            gsap.set(icon, { transformOrigin: 'center center' });

            let idleTween = null;
            let hoverTween = null;

            const makeIdle = (type) => {
                switch (type) {
                    case '0':
                        return gsap.to(icon, { duration: 2.4, y: '+=8', rotation: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    case '1':
                        return gsap.to(icon, { duration: 2, x: '+=6', rotation: -3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    case '2':
                        return gsap.to(icon, { duration: 1.8, y: '+=10', scale: 1.03, yoyo: true, repeat: -1, ease: 'power1.inOut' });
                    case '3':
                        return gsap.to(icon, { duration: 1.5, x: '+=8', rotation: 8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    case '4':
                        return gsap.to(icon, { duration: 1.6, x: '-=6', y: '+=4', rotation: -6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    case '5':
                        return gsap.to(icon, { duration: 1.4, rotation: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    case '6':
                        return gsap.to(icon, { duration: 1.8, y: '+=12', scale: 1.05, yoyo: true, repeat: -1, ease: 'power1.inOut' });
                    case '7':
                        return gsap.to(icon, { duration: 2.2, rotation: 6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    case '8':
                        return gsap.to(icon, { duration: 1.9, x: '+=10', scale: 1.05, yoyo: true, repeat: -1, ease: 'power2.inOut' });
                    case '9':
                        return gsap.to(icon, { duration: 2.1, y: '+=6', scale: 1.04, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    case '10':
                        return gsap.to(icon, { duration: 1.7, x: '-=10', rotation: -8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    case '11':
                        return gsap.to(icon, { duration: 2.0, x: '+=5', rotation: 5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
                    default:
                        return gsap.to(icon, { duration: 2.2, y: '+=6', yoyo: true, repeat: -1, ease: 'sine.inOut' });
                }
            };

            const resetIcon = () => {
                if (hoverTween) hoverTween.kill();
                hoverTween = gsap.to(icon, {
                    duration: 0.35,
                    x: 0,
                    y: 0,
                    rotation: 0,
                    rotationY: 0,
                    scale: 1,
                    opacity: 1,
                    ease: 'elastic.out(1, 0.5)'
                });
                if (idleTween) idleTween.restart(true);
            };

            const playHover = () => {
                if (idleTween) idleTween.pause();
                if (hoverTween) hoverTween.kill();
                const type = card.dataset.anim;
                switch (type) {
                    case '0':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.35, y: -20, scale: 1.2, rotation: -12, ease: 'power1.out' })
                            .to(icon, { duration: 0.9, rotationY: 360, x: 18, y: -35, ease: 'power2.inOut' })
                            .to(icon, { duration: 0.55, x: 0, y: 0, rotation: 0, rotationY: 0, scale: 1, ease: 'elastic.out(1, 0.6)' });
                        break;
                    case '1':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.3, scale: 1.18, rotation: -6, ease: 'power1.out' })
                            .to(icon, { duration: 0.9, x: 20, y: -18, rotation: 10, ease: 'power3.out' })
                            .to(icon, { duration: 0.75, x: 0, y: 0, rotation: 0, scale: 1, ease: 'elastic.out(1, 0.5)' });
                        break;
                    case '2':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.2, y: -30, scale: 1.25, ease: 'power2.out' })
                            .to(icon, { duration: 0.15, y: 0, scale: 0.95, ease: 'power2.in' })
                            .to(icon, { duration: 0.25, scale: 1, ease: 'elastic.out(1, 0.5)' });
                        break;
                    case '3':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.2, x: 18, y: -12, rotation: 10, ease: 'power2.out' })
                            .to(icon, { duration: 0.18, x: -24, rotation: -12, ease: 'power2.inOut' })
                            .to(icon, { duration: 0.35, x: 0, y: 0, rotation: 0, ease: 'elastic.out(1, 0.5)' });
                        break;
                    case '4':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.25, y: -18, scale: 1.18, ease: 'power1.out' })
                            .to(icon, { duration: 0.25, x: -16, rotation: -18, ease: 'power2.out' })
                            .to(icon, { duration: 0.35, x: 0, y: 0, scale: 1, rotation: 0, ease: 'elastic.out(1, 0.6)' });
                        break;
                    case '5':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.18, scale: 1.3, ease: 'power1.out' })
                            .to(icon, { duration: 0.15, scale: 0.4, opacity: 0.2, ease: 'power2.in' })
                            .to(icon, { duration: 0.4, scale: 1, opacity: 1, ease: 'elastic.out(1, 0.5)' });
                        break;
                    case '6':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.18, y: -25, scale: 1.25, ease: 'power2.out' })
                            .to(icon, { duration: 0.15, y: 5, scale: 0.95, ease: 'power2.in' })
                            .to(icon, { duration: 0.35, y: 0, scale: 1, ease: 'elastic.out(1, 0.5)' });
                        break;
                    case '7':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.25, rotation: 15, x: 10, ease: 'power1.out' })
                            .to(icon, { duration: 0.25, rotation: -20, x: -10, ease: 'power1.inOut' })
                            .to(icon, { duration: 0.4, rotation: 0, x: 0, ease: 'elastic.out(1, 0.5)' });
                        break;
                    case '8':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.2, x: 28, scale: 1.18, ease: 'power1.out' })
                            .to(icon, { duration: 0.25, x: -16, ease: 'power1.inOut' })
                            .to(icon, { duration: 0.35, x: 0, scale: 1, ease: 'elastic.out(1, 0.5)' });
                        break;
                    case '9':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.2, scale: 1.15, y: -14, ease: 'power1.out' })
                            .to(icon, { duration: 0.25, rotate: 10, ease: 'power1.inOut' })
                            .to(icon, { duration: 0.35, scale: 1, y: 0, rotate: 0, ease: 'elastic.out(1, 0.5)' });
                        break;
                    case '10':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.18, x: 24, scale: 1.2, ease: 'power2.out' })
                            .to(icon, { duration: 0.25, x: -12, ease: 'power1.inOut' })
                            .to(icon, { duration: 0.35, x: 0, scale: 1, ease: 'elastic.out(1, 0.6)' });
                        break;
                    case '11':
                        hoverTween = gsap.timeline()
                            .to(icon, { duration: 0.15, scale: 1.4, ease: 'power1.out' })
                            .to(icon, { duration: 0.15, scale: 0.8, ease: 'power1.in' })
                            .to(icon, { duration: 0.4, scale: 1, ease: 'elastic.out(1, 0.5)' });
                        break;
                    default:
                        hoverTween = gsap.to(icon, { duration: 0.6, scale: 1.12, ease: 'power1.out' });
                        break;
                }

            };

            idleTween = makeIdle(card.dataset.anim);
            card.addEventListener('mouseenter', playHover);
            card.addEventListener('mouseleave', resetIcon);
        });
    }

    initCardIconAnimations();

    // --- Did You Know? fact deck: 3 cards at a time, shuffled from the books ---
    const BOOK_PAGES = { 1: 'books/africa.html', 2: 'books/goggas.html', 3: 'books/friends.html', 4: 'books/wild.html' };
    const FACT_CARDS = [
        { img: 'giraffe', book: 1,
          en: { name: 'Giraffe', stat: '5.5 m', label: 'tall – tallest on Earth', fact: 'Their tongue is about 50 cm long and dark purple to protect it from sunburn!' },
          af: { name: 'Kameelperd', stat: '5,5 m', label: 'lank – die langste op aarde', fact: 'Hul tong is omtrent 50 cm lank en donkerpers om dit teen sonbrand te beskerm!' } },
        { img: 'elephant', book: 1,
          en: { name: 'Elephant', stat: '40,000', label: 'muscles in one trunk', fact: 'Baby elephants suck their trunks for comfort, just like human babies suck their thumbs.' },
          af: { name: 'Olifant', stat: '40 000', label: 'spiere in een slurp', fact: 'Olifantbabas suig aan hul slurpe vir troos, net soos mensbabas aan hul duime suig.' } },
        { img: 'lion', book: 1,
          en: { name: 'Lion', stat: '8 km', label: 'away you can hear a roar', fact: 'Lions sleep up to 20 hours a day to save energy – the champions of napping!' },
          af: { name: 'Leeu', stat: '8 km', label: 'ver kan jy ’n brul hoor', fact: 'Leeus slaap tot 20 uur per dag om energie te spaar – die kampioene van middagslapies!' } },
        { img: 'bee', book: 1,
          en: { name: 'Honey Bee', stat: '5,000', label: 'flowers visited in one day', fact: 'Bees do a special waggle dance to tell the other bees where the food is.' },
          af: { name: 'Heuningby', stat: '5 000', label: 'blomme besoek in een dag', fact: 'Bye doen ’n spesiale wikkeldans om die ander bye te wys waar die kos is.' } },
        { img: 'ladybird', book: 1,
          en: { name: 'Ladybird', stat: '5,000', label: 'aphids eaten in a lifetime', fact: 'When scared, they play dead and release a smelly yellow liquid from their knees!' },
          af: { name: 'Liewenheersbesie', stat: '5 000', label: 'plantluise geëet in een leeftyd', fact: 'As hulle bang is, speel hulle dood en skei ’n stink geel vloeistof uit hul knieë af!' } },
        { img: 'frog', book: 2,
          en: { name: 'Frog', stat: '130+', label: 'frog species in South Africa', fact: 'Frogs don’t drink water – they soak it up through their skin! Some can even freeze solid in winter and thaw out in spring.' },
          af: { name: 'Padda', stat: '130+', label: 'paddaspesies in Suid-Afrika', fact: 'Paddas drink nie water nie – hulle absorbeer dit deur hul vel! Sommige kan selfs in die winter heeltemal vries en in die lente weer ontdooi.' } },
        { img: 'mosquito', book: 2,
          en: { name: 'Mosquito', stat: '50 m', label: 'away they can smell you', fact: 'Only female mosquitoes bite. They find you by sniffing out the carbon dioxide you breathe out!' },
          af: { name: 'Muskiet', stat: '50 m', label: 'ver kan hulle jou ruik', fact: 'Net wyfiemuskiete byt. Hulle vind jou deur die koolstofdioksied wat jy uitasem, uit te snuffel!' } },
        { img: 'baboon', book: 3,
          en: { name: 'Baboon', stat: '300', label: 'baboons in one troop', fact: 'Baboons groom each other to build friendships, and use more than 30 different calls.' },
          af: { name: 'Bobbejaan', stat: '300', label: 'bobbejane in een trop', fact: 'Bobbejane vlooi mekaar om vriendskappe te bou, en gebruik meer as 30 verskillende roepe.' } },
        { img: 'warthog', book: 3,
          en: { name: 'Warthog', stat: '48 km/h', label: 'top running speed', fact: 'Warthogs kneel on their front legs to graze – they even have special knee pads!' },
          af: { name: 'Vlakvark', stat: '48 km/h', label: 'topspoed as hulle hardloop', fact: 'Vlakvarke kniel op hul voorpote om te wei – hulle het selfs spesiale kniekussings!' } },
        { img: 'hippo', book: 3,
          en: { name: 'Hippo', stat: '16 hours', label: 'a day spent in water', fact: 'Hippos make their own pink sunscreen, and can run up to 30 km/h on land!' },
          af: { name: 'Seekoei', stat: '16 uur', label: 'per dag in die water', fact: 'Seekoeie maak hul eie pienk sonskerm, en kan tot 30 km/h op land hardloop!' } },
        { img: 'cheetah', book: 4,
          en: { name: 'Cheetah', stat: '112 km/h', label: 'fastest land animal', fact: 'Unlike other big cats, cheetahs purr instead of roar!' },
          af: { name: 'Jagluiperd', stat: '112 km/h', label: 'die vinnigste landdier', fact: 'Anders as ander grootkatte spin jagluiperds eerder as om te brul!' } },
        { img: 'crocodile', book: 4,
          en: { name: 'Crocodile', stat: '200 million', label: 'years on Earth', fact: 'Crocodiles outlived the dinosaurs, and can go months without eating after a big meal.' },
          af: { name: 'Krokodil', stat: '200 miljoen', label: 'jaar op aarde', fact: 'Krokodille het die dinosourusse oorleef, en kan maande sonder kos klaarkom ná ’n groot maal.' } }
    ];

    const factDeck = document.getElementById('factDeck');
    const factShuffle = document.getElementById('factShuffle');

    if (factDeck && factShuffle) {
        const HAND_SIZE = 3;
        const TILTS = ['-2deg', '1.5deg', '-1deg'];
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let hand = [];
        let bag = [];

        function shuffled(list) {
            const out = list.slice();
            for (let i = out.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [out[i], out[j]] = [out[j], out[i]];
            }
            return out;
        }

        // Deals every fact once before any repeats, never re-dealing a card that's on the table
        function drawHand() {
            const next = [];
            while (next.length < HAND_SIZE) {
                if (!bag.length) {
                    bag = shuffled(FACT_CARDS.map((_, i) => i).filter(i => !hand.includes(i) && !next.includes(i)));
                }
                next.push(bag.pop());
            }
            return next;
        }

        function cardHtml(index, slot) {
            const card = FACT_CARDS[index];
            const af = i18n && i18n.lang === 'af';
            const text = af ? card.af : card.en;
            const bookLabel = (af ? 'Boek ' : 'Book ') + card.book;
            const alt = af ? `${text.name} uit Honey Tales Afrika Boek ${card.book}` : `${text.name} from Honey Tales Africa Book ${card.book}`;
            return `
                <article class="fact-collector" style="--tilt: ${TILTS[slot]}; --i: ${slot}">
                    <div class="fact-collector-art">
                        <img src="assets/images/facts/${card.img}.jpg" alt="${alt}" width="640" height="480">
                        <a class="fact-collector-book" href="${BOOK_PAGES[card.book]}">${bookLabel}</a>
                    </div>
                    <h3 class="fact-collector-name">${text.name}</h3>
                    <div class="fact-collector-stat">
                        <span class="fact-collector-num">${text.stat}</span>
                        <span class="fact-collector-label">${text.label}</span>
                    </div>
                    <p>${text.fact}</p>
                </article>`;
        }

        function renderHand(animate) {
            factDeck.innerHTML = hand.map(cardHtml).join('');
            if (animate && !reduceMotion) factDeck.classList.add('is-dealing');
        }

        hand = drawHand();
        renderHand(false);

        factShuffle.addEventListener('click', () => {
            if (factShuffle.disabled) return;
            factShuffle.disabled = true;
            factDeck.classList.remove('is-dealing');
            if (reduceMotion) {
                hand = drawHand();
                renderHand(false);
                factShuffle.disabled = false;
                return;
            }
            factDeck.classList.add('is-leaving');
            setTimeout(() => {
                factDeck.classList.remove('is-leaving');
                hand = drawHand();
                renderHand(true);
                setTimeout(() => {
                    factDeck.classList.remove('is-dealing');
                    factShuffle.disabled = false;
                }, 750);
            }, 380);
        });

        if (i18n) i18n.onChange(() => renderHand(false));
    }

    // --- Card Stacking Scroll Animation ---
    function initCardStacking() {
        if (typeof gsap === 'undefined' || !gsap) return;

        gsap.registerPlugin(ScrollTrigger);

        const cards = Array.from(document.querySelectorAll('.fact-card'));
        const section = document.querySelector('.animals-section');
        const grid = document.querySelector('.facts-grid');

        if (!cards.length || !section || !grid) return;

        // Get initial positions before changing layout
        const initialPositions = cards.map(card => ({
            left: card.offsetLeft,
            top: card.offsetTop,
            width: card.offsetWidth,
            height: card.offsetHeight
        }));

        const gridRect = grid.getBoundingClientRect();
        const centerX = grid.offsetWidth / 2;
        const initialYOffsets = cards.map((_, i) => 200 + i * 20); // Start below viewport

        // Disable grid layout to allow absolute positioning
        gsap.set(grid, { display: 'block' });

        // Set cards to absolute positioning, starting below
        cards.forEach((card, i) => {
            const targetX = centerX - (initialPositions[i].width / 2);
            if (i === 0) {
                // First card starts at center, visible
                gsap.set(card, {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: initialPositions[i].width + 'px',
                    x: targetX,
                    y: 0,
                    zIndex: 1,
                    opacity: 1
                });
            } else {
                gsap.set(card, {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: initialPositions[i].width + 'px',
                    x: 0,
                    y: initialYOffsets[i],
                    zIndex: 1,
                    opacity: 0
                });
            }
        });

        // Calculate total scroll height
        const cardHeight = 400;
        const stackOffset = 0; // They stack at same position
        const totalHeight = 800; // Scroll height

        gsap.set(grid, { height: totalHeight + 'px' });

        // ScrollTrigger for stacking
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "+=" + totalHeight,
            pin: true,
            scrub: 1,
            // markers: true, // Debug markers
            snap: {
                snapTo: (value) => {
                    const points = [];
                    for (let i = 0; i <= cards.length; i++) {
                        points.push(i / cards.length);
                    }
                    return gsap.utils.snap(points, value);
                },
                duration: { min: 0.2, max: 0.8 },
                ease: "power2.inOut"
            },
            onUpdate: (self) => {
                const progress = self.progress;

                cards.forEach((card, i) => {
                    const targetX = centerX - (initialPositions[i].width / 2);
                    const targetY = 0;

                    if (i === 0) {
                        // First card stays at center
                        gsap.set(card, {
                            x: targetX,
                            y: 0,
                            zIndex: 1,
                            opacity: 1,
                            scale: 1
                        });
                        return;
                    }

                    const cardStart = (i - 1) / cards.length;
                    const cardEnd = i / cards.length;
                    const cardProgress = gsap.utils.clamp(0, 1, (progress - cardStart) / (cardEnd - cardStart));

                    gsap.set(card, {
                        x: cardProgress * targetX,
                        y: initialYOffsets[i] * (1 - cardProgress),
                        zIndex: i + 1,
                        opacity: cardProgress,
                        scale: 1 - (cardProgress * 0.05)
                    });

                    if (cardProgress > 0.9) {
                        gsap.to(card, {
                            duration: 0.3,
                            x: targetX,
                            y: targetY,
                            opacity: 1,
                            scale: 1,
                            ease: "elastic.out(1, 0.5)"
                        });
                    }
                });
            }
        });
    }

    // initCardStacking();

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

        if (i18n) i18n.initEditionPicker(bookOrderSelector, document.getElementById('otherEditionToggle'));
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
            nameError.textContent = t('errName');
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
            emailError.textContent = t('errEmail');
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
            phoneError.textContent = t('errPhone');
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
                booksError.textContent = t('errBooks');
                isValid = false;
            } else {
                booksError.textContent = '';
                booksOrdered.value = summary.join(', ') + (totalEl ? ' — Total: ' + totalEl.textContent : '');
            }

            if (deliveryAddress.value.trim().length < 5) {
                addressError.textContent = t('errAddress');
                deliveryAddress.classList.add('error');
                isValid = false;
            } else {
                addressError.textContent = '';
                deliveryAddress.classList.remove('error');
            }

            const deliveryCountry = document.getElementById('deliveryCountry');
            const countryError = document.getElementById('countryError');
            if (deliveryCountry.value.trim().length < 2) {
                countryError.textContent = t('errCountry');
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
            messageError.textContent = t('errMessage');
            message.classList.add('error');
            isValid = false;
        } else {
            messageError.textContent = '';
            message.classList.remove('error');
        }

        if (isValid) {
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = t('sending');

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
                    alert(t('sendFailed'));
                }
            })
            .catch(() => {
                alert(t('sendFailed'));
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = t('send');
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

    const animalFactsAf = {
        lions: {
            title: 'Leeus',
            facts: [
                'Leeus is die enigste katte wat in groepe leef. Só ’n groep word ’n trop genoem en kan tot 30 lede hê.',
                '’n Leeu se brul kan tot 8 kilometer ver gehoor word!',
                'Leeus slaap tot 20 uur per dag om energie vir die jag te spaar.',
                'Leeuwyfies doen die meeste van die jag en werk dikwels saam as ’n span.',
                'Leeuwelpies word met kolle gebore wat vervaag soos hulle ouer word.'
            ]
        },
        rhino: {
            title: 'Renoster',
            facts: [
                '’n Renoster se horing is van keratien gemaak, dieselfde stof as jou vingernaels!',
                'Witrenosters is nie regtig wit nie – die naam kom van die Nederlandse woord "wijd", wat breed beteken en hul bek beskryf.',
                'Renosters sien baie swak, maar hulle kan uitstekend ruik en hoor.',
                '’n Groep renosters word in Engels ’n "crash" genoem.',
                'Renosterkalfies kan binne ’n uur ná hul geboorte opstaan.'
            ]
        },
        zebras: {
            title: 'Sebras',
            facts: [
                'Elke sebra het ’n unieke streeppatroon, net soos mense se vingerafdrukke!',
                'Sebrastrepe help dalk om vlieë en ander bytende insekte te verwar.',
                'Sebravullens kan binne net een uur ná hul geboorte hardloop.',
                'Sebras slaap staan-staan sodat hulle vinnig van roofdiere kan wegkom.',
                '’n Groep sebras word in Engels ’n "dazzle" genoem – dit beteken "verblind". Hoe gepas!'
            ]
        },
        bees: {
            title: 'Bye',
            facts: [
                '’n Enkele by kan tot 5 000 blomme op een dag besoek!',
                'Heuningbye doen ’n spesiale "wikkeldans" om ander bye te wys waar kos is.',
                'Bye het vyf oë – twee groot oë en drie piepklein oëtjies bo-op hul kop.',
                '’n Teelepel heuning is die lewenswerk van omtrent 12 bye.',
                'Die koninginby kan tot 2 000 eiers op ’n enkele dag lê!'
            ]
        },
        ladybird: {
            title: 'Liewenheersbesie',
            facts: [
                'Liewenheersbesies kan tot 5 000 plantluise (klein plantgoggas) in hul leeftyd eet!',
                '’n Liewenheersbesie se helder kleure waarsku roofdiere dat hulle aaklig smaak.',
                'As hulle bang is, speel liewenheersbesies dood en skei ’n stink geel vloeistof uit hul knieë af.',
                'Daar is meer as 5 000 verskillende spesies liewenheersbesies regoor die wêreld.',
                'In baie kulture word liewenheersbesies as ’n teken van geluk beskou.'
            ]
        },
        giraffe: {
            title: 'Kameelperd',
            facts: [
                'Kameelperde is die langste diere op aarde – hulle kan tot 5,5 meter lank word!',
                '’n Kameelperd se tong is omtrent 50 sentimeter lank en donkerpers om dit teen sonbrand te beskerm.',
                'Kameelperde het net omtrent 30 minute slaap per dag nodig, dikwels in kort slapies.',
                'Kameelperdkalfies kan binne ’n uur ná hul geboorte staan en loop – en hulle is reeds 1,8 meter lank!',
                'Geen twee kameelperde het dieselfde kolpatroon nie, net soos mense se vingerafdrukke.'
            ]
        },
        tortoise: {
            title: 'Mevrou Skilpad',
            facts: [
                'Sommige skilpaaie kan langer as 150 jaar leef – hulle is van die diere wat die langste leef!',
                '’n Skilpad se dop is eintlik deel van sy geraamte en bestaan uit omtrent 60 bene.',
                'Skilpaaie is al meer as 200 miljoen jaar op aarde – hulle het saam met die dinosourusse geleef!',
                'Skilpaaie kan aanraking deur hul dop voel, want dit het senuwee-eindes.',
                'Die grootste skilpadspesie kan meer as 400 kilogram weeg.'
            ]
        },
        elephants: {
            title: 'Olifante',
            facts: [
                'Olifante is die grootste landdiere op aarde en kan tot 6 000 kilogram weeg!',
                '’n Olifant se slurp het meer as 40 000 spiere en kan iets so klein soos ’n grondboontjie optel.',
                'Olifante is van die min diere wat hulself in ’n spieël kan herken.',
                'Olifantbabas suig aan hul slurpe vir troos, net soos mensbabas aan hul duime suig!',
                'Olifante vergeet nooit nie – hulle het ’n ongelooflike geheue en kan vriende vir dekades onthou.'
            ]
        },
        gecko: {
            title: 'Geitjie',
            facts: [
                'Geitjies kan teen mure loop en selfs onderstebo teen plafonne, danksy miljoene piepklein haartjies op hul pootjies!',
                'Die meeste geitjies het nie ooglede nie, so hulle lek hul oë om dit skoon te hou.',
                'Geitjies kan hul stert laat val om van roofdiere te ontsnap – en dit groei weer terug!',
                'Sommige geitjiespesies kan van kleur verander om by hul omgewing in te pas.',
                'Geitjies is van die min akkedisse wat geluide kan maak – hulle tjirp en klik!'
            ]
        },
        shongololo: {
            title: 'Shongololo',
            facts: [
                'Shongololo is die Zoeloenaam vir ’n duisendpoot – dit beteken "om op te rol".',
                'Al beteken die naam "duisendpoot", het die meeste duisendpote tussen 80 en 400 pote.',
                'Duisendpote is van die oudste landdiere – meer as 400 miljoen jaar oud!',
                'Wanneer hulle bedreig word, krul shongololos in ’n stywe spiraal op om hul sagte onderlyf te beskerm.',
                'Shongololos is nuttige tuindiertjies – hulle breek dooie blare af en verryk die grond.'
            ]
        },
        hyena: {
            title: 'Hiëna',
            facts: [
                '’n Gevlekte hiëna se giggelroep kan tot 5 kilometer ver gehoor word!',
                'Hiënas het een van die sterkste byte in die diereryk – sterk genoeg om bene te kraak.',
                'Gevlekte hiënawyfies is groter en meer dominant as die mannetjies.',
                'Hiënas is eintlik nader verwant aan katte as aan honde!',
                'Hiënawelpies word met oop oë gebore en kan van geboorte af sien.'
            ]
        },
        meerkat: {
            title: 'Meerkat',
            facts: [
                'Meerkatte leef in groepe van tot 30 lede!',
                'Meerkat-wagte staan op hul agterpote om uit te kyk vir roofdiere en blaf om die groep te waarsku.',
                'Meerkatte is immuun teen sekere soorte gif, so hulle kan skerpioene en sommige slange sonder skade eet!',
                'Meerkatkleintjies leer jag by volwassenes wat vir hulle lewende prooi bring om mee te oefen.',
                'Meerkatte het donker kolle om hul oë wat soos ingeboude sonbrille werk en die glans verminder.'
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
        const data = (i18n && i18n.lang === 'af' && animalFactsAf[animal]) || animalFacts[animal];

        if (!data) return;

        poemModalImg.src = imgSrc;
        poemModalImg.alt = data.title + ' ' + t('illustration');
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

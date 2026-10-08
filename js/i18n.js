/* ==========================================
   Honey Tales Africa - English / Afrikaans toggle
   ==========================================
   Static text: tag an element with data-i18n="key" and add the Afrikaans
   version to PAGE_AF below. The English text is read from the HTML itself.
   Attributes: data-i18n-placeholder, data-i18n-alt, data-i18n-aria-label,
   data-i18n-href and data-i18n-content work the same way.
   Images: data-af-src="path" holds the Afrikaans image for an <img>.
   Elements marked .lang-en-only / .lang-af-only show in one language only.
   Script text: add both languages to SCRIPT_STRINGS and call HT_I18N.t(key).
   ========================================== */

window.HT_I18N = (function () {
    const STORAGE_KEY = 'ht_lang';
    const ATTRS = ['placeholder', 'alt', 'aria-label', 'href', 'content'];

    const PAGE_AF = {
        'meta.title': 'Honey Tales Afrika - Gedigte vir Jonk en Oud deur Carol Honey',
        'meta.description': 'Honey Tales Afrika - heerlike kindergedigte oor Afrika se wild deur Carol Honey. Leeus, olifante, kameelperde en meer!',

        'banner.long': 'Bestel al 4 boeke en kry <strong>gratis koeriersaflewering</strong> enige plek in Suid-Afrika!',
        'banner.short': 'Al 4 boeke = <strong>gratis aflewering</strong> in SA!',

        'nav.langToggle': 'Also in <strong>English!</strong>',
        'nav.langToggleLabel': 'Read this page in English',
        'nav.home': 'Tuis',
        'nav.animals': 'Diere',
        'nav.books': 'Boeke',
        'nav.author': 'Skrywer',
        'nav.contact': 'Kontak',
        'nav.order': 'Bestel',

        'stats.books': 'Boeke',
        'stats.poems': 'Gedigte',
        'stats.everyone': 'Vir almal',
        'stats.perBook': 'Per boek',

        'animals.title': 'Klik op die Diere',
        'animals.subtitle': 'Klik op ’n dier om prettige feite oor hom te ontdek',
        'animals.giraffe': 'Kameelperd',
        'animals.giraffeAlt': 'Kameelperd - spotprent van ’n kameelperd met ’n rooi serp',
        'animals.zebra': 'Sebra',
        'animals.zebraAlt': 'Sebra - spotprent van ’n sebra met swart en wit strepe',
        'animals.meerkat': 'Meerkat',
        'animals.meerkatAlt': 'Meerkat - spotprent van ’n meerkat wat regop staan',

        'facts.title': 'Het Jy Geweet?',
        'facts.shuffle': 'Deel nog feite uit!',

        'contact.title': 'Kontak Ons',
        'contact.subtitle': 'Wil jy ’n eksemplaar bestel of meer uitvind? Ons hoor graag van jou!',
        'contact.name': 'Jou Naam <span class="required">*</span>',
        'contact.namePlaceholder': 'Tik jou naam in',
        'contact.email': 'E-posadres <span class="required">*</span>',
        'contact.emailPlaceholder': 'Tik jou e-posadres in',
        'contact.phone': 'Selnommer <span class="required">*</span>',
        'contact.phonePlaceholder': 'bv. 083 261 0732',
        'contact.orderToggle': 'Ek wil graag boeke bestel',
        'contact.selectBooks': 'Kies die boeke wat jy wil hê:',
        'book.1': 'Boek 1',
        'book.2': 'Boek 2',
        'book.3': 'Boek 3',
        'book.4': 'Boek 4',
        'contact.remove': 'Verwyder',
        'contact.add': 'Voeg by',
        'contact.booksTotal': 'Totaal vir boeke',
        'contact.address': 'Afleweringsadres',
        'contact.addressPlaceholder': 'Straat, voorstad, stad, poskode',
        'contact.country': 'Land',
        'contact.countryPlaceholder': 'bv. Suid-Afrika',
        'contact.orderNote': '📦 Bestel al 4 boeke en kry <strong>gratis posgeld</strong> enige plek in Suid-Afrika! Andersins is posgeld betaalbaar — ons sal die finale prys met jou bevestig. Hierdie boodskap plaas jou onder geen verpligting nie.',
        'contact.message': 'Boodskap <span class="required">*</span>',
        'contact.messagePlaceholder': 'Is daar nog iets wat jy wil sê?',
        'contact.send': 'Stuur Boodskap',
        'contact.success': 'Dankie! Ons kontak jou binnekort.',

        'footer.tagline': 'Gedigte vir Jonk en Oud deur Carol Honey',
        'footer.publisher': 'Uitgegee deur Hive Publishing &bull; 2016',
        'footer.quickLinks': 'Vinnige Skakels',
        'footer.contact': 'Kontak',
        'footer.rights': '&copy; Carol Honey. Alle regte voorbehou.',
        'footer.credit': 'Ontwerp &amp; gebou deur <a href="https://onzs.co.za" target="_blank" rel="noopener noreferrer">OnesnZeros</a>',

        'whatsapp.title': 'Gesels met ons!',
        'whatsapp.body': 'Hallo daar! Wil jy boeke bestel? Gesels met ons op WhatsApp!',
        'whatsapp.link': 'https://wa.me/27832610732?text=Hallo!%20Ek%20stel%20belang%20in%20Honey%20Tales%20Africa',
        'whatsapp.start': 'Begin Gesels',
        'whatsapp.open': 'Maak WhatsApp-gesprek oop',

        'modal.didYouKnow': 'Het jy geweet?',
        'modal.close': 'Maak toe',

        // --- Book editions (order forms and book pages) ---
        'edition.otherToggle': 'Bestel ook <strong>Engelse</strong> boeke',
        'edition.en': 'Engels',
        'edition.af': 'Afrikaans',
        'cover.1Alt': 'Boek 1 – Honey Tales Afrika',
        'cover.2Alt': 'Boek 2 – Goggas en Kriewelende Kruipertjies',
        'cover.3Alt': 'Boek 3 – Vriende: Veld en Vere',
        'cover.4Alt': 'Boek 4 – Wild en Wonderlik',
        'coverEn.1Alt': 'Boek 1 – Honey Tales Africa (Engels)',
        'coverEn.2Alt': 'Boek 2 – Goggas & Creepy-Crawlies (Engels)',
        'coverEn.3Alt': 'Boek 3 – Furry & Feathered Friends (Engels)',
        'coverEn.4Alt': 'Boek 4 – Wild & Wonderful (Engels)',
        'order.en1': 'Boek 1 – Honey Tales Africa',
        'order.en2': 'Boek 2 – Goggas &amp; Creepy-Crawlies',
        'order.en3': 'Boek 3 – Furry &amp; Feathered Friends',
        'order.en4': 'Boek 4 – Wild &amp; Wonderful',
        'order.af1': 'Boek 1 – Honey Tales Afrika',
        'order.af2': 'Boek 2 – Goggas en Kriewelende Kruipertjies',
        'order.af3': 'Boek 3 – Vriende: Veld en Vere',
        'order.af4': 'Boek 4 – Wild en Wonderlik',

        // --- Book pages ---
        'book.poems': '11 Gedigte',
        'book.ages': 'Ouderdom 0–100',
        'book.orderCopy': 'Bestel Jou Eksemplaar',
        'book.inside': 'Binne-in die Boek',
        'book.insideSub': 'Klik op die voorbeeld om dit van nader te bekyk',
        'book.ready': 'Gereed om te Lees?',
        'lightbox.close': 'Maak toe',
        'lightbox.prev': 'Vorige',
        'lightbox.next': 'Volgende',
        'lightbox.img': 'Boekbladsy',

        'b1.title': 'Honey Tales Afrika – Boek 1 | Gedigte vir Jonk en Oud',
        'b1.meta': 'Honey Tales Afrika Boek 1 – 11 heerlike gedigte oor Afrika se wild deur Carol Honey. Leeus, kameelperde, olifante en meer!',
        'b1.h1': 'Honey Tales Afrika',
        'b1.desc': 'Reis deur die Afrika-savanne met 11 heerlike gedigte oor die vasteland se boeiendste diere. Van die rysige kameelperd tot die klein shongololo – elke gedig bring Afrika se wild tot lewe met humor, warmte en ’n liefde vir die natuur.',
        'b1.sampleAlt': 'Olifante – voorbeeldbladsy',
        'b1.cta': 'Kry jou eksemplaar van Honey Tales Afrika Boek 1 en ontdek al 11 gedigte met hul pragtige illustrasies. Perfek vir slaaptydstories, die klaskamer en as geskenk!',

        'b2.title': 'Honey Tales Afrika – Goggas en Kriewelende Kruipertjies | Boek 2',
        'b2.meta': 'Honey Tales Afrika Boek 2 – Goggas en Kriewelende Kruipertjies. 11 prettige gedigte oor Suid-Afrika se insekte en goggas deur Carol Honey.',
        'b2.h1': 'Goggas en Kriewelende Kruipertjies',
        'b2.desc': 'Duik in die fassinerende miniatuurwêreld van Suid-Afrika se goggas! Hierdie 11 pret-gevulde gedigte vier die kruipende en kriewelende diertjies wat ons wêreld met ons deel – van die ywerige by tot die skitterende skoenlapper – met Carol Honey se kenmerkende warmte en humor.',
        'b2.sampleAlt': 'Pappa en die Spinnekop – voorbeeldbladsy',
        'b2.cta': 'Kry jou eksemplaar van Honey Tales Afrika Boek 2 en verken saam met jou kleintjies die wonderlike wêreld van goggas!',

        'b3.title': 'Honey Tales Afrika – Vriende: Veld en Vere | Boek 3',
        'b3.meta': 'Honey Tales Afrika Boek 3 – Vriende: Veld en Vere. 11 prettige gedigte oor Suid-Afrika se soogdiere en voëls deur Carol Honey.',
        'b3.h1': 'Vriende: Veld en Vere',
        'b3.desc': 'Van die boomtoppe tot op die savanne – ontmoet die harige en geveerde diere wat Afrika so buitengewoon maak! Hierdie 11 sjarmante gedigte bring Afrika se geliefde soogdiere en voëls tot lewe met Carol Honey se kenmerkende warmte, geestigheid en verwondering.',
        'b3.sampleAlt': 'Meneer Pou – voorbeeldbladsy',
        'b3.cta': 'Kry jou eksemplaar van Honey Tales Afrika Boek 3 en ontmoet saam met jou kleintjies al Afrika se harige en geveerde vriende!',

        'b4.title': 'Honey Tales Afrika – Wild en Wonderlik | Boek 4',
        'b4.meta': 'Honey Tales Afrika Boek 4 – Wild en Wonderlik. 11 prettige gedigte oor Afrika se buitengewoonste wilde diere deur Carol Honey.',
        'b4.h1': 'Wild en Wonderlik',
        'b4.desc': 'Ontdek Afrika se buitengewoonste wilde diere in hierdie vierde versameling! Hierdie 11 boeiende gedigte vier die snaakse, die wonderlike en die wilde – van magtige roofdiere tot nuuskierige diertjies waarvan jy dalk nog nooit gehoor het nie – met Carol Honey se onweerstaanbare rym en ritme.',
        'b4.sampleAlt': 'Meerkatte – voorbeeldbladsy',
        'b4.cta': 'Kry jou eksemplaar van Honey Tales Afrika Boek 4 en verken saam met jou kleintjies Afrika se wilde en wonderlike diere!',

        // --- Order page ---
        'order.title': 'Bestel – Honey Tales Afrika',
        'order.meta': 'Bestel jou eksemplare van Honey Tales Afrika deur Carol Honey, in Afrikaans of Engels. Boeke word tot by jou deur afgelewer.',
        'order.h1': 'Bestel Jou Boeke',
        'order.intro': 'Vul jou besonderhede in en kies die boeke wat jy wil hê – ons laat weet jou wat die totaal is, insluitend koerieraflewering. Bestel al 4 boeke en kry gratis koerieraflewering enige plek in Suid-Afrika!',
        'order.details': 'Jou Besonderhede',
        'order.address': 'Afleweringsadres <span class="required">*</span>',
        'order.country': 'Land <span class="required">*</span>',
        'order.message': 'Boodskap <span class="optional">(opsioneel)</span>',
        'order.postage': '📦 Bestel al 4 boeke en kry <strong>gratis koerieraflewering</strong> enige plek in Suid-Afrika! Andersins is posgeld betaalbaar — ons sal die finale prys met jou bevestig. Hierdie boodskap plaas jou onder geen verpligting nie.',
        'order.submit': 'Stuur Bestelling',
        'order.success': 'Dankie! Ons kontak jou binnekort met jou totaal.',
        'order.select': 'Kies Jou Boeke',
        'order.hint': 'Klik op + om eksemplare van elke boek by te voeg',
        'order.priceNote': 'R190 per boek &bull; Gratis koerieraflewering in SA as jy al 4 bestel!',

        // --- Author page ---
        'about.title': 'Oor Carol Honey – Honey Tales Afrika',
        'about.meta': 'Ontmoet Carol Honey, die skrywer agter die Honey Tales Afrika-reeks kindergedigte. Lees meer oor haar liefde vir Suid-Afrika se wild en hoe die boeke tot stand gekom het.',
        'about.photoAlt': 'Carol Honey – skrywer van Honey Tales Afrika',
        'about.tag': 'Die Skrywer',
        'about.role': 'Digter &amp; skrywer van die Honey Tales Afrika-reeks',
        'about.intro': 'Carol skryf al haar hele lewe lank humoristiese gedigte vir haar familie en vriende — maar dit was die koms van haar kleinkinders wat haar geïnspireer het om dit met die wêreld te deel.',
        'about.bioTitle': '’n Leeftyd se Liefde vir Woorde en Wild',
        'about.bio1': 'Carol Honey is die onafhanklike, selfuitgewende skrywer van die Honey Tales Afrika-reeks kinderboeke. Sy skryf al haar hele lewe lank humoristiese gedigte vir haar familie en vriende, maar toe sy vir haar kleinkinders begin skryf het, het haar vriende en familie haar oorreed om dit uit te gee.',
        'about.bio2': 'Carol het nog altyd ’n groot belangstelling in Suid-Afrika se wild gehad en wou haar kleinkinders leer van bewaring en ’n liefde vir alle diere en die natuur. Die gedigte is geskryf om jong lesers te verruk en terselfdertyd stilweg respek en verwondering te kweek vir die natuurlike wêreld wat ons almal deel.',
        'about.bio3': 'Sy is afgetree en woon en werk van haar huis in Centurion af, waar sy haar tyd aan die volgende boek in die reeks bestee. Met die hulp van haar man, David, verkoop Carol haar boeke by verskeie kunsmarkte en direk aan skole regoor Suid-Afrika.',
        'about.card1Title': '4 Boeke',
        'about.card1': 'In Engels en Afrikaans, met meer op pad',
        'about.card2Title': 'Gedigte',
        'about.card2': '’n Viering van Afrika se diere, insekte en wilde wesens',
        'about.card3': 'Geskryf en uitgegee uit die hart van Suid-Afrika',
        'about.card4Title': 'Familie Eerste',
        'about.card4Alt': 'Ouma wat brei, uit Wild en Wonderlik',
        'about.card4': 'Geskryf vir kleinkinders, nou geniet deur gesinne oral',
        'about.featuresTitle': 'Wat Maak Hierdie Boeke So Spesiaal',
        'about.featuresSub': 'Meer as net gedigte — ’n poort na Afrika se wilde wêreld',
        'about.f2Alt': '’n Gedigbladsy uit Honey Tales Afrika',
        'about.f2Title': 'Pragtig Geïllustreer',
        'about.f2': 'Lewendige volkleur-illustrasies bring elke gedig tot lewe, prikkel die verbeelding en help kinders om ’n band te smee met die diere waaroor hulle lees.',
        'about.f3Alt': 'Twee dogtertjies wat saam met ’n lammetjie dans, uit Wild en Wonderlik',
        'about.f3Title': 'Ouderdom 0–100',
        'about.f3': 'Perfek vir slaaptydstories, die klaskamer en alles tussenin. Die rympies is pret vir kleintjies, en die geestigheid verruk grootmense ook.',
        'about.f4Alt': 'Renoster uit Honey Tales Afrika',
        'about.f4Title': 'Bewaring in die Hart',
        'about.f4': 'Elke gedig leer kinders stilweg om die natuurlike wêreld lief te hê en te respekteer, en kweek so die volgende geslag bewaarders van ons wild.',
        'about.f6Alt': 'Riksja-man met kinders op die strand, uit Vriende: Veld en Vere',
        'about.f6Title': 'Trots Suid-Afrikaans',
        'about.f6': 'Met trots in Suid-Afrika geskryf, geïllustreer en uitgegee — ’n ware viering van die land se buitengewone natuurerfenis.',
        'about.details': '11 gedigte per boek &bull; Sagteband &bull; R190 per boek',
        'about.testimonialsTitle': 'Wat Mense Sê',
        'about.testimonialsSub': 'Lof van opvoeders, ouers en lesers',
        'about.fiveStars': '5 sterre',
        'about.review1': 'Resensie 1',
        'about.review2': 'Resensie 2',
        'about.review3': 'Resensie 3',
        'about.reviewPrev': 'Vorige resensie',
        'about.reviewNext': 'Volgende resensie',
        'about.teacher': 'Graad R-onderwyser',
        'about.teacherPlace': 'Centurion, Suid-Afrika',
        'about.ctaTitle': 'Kry Jou Eksemplaar Vandag',
        'about.cta': 'Direk van Carol by kunsmarkte en skole beskikbaar, of bestel aanlyn. Kontak ons en ons stuur vir jou ’n stel!',
        'about.ctaBtn': 'Bestel Nou'
    };

    const SCRIPT_STRINGS = {
        en: {
            ageInterim: 'Ages 0–?',
            ageFinal: 'Ages 0–100',
            errName: 'Please enter your name',
            errEmail: 'Please enter a valid email address',
            errPhone: 'Please enter your cell number',
            errBooks: 'Please add at least one book',
            errAddress: 'Please enter your delivery address',
            errCountry: 'Please enter your country',
            errMessage: 'Please enter a message',
            sending: 'Sending…',
            send: 'Send Message',
            sendOrder: 'Send Order Request',
            sendFailed: 'Something went wrong. Please email us directly at admin@honeytales.co.za',
            illustration: 'illustration'
        },
        af: {
            ageInterim: 'Ouderdom 0–?',
            ageFinal: 'Ouderdom 0–100',
            errName: 'Vul asseblief jou naam in',
            errEmail: 'Vul asseblief ’n geldige e-posadres in',
            errPhone: 'Vul asseblief jou selnommer in',
            errBooks: 'Voeg asseblief minstens een boek by',
            errAddress: 'Vul asseblief jou afleweringsadres in',
            errCountry: 'Vul asseblief jou land in',
            errMessage: 'Vul asseblief ’n boodskap in',
            sending: 'Stuur tans…',
            send: 'Stuur Boodskap',
            sendOrder: 'Stuur Bestelling',
            sendFailed: 'Iets het verkeerd geloop. Stuur asseblief ’n e-pos direk aan admin@honeytales.co.za',
            illustration: 'illustrasie'
        }
    };

    const toggle = document.getElementById('langToggle');
    const englishText = new WeakMap();
    const englishAttrs = new WeakMap();
    const listeners = [];
    let lang = 'en';

    function t(key) {
        return SCRIPT_STRINGS[lang][key] ?? SCRIPT_STRINGS.en[key] ?? key;
    }

    function translateText(el) {
        if (!englishText.has(el)) englishText.set(el, el.innerHTML);
        const af = PAGE_AF[el.dataset.i18n];
        el.innerHTML = lang === 'af' && af ? af : englishText.get(el);
    }

    function translateAttrs(el) {
        if (!englishAttrs.has(el)) englishAttrs.set(el, {});
        const originals = englishAttrs.get(el);
        ATTRS.forEach(attr => {
            const key = el.getAttribute('data-i18n-' + attr);
            if (!key) return;
            if (!(attr in originals)) originals[attr] = el.getAttribute(attr);
            const af = PAGE_AF[key];
            el.setAttribute(attr, lang === 'af' && af ? af : originals[attr]);
        });
    }

    function apply() {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(translateText);
        const attrSelector = ATTRS.map(a => '[data-i18n-' + a + ']').join(',');
        document.querySelectorAll(attrSelector).forEach(translateAttrs);

        document.querySelectorAll('img[data-af-src]').forEach(img => {
            if (!img.dataset.enSrc) img.dataset.enSrc = img.getAttribute('src');
            img.setAttribute('src', lang === 'af' ? img.dataset.afSrc : img.dataset.enSrc);
        });

        // The toggle is written in the language it switches to
        if (toggle) toggle.lang = lang === 'af' ? 'en' : 'af';

        listeners.forEach(fn => fn(lang));
        // Banner text length changes, so let the header offset re-measure
        window.dispatchEvent(new Event('resize'));
    }

    function setLang(next) {
        lang = next === 'af' ? 'af' : 'en';
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
        apply();
    }

    // Order forms list both editions: tiles marked data-edition="en|af" show
    // for the current language, both when the checkbox is ticked, and any
    // tile with copies already added always stays visible
    function initEditionPicker(container, checkbox) {
        if (!container) return;
        const tiles = container.querySelectorAll('[data-edition]');
        function refresh() {
            const showAll = checkbox && checkbox.checked;
            let visibleCount = 0;
            tiles.forEach(tile => {
                const visible = showAll || tile.dataset.edition === lang || parseInt(tile.dataset.qty || 0) > 0;
                tile.classList.toggle('edition-hidden', !visible);
                if (visible) visibleCount++;
            });
            // Lets a grid switch to a compact layout while both editions show
            container.classList.toggle('edition-grid--both', visibleCount > 4);
        }
        if (checkbox) checkbox.addEventListener('change', refresh);
        container.addEventListener('click', refresh);
        const form = container.closest('form');
        if (form) form.addEventListener('reset', () => setTimeout(refresh));
        listeners.push(refresh);
        refresh();
    }

    // Only pages with the toggle are translated; elsewhere t() returns English
    if (toggle) {
        let saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
        if (saved === 'af') {
            lang = 'af';
            apply();
        }
        toggle.addEventListener('click', () => setLang(lang === 'af' ? 'en' : 'af'));
    }

    return {
        t,
        get lang() { return lang; },
        onChange(fn) { listeners.push(fn); },
        initEditionPicker
    };
})();

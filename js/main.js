/* ==========================================
   Honey Tales Africa - Main JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

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

    // --- Hero Videos - play in sequence ---
    const heroVideos = Array.from(document.querySelectorAll('.hero-book video'));
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
                if (next) next.play();
            });
        });

        window.addEventListener('load', () => {
            setTimeout(() => heroVideos[0].play(), 2000);
        });
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

    // --- Contact Form Validation ---
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

        // Message validation
        const message = document.getElementById('message');
        const messageError = document.getElementById('messageError');
        if (message.value.trim().length < 10) {
            messageError.textContent = 'Please enter a message (at least 10 characters)';
            message.classList.add('error');
            isValid = false;
        } else {
            messageError.textContent = '';
            message.classList.remove('error');
        }

        if (isValid) {
            // Show success message
            formSuccess.classList.add('show');
            contactForm.reset();

            // Hide success message after 5 seconds
            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 5000);
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

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const sections = document.querySelectorAll('section[id]');
    const typingElement = document.querySelector('.typing-text');
    const heroContent = document.getElementById('heroContent');
    const revealElements = document.querySelectorAll('.section-hidden');
    const staggerGrids = document.querySelectorAll('.skills-grid, .projects-grid');

    // navbar background on scroll
    function updateNavbar() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // mobile nav toggle
    hamburger.addEventListener('click', () => {
        const active = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', active);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // highlight current section in nav
    function updateActiveLink() {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 150) {
                current = section.getAttribute('id');
            }
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // hero stagger entrance
    if (heroContent) {
        const children = heroContent.children;
        const delays = [0, 80, 150, 250, 380, 500, 650];
        Array.from(children).forEach((el, i) => {
            el.style.transitionDelay = (delays[i] || 700) + 'ms';
        });
        requestAnimationFrame(() => heroContent.classList.add('visible'));
    }

    // reveal sections when they scroll into view
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    revealElements.forEach(el => revealObserver.observe(el));

    // typing animation for hero roles
    const roles = [
        'Python Full-Stack Developer',
        'Ethical Hacker',
        'Discord Bot Developer'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function typeEffect() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 300;
        }

        setTimeout(typeEffect, typeSpeed);
    }
    typeEffect();

    // stagger cards on scroll in/out — clears timers to avoid leaks
    const staggerState = new Map();

    staggerGrids.forEach(grid => {
        const cards = grid.querySelectorAll('.skill-card, .project-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        });
        staggerState.set(grid, { visible: false, timers: [] });
    });

    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const grid = entry.target;
            const state = staggerState.get(grid);
            if (!state) return;

            state.timers.forEach(t => clearTimeout(t));
            state.timers = [];

            state.visible = entry.isIntersecting;
            const cards = grid.querySelectorAll('.skill-card, .project-card');
            const total = cards.length;

            if (state.visible) {
                cards.forEach((card, i) => {
                    const t = setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, i * 80);
                    state.timers.push(t);
                });
            } else {
                cards.forEach((card, i) => {
                    const t = setTimeout(() => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                    }, (total - 1 - i) * 60);
                    state.timers.push(t);
                });
            }
        });
    }, { threshold: 0.1 });

    staggerGrids.forEach(grid => staggerObserver.observe(grid));
});

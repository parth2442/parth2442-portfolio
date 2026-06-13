document.addEventListener('DOMContentLoaded', () => {
    // touch check
    var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
        document.body.classList.add('touch-device');
    }

    // starfield canvas with nebula - got the idea from a CodePen tutorial
    var starCanvas = document.getElementById('starfield');
    if (starCanvas) {
        var sCtx = starCanvas.getContext('2d');
        var sMouseX = -9999, sMouseY = -9999;
        var MOUSE_RADIUS = 200;

        function resizeStars() {
            starCanvas.width = window.innerWidth;
            starCanvas.height = window.innerHeight;
        }
        resizeStars();
        window.addEventListener('resize', resizeStars);

        // nebula clouds
        var clouds = [];
        var CLOUD_COUNT = isTouch ? 3 : 6;
        var cloudColors = [
            '59, 130, 246',
            '124, 58, 237',
            '236, 72, 153',
            '6, 182, 212',
            '168, 85, 247',
            '59, 130, 246'
        ];
        for (var ci = 0; ci < CLOUD_COUNT; ci++) {
            clouds.push({
                x: Math.random() * starCanvas.width,
                y: Math.random() * starCanvas.height,
                baseX: 0, baseY: 0,
                radius: Math.random() * 200 + 150,
                speedX: (Math.random() - 0.5) * 0.15,
                speedY: (Math.random() - 0.5) * 0.15,
                color: cloudColors[ci],
                opacity: Math.random() * 0.025 + 0.015,
                phase: Math.random() * Math.PI * 2
            });
        }

        // floating particles
        var particles = [];
        var PARTICLE_COUNT = isTouch ? 50 : 120;
        var particleColors = [
            '255, 255, 255',
            '200, 210, 255',
            '220, 180, 255',
            '180, 220, 255'
        ];
        for (var pi = 0; pi < PARTICLE_COUNT; pi++) {
            particles.push({
                x: Math.random() * starCanvas.width,
                y: Math.random() * starCanvas.height,
                size: Math.random() * 1.8 + 0.3,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                color: particleColors[Math.floor(Math.random() * particleColors.length)],
                opacity: Math.random() * 0.4 + 0.1,
                phase: Math.random() * Math.PI * 2
            });
        }

        // mouse tracking - desktop only
        if (!isTouch) {
            document.addEventListener('mousemove', function(e) {
                sMouseX = e.clientX;
                sMouseY = e.clientY;
            });

            document.addEventListener('mouseleave', function() {
                sMouseX = -9999;
                sMouseY = -9999;
            });
        }

        // animation loop
        function animateNebula() {
            sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
            var time = Date.now() / 1000;

            // draw clouds
            for (var ci = 0; ci < clouds.length; ci++) {
                var c = clouds[ci];
                c.x += c.speedX + Math.sin(time * 0.3 + c.phase) * 0.1;
                c.y += c.speedY + Math.cos(time * 0.4 + c.phase) * 0.1;
                if (c.x < -300) c.x = starCanvas.width + 300;
                if (c.x > starCanvas.width + 300) c.x = -300;
                if (c.y < -300) c.y = starCanvas.height + 300;
                if (c.y > starCanvas.height + 300) c.y = -300;

                // cursor push effect
                if (!isTouch) {
                    var cdx = c.x - sMouseX;
                    var cdy = c.y - sMouseY;
                    var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                    if (cdist < MOUSE_RADIUS * 1.5) {
                        var push = (1 - cdist / (MOUSE_RADIUS * 1.5)) * 2;
                        c.x += (cdx / (cdist || 1)) * push;
                        c.y += (cdy / (cdist || 1)) * push;
                    }
                }

                var pulse = Math.sin(time * 0.5 + c.phase) * 0.2 + 1;
                var grad = sCtx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius * pulse);
                grad.addColorStop(0, 'rgba(' + c.color + ', ' + c.opacity * 2 + ')');
                grad.addColorStop(0.5, 'rgba(' + c.color + ', ' + c.opacity + ')');
                grad.addColorStop(1, 'rgba(' + c.color + ', 0)');
                sCtx.beginPath();
                sCtx.arc(c.x, c.y, c.radius * pulse, 0, Math.PI * 2);
                sCtx.fillStyle = grad;
                sCtx.fill();
            }

            // draw particles
            for (var pi = 0; pi < particles.length; pi++) {
                var p = particles[pi];
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0) p.x = starCanvas.width;
                if (p.x > starCanvas.width) p.x = 0;
                if (p.y < 0) p.y = starCanvas.height;
                if (p.y > starCanvas.height) p.y = 0;

                if (!isTouch) {
                    var pdx = p.x - sMouseX;
                    var pdy = p.y - sMouseY;
                    var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
                    if (pdist < MOUSE_RADIUS && pdist > 0) {
                        var force = (1 - pdist / MOUSE_RADIUS) * 5;
                        p.x += (pdx / pdist) * force;
                        p.y += (pdy / pdist) * force;
                    }
                }

                var twinkle = Math.sin(time * 2 + p.phase) * 0.2 + 0.8;
                var alpha = p.opacity * twinkle;
                sCtx.beginPath();
                sCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                sCtx.fillStyle = 'rgba(' + p.color + ', ' + alpha + ')';
                sCtx.fill();
            }

            requestAnimationFrame(animateNebula);
        }
        animateNebula();
    }

    // custom cursor - lerp follow, saw this on a YouTube tutorial
    if (!isTouch) {
        var cursorDot = document.querySelector('.cursor-dot');
        var cursorRing = document.querySelector('.cursor-ring');
        var posX = 0, posY = 0, mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            posX += (mouseX - posX) * 0.25;
            posY += (mouseY - posY) * 0.25;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
            cursorRing.style.left = posX + 'px';
            cursorRing.style.top = posY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.addEventListener('mouseleave', function() {
            cursorDot.classList.add('hide');
            cursorRing.classList.add('hide');
        });
        document.addEventListener('mouseenter', function() {
            cursorDot.classList.remove('hide');
            cursorRing.classList.remove('hide');
        });

        // enlarge ring over clickable stuff
        var hoverTargets = document.querySelectorAll('a, button, .cert-card-wrapper, .project-card, .btn, .skill-card, .inspire-card');
        hoverTargets.forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                cursorRing.classList.add('hover');
            });
            el.addEventListener('mouseleave', function() {
                cursorRing.classList.remove('hover');
            });
        });
    }

    // magnetic buttons - codrops tutorial had this effect, tried to recreate it
    if (!isTouch) {
        var magBtns = document.querySelectorAll('.btn, .nav-link, .footer-socials a, .social-link');
        for (var m = 0; m < magBtns.length; m++) {
            (function(btn) {
                btn.addEventListener('mousemove', function(e) {
                    var rect = btn.getBoundingClientRect();
                    var x = e.clientX - rect.left - rect.width / 2;
                    var y = e.clientY - rect.top - rect.height / 2;
                    var dist = Math.sqrt(x * x + y * y);
                    var maxDist = 100;
                    if (dist < maxDist) {
                        var strength = (1 - dist / maxDist) * 8;
                        var moveX = (x / dist || 0) * strength;
                        var moveY = (y / dist || 0) * strength;
                        btn.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
                    }
                });
                btn.addEventListener('mouseleave', function() {
                    btn.style.transform = '';
                });
            })(magBtns[m]);
        }
    }

    // 3d tilt on project cards - inspired by alvarotrigo.com tutorial
    if (!isTouch) {
        var tiltCards = document.querySelectorAll('.project-card');
        for (var t = 0; t < tiltCards.length; t++) {
            (function(card) {
                card.addEventListener('mousemove', function(e) {
                    var rect = card.getBoundingClientRect();
                    var x = e.clientX - rect.left;
                    var y = e.clientY - rect.top;
                    var centerX = rect.width / 2;
                    var centerY = rect.height / 2;
                    var rotateX = ((y - centerY) / centerY) * -8;
                    var rotateY = ((x - centerX) / centerX) * 8;
                    card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)';
                    card.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.5)';
                    card.style.background = 'rgba(255, 255, 255, 0.06)';
                    card.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                });
                card.addEventListener('mouseleave', function() {
                    card.style.transform = '';
                    card.style.boxShadow = '';
                    card.style.background = '';
                    card.style.borderColor = '';
                });
            })(tiltCards[t]);
        }
    }

    // cover curtain - click to enter
    const cover = document.getElementById('cover');
    if (cover) {
        cover.addEventListener('click', () => {
            cover.classList.add('open');
        });
    }

    // grab dom refs
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const sections = document.querySelectorAll('section[id]');
    const typingElement = document.querySelector('.typing-text');
    const heroContent = document.getElementById('heroContent');
    const revealElements = document.querySelectorAll('.section-hidden');
    const staggerGrids = document.querySelectorAll('.skills-grid, .projects-grid');

    // navbar bg on scroll
    function updateNavbar() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // mobile menu toggle
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

    // active nav link on scroll
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

    // hero stagger - webdev simplified tutorial on yt
    if (heroContent) {
        const children = heroContent.children;
        const delays = [0, 80, 150, 250, 380, 500, 650];
        Array.from(children).forEach((el, i) => {
            el.style.transitionDelay = (delays[i] || 700) + 'ms';
        });
        requestAnimationFrame(() => heroContent.classList.add('visible'));
    }

    // reveal sections on scroll - IntersectionObserver from MDN docs
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    revealElements.forEach(el => revealObserver.observe(el));

    // typing effect - copied from a stackoverflow answer
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

    // stagger card entrance - found this pattern on stackoverflow
    const staggerState = new Map();

    staggerGrids.forEach(grid => {
        const cards = grid.querySelectorAll('.skill-card, .project-card');
        cards.forEach((card, i) => {
            if (card.classList.contains('project-card')) {
                card.style.opacity = '0';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            }
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
                    var delay = card.classList.contains('project-card') ? i * 200 : i * 120;
                    const t = setTimeout(() => {
                        if (card.classList.contains('project-card')) {
                            card.style.opacity = '1';
                            card.classList.add(i % 2 === 0 ? 'roll-left' : 'roll-right');
                        } else {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }
                    }, delay);
                    state.timers.push(t);
                });
            } else {
                cards.forEach((card, i) => {
                    const t = setTimeout(() => {
                        if (card.classList.contains('project-card')) {
                            card.style.opacity = '0';
                            card.classList.remove('roll-left', 'roll-right');
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px)';
                        }
                    }, (total - 1 - i) * 60);
                    state.timers.push(t);
                });
            }
        });
    }, { threshold: 0.1 });

    staggerGrids.forEach(grid => staggerObserver.observe(grid));

    // cert card roll-in animation
    const certCards = document.querySelectorAll('.cert-card');
    const certObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const side = card.dataset.side;
                const delay = Array.from(certCards).indexOf(card) * 80;
                setTimeout(function() {
                    if (side === 'left') card.classList.add('roll-in-left');
                    else if (side === 'right') card.classList.add('roll-in-right');
                    else card.classList.add('roll-in-center');
                }, delay);
                certObserver.unobserve(card);
            }
        });
    }, { threshold: 0.2 });

    certCards.forEach(function(card) {
        card.style.opacity = '0';
        certObserver.observe(card);
        card.addEventListener('animationend', function() {
            card.classList.remove('roll-in-left', 'roll-in-right', 'roll-in-center');
            card.style.opacity = '1';
        }, { once: true });
    });

    // back cards fade in
    var backCards = document.querySelectorAll('.cert-card-back');
    backCards.forEach(function(card, i) {
        card.style.opacity = '0';
        setTimeout(function() {
            card.style.opacity = '1';
        }, 400 + i * 200);
    });

    // cert flip on click - got this idea from a w3schools tutorial
    var wrappers = document.querySelectorAll('.cert-card-wrapper');
    for (var i = 0; i < wrappers.length; i++) {
        (function(w) {
            w.addEventListener('click', function(e) {
                if (e.target.closest('.cert-card-back')) return;
                if (e.target.closest('.cert-badge')) return;
                var isActive = w.classList.contains('show-back');
                for (var j = 0; j < wrappers.length; j++) {
                    wrappers[j].classList.remove('show-back');
                }
                if (!isActive) {
                    w.classList.add('show-back');
                }
            });
            w.addEventListener('mouseleave', function() {
                w.classList.remove('show-back');
            });
        })(wrappers[i]);
    }

    // blur links after click
    var pdfLinks = document.querySelectorAll('.cert-badge, .cert-card-back');
    pdfLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            this.blur();
        });
    });
});

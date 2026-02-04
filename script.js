document.addEventListener('DOMContentLoaded', () => {
    // Cache-bust PDF links
    const cacheBuster = Date.now();
    document.querySelectorAll('a[href$=".pdf"], iframe[src$=".pdf"]').forEach(el => {
        const attr = el.hasAttribute('href') ? 'href' : 'src';
        const url = el.getAttribute(attr);
        el.setAttribute(attr, url + '?v=' + cacheBuster);
    });

    // ==========================================
    // Subtle Particle Network Animation
    // ==========================================
    const canvas = document.getElementById('distributed-nn-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        let mouse = { x: null, y: null, radius: 120 };

        function resizeCanvas() {
            const hero = document.querySelector('.hero');
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
            initParticles();
        }

        function initParticles() {
            particles = [];
            // Fewer particles for a cleaner Apple aesthetic
            const numberOfParticles = Math.min(50, Math.floor((canvas.width * canvas.height) / 25000));

            for (let i = 0; i < numberOfParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.3 + 0.1
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw subtle connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        const opacity = (1 - distance / 120) * 0.08;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(10, 132, 255, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw and update particles
            particles.forEach(particle => {
                // Subtle mouse interaction
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - particle.x;
                    const dy = mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        particle.vx -= (dx / distance) * force * 0.01;
                        particle.vy -= (dy / distance) * force * 0.01;
                    }
                }

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Boundary check with smooth wrapping
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                // Apply friction
                particle.vx *= 0.995;
                particle.vy *= 0.995;

                // Maintain minimum velocity
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed < 0.15) {
                    particle.vx += (Math.random() - 0.5) * 0.05;
                    particle.vy += (Math.random() - 0.5) * 0.05;
                }

                // Draw particle with subtle glow
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.radius * 4
                );
                gradient.addColorStop(0, `rgba(10, 132, 255, ${particle.opacity * 0.8})`);
                gradient.addColorStop(0.5, `rgba(10, 132, 255, ${particle.opacity * 0.3})`);
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`;
                ctx.fill();
            });

            animationId = requestAnimationFrame(drawParticles);
        }

        // Mouse tracking
        canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.parentElement.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Initialize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        drawParticles();

        // Performance: pause when not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                drawParticles();
            }
        });
    }

    // ==========================================
    // Navigation - Apple-style smooth transitions
    // ==========================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const spans = hamburger.querySelectorAll('span');

            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
            } else {
                spans[0].style.transform = 'rotate(0) translate(0, 0)';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'rotate(0) translate(0, 0)';
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'rotate(0) translate(0, 0)';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'rotate(0) translate(0, 0)';
            });
        });
    }

    // ==========================================
    // Scroll Effects - Subtle navbar transition
    // ==========================================
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                if (navbar) {
                    if (scrollY > 20) {
                        navbar.style.background = 'rgba(0, 0, 0, 0.9)';
                    } else {
                        navbar.style.background = 'rgba(0, 0, 0, 0.72)';
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // ==========================================
    // Intersection Observer - Staggered fade-in
    // ==========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add staggered animation styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1),
                        transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .animate-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // Apply animation to cards with stagger
    const animatableElements = document.querySelectorAll(
        '.skill-card, .project-card, .stat, .focus-item, .experience-item, .education-card, .cert-card, .contact-method'
    );

    animatableElements.forEach((el, index) => {
        el.classList.add('animate-in');
        // Stagger within each section
        const parent = el.parentElement;
        const siblings = Array.from(parent.querySelectorAll('.animate-in'));
        const siblingIndex = siblings.indexOf(el);
        el.style.transitionDelay = `${siblingIndex * 0.08}s`;
        observer.observe(el);
    });

    // ==========================================
    // Smooth Scrolling - Apple-style easing
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 60;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // Contact Form - Minimal feedback
    // ==========================================
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (name && email && message) {
                const btn = contactForm.querySelector('.btn-primary');
                const originalText = btn.textContent;
                btn.textContent = 'Sent';
                btn.style.background = '#30d158';
                btn.style.color = '#000';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    contactForm.reset();
                }, 2000);
            }
        });
    }

    // ==========================================
    // Section Label Animation
    // ==========================================
    const sectionHeaders = document.querySelectorAll('.section-label, .section-title');
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.2 });

    sectionHeaders.forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(16px)';
        header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        headerObserver.observe(header);
    });
});

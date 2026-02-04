document.addEventListener('DOMContentLoaded', () => {
    // Cache-bust PDF links
    const cacheBuster = Date.now();
    document.querySelectorAll('a[href$=".pdf"], iframe[src$=".pdf"]').forEach(el => {
        const attr = el.hasAttribute('href') ? 'href' : 'src';
        const url = el.getAttribute(attr);
        el.setAttribute(attr, url + '?v=' + cacheBuster);
    });

    // ==========================================
    // Elegant Particle Network Animation
    // ==========================================
    const canvas = document.getElementById('distributed-nn-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        const colors = {
            particle: 'rgba(99, 102, 241, 0.6)',
            particleLight: 'rgba(129, 140, 248, 0.8)',
            connection: 'rgba(99, 102, 241, 0.1)',
            connectionHover: 'rgba(168, 85, 247, 0.2)'
        };

        function resizeCanvas() {
            const hero = document.querySelector('.hero');
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
            initParticles();
        }

        function initParticles() {
            particles = [];
            const numberOfParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));

            for (let i = 0; i < numberOfParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        const opacity = (1 - distance / 150) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw and update particles
            particles.forEach(particle => {
                // Mouse interaction
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - particle.x;
                    const dy = mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        particle.vx -= (dx / distance) * force * 0.02;
                        particle.vy -= (dy / distance) * force * 0.02;
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
                particle.vx *= 0.99;
                particle.vy *= 0.99;

                // Maintain minimum velocity
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed < 0.2) {
                    particle.vx += (Math.random() - 0.5) * 0.1;
                    particle.vy += (Math.random() - 0.5) * 0.1;
                }

                // Draw particle with glow
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.radius * 3
                );
                gradient.addColorStop(0, `rgba(129, 140, 248, ${particle.opacity})`);
                gradient.addColorStop(0.5, `rgba(99, 102, 241, ${particle.opacity * 0.5})`);
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
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
    // Navigation
    // ==========================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = navLinks.classList.contains('active')
            ? 'rotate(45deg) translate(5px, 5px)'
            : 'rotate(0) translate(0, 0)';
        spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
        spans[2].style.transform = navLinks.classList.contains('active')
            ? 'rotate(-45deg) translate(7px, -6px)'
            : 'rotate(0) translate(0, 0)';
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

    // ==========================================
    // Scroll Effects
    // ==========================================
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                if (scrollY > 50) {
                    navbar.style.background = 'rgba(3, 7, 18, 0.95)';
                    navbar.style.borderBottomColor = 'rgba(99, 102, 241, 0.2)';
                } else {
                    navbar.style.background = 'rgba(3, 7, 18, 0.8)';
                    navbar.style.borderBottomColor = 'rgba(99, 102, 241, 0.1)';
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // ==========================================
    // Intersection Observer for Animations
    // ==========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 50);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.skill-card, .project-card, .stat, .focus-item, .experience-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // ==========================================
    // Smooth Scrolling
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // Contact Form
    // ==========================================
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (name && email && message) {
                // Create a subtle notification instead of alert
                const btn = contactForm.querySelector('.btn-primary');
                const originalText = btn.textContent;
                btn.textContent = 'Message Sent!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    contactForm.reset();
                }, 2000);
            }
        });
    }
});

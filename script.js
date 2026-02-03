document.addEventListener('DOMContentLoaded', () => {
    // Cache-bust PDF links to always load latest resume
    const cacheBuster = Date.now();
    document.querySelectorAll('a[href$=".pdf"], iframe[src$=".pdf"]').forEach(el => {
        const attr = el.hasAttribute('href') ? 'href' : 'src';
        const url = el.getAttribute(attr);
        el.setAttribute(attr, url + '?v=' + cacheBuster);
    });

    // ==========================================
    // Distributed Neural Network Visualization
    // ==========================================
    const canvas = document.getElementById('distributed-nn-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];
        let nodes = [];
        let neuralLayers = [];
        let dataPackets = [];
        let gradientPackets = [];

        // Training metrics
        let epoch = 0;
        let loss = 1.0;
        let accuracy = 0.0;
        let lastEpochTime = Date.now();

        // Colors
        const colors = {
            node: '#3b82f6',
            nodeGlow: 'rgba(59, 130, 246, 0.3)',
            neuron: '#a855f7',
            neuronActive: '#06b6d4',
            connection: 'rgba(168, 85, 247, 0.3)',
            dataPacket: '#10b981',
            gradientPacket: '#f59e0b',
            text: 'rgba(255, 255, 255, 0.8)'
        };

        function resizeCanvas() {
            const hero = document.querySelector('.hero');
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
            initializeVisualization();
        }

        function initializeVisualization() {
            nodes = [];
            neuralLayers = [];
            dataPackets = [];
            gradientPackets = [];

            const w = canvas.width;
            const h = canvas.height;
            const isMobile = w < 768;

            // Create distributed compute nodes (positioned around edges)
            const nodeCount = isMobile ? 3 : 4;
            const nodeRadius = isMobile ? 35 : 50;

            if (isMobile) {
                // Mobile: nodes at top and bottom
                nodes = [
                    { x: w * 0.2, y: h * 0.15, radius: nodeRadius, label: 'Worker 0', active: false, pulsePhase: 0 },
                    { x: w * 0.8, y: h * 0.15, radius: nodeRadius, label: 'Worker 1', active: false, pulsePhase: Math.PI * 0.66 },
                    { x: w * 0.5, y: h * 0.9, radius: nodeRadius, label: 'Parameter Server', active: false, pulsePhase: Math.PI * 1.33, isServer: true }
                ];
            } else {
                // Desktop: nodes at corners
                nodes = [
                    { x: w * 0.1, y: h * 0.2, radius: nodeRadius, label: 'Worker 0', active: false, pulsePhase: 0 },
                    { x: w * 0.9, y: h * 0.2, radius: nodeRadius, label: 'Worker 1', active: false, pulsePhase: Math.PI * 0.5 },
                    { x: w * 0.1, y: h * 0.8, radius: nodeRadius, label: 'Worker 2', active: false, pulsePhase: Math.PI },
                    { x: w * 0.9, y: h * 0.8, radius: nodeRadius, label: 'Parameter Server', active: false, pulsePhase: Math.PI * 1.5, isServer: true }
                ];
            }

            // Create neural network in center (shared model visualization)
            const centerX = w / 2;
            const centerY = h / 2;
            const layerSizes = isMobile ? [3, 4, 4, 2] : [4, 6, 6, 3];
            const layerSpacing = isMobile ? 60 : 90;
            const neuronSpacing = isMobile ? 30 : 40;
            const startX = centerX - ((layerSizes.length - 1) * layerSpacing) / 2;

            for (let l = 0; l < layerSizes.length; l++) {
                const layer = [];
                const layerX = startX + l * layerSpacing;
                const layerHeight = (layerSizes[l] - 1) * neuronSpacing;
                const startY = centerY - layerHeight / 2;

                for (let n = 0; n < layerSizes[l]; n++) {
                    layer.push({
                        x: layerX,
                        y: startY + n * neuronSpacing,
                        radius: isMobile ? 6 : 8,
                        activation: 0,
                        layer: l
                    });
                }
                neuralLayers.push(layer);
            }
        }

        function createDataPacket(fromNode, toLayer) {
            const targetNeuron = neuralLayers[0][Math.floor(Math.random() * neuralLayers[0].length)];
            dataPackets.push({
                x: fromNode.x,
                y: fromNode.y,
                targetX: targetNeuron.x,
                targetY: targetNeuron.y,
                progress: 0,
                speed: 0.015 + Math.random() * 0.01,
                sourceNode: fromNode
            });
        }

        function createGradientPacket(toNode) {
            const lastLayer = neuralLayers[neuralLayers.length - 1];
            const sourceNeuron = lastLayer[Math.floor(Math.random() * lastLayer.length)];
            gradientPackets.push({
                x: sourceNeuron.x,
                y: sourceNeuron.y,
                targetX: toNode.x,
                targetY: toNode.y,
                progress: 0,
                speed: 0.02 + Math.random() * 0.01,
                targetNode: toNode
            });
        }

        function drawNode(node, time) {
            const pulse = Math.sin(time * 0.003 + node.pulsePhase) * 0.3 + 0.7;

            // Glow effect
            const gradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 2
            );
            gradient.addColorStop(0, node.isServer ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
            ctx.fillStyle = node.isServer ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)';
            ctx.fill();
            ctx.strokeStyle = node.isServer ? '#f59e0b' : colors.node;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Node icon (simplified GPU/server icon)
            ctx.fillStyle = node.isServer ? '#f59e0b' : colors.node;
            const iconSize = node.radius * 0.4;
            if (node.isServer) {
                // Server icon - stacked rectangles
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(node.x - iconSize, node.y - iconSize + i * iconSize * 0.8, iconSize * 2, iconSize * 0.6);
                }
            } else {
                // GPU icon - grid
                const gridSize = iconSize * 0.4;
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 2; j++) {
                        ctx.fillRect(
                            node.x - iconSize + i * gridSize * 1.2,
                            node.y - iconSize + j * gridSize * 1.2,
                            gridSize,
                            gridSize
                        );
                    }
                }
            }

            // Label
            ctx.fillStyle = colors.text;
            ctx.font = `${canvas.width < 768 ? 10 : 12}px -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y + node.radius + 15);
        }

        function drawNeuralNetwork(time) {
            // Draw connections between layers
            for (let l = 0; l < neuralLayers.length - 1; l++) {
                const currentLayer = neuralLayers[l];
                const nextLayer = neuralLayers[l + 1];

                for (let i = 0; i < currentLayer.length; i++) {
                    for (let j = 0; j < nextLayer.length; j++) {
                        const n1 = currentLayer[i];
                        const n2 = nextLayer[j];

                        // Animated connection opacity
                        const connectionPhase = (time * 0.002 + i * 0.5 + j * 0.3 + l) % (Math.PI * 2);
                        const opacity = 0.1 + Math.sin(connectionPhase) * 0.1;

                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            // Draw neurons
            for (let l = 0; l < neuralLayers.length; l++) {
                for (let n = 0; n < neuralLayers[l].length; n++) {
                    const neuron = neuralLayers[l][n];

                    // Activation animation
                    const activationPhase = (time * 0.004 + l * 0.5 + n * 0.2) % (Math.PI * 2);
                    const activation = Math.sin(activationPhase) * 0.5 + 0.5;
                    neuron.activation = activation;

                    // Neuron glow
                    const glowGradient = ctx.createRadialGradient(
                        neuron.x, neuron.y, 0,
                        neuron.x, neuron.y, neuron.radius * 3
                    );
                    glowGradient.addColorStop(0, `rgba(6, 182, 212, ${activation * 0.5})`);
                    glowGradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = glowGradient;
                    ctx.beginPath();
                    ctx.arc(neuron.x, neuron.y, neuron.radius * 3, 0, Math.PI * 2);
                    ctx.fill();

                    // Neuron circle
                    ctx.beginPath();
                    ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
                    const neuronColor = `rgba(${6 + (168 - 6) * (1 - activation)}, ${182 + (85 - 182) * (1 - activation)}, ${212 + (247 - 212) * (1 - activation)}, 1)`;
                    ctx.fillStyle = neuronColor;
                    ctx.fill();
                }
            }

            // Label for neural network
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = `${canvas.width < 768 ? 10 : 12}px -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('Distributed Model', canvas.width / 2, canvas.height / 2 + (canvas.width < 768 ? 80 : 100));
        }

        function drawDataPackets(time) {
            // Update and draw data packets (green - input data)
            for (let i = dataPackets.length - 1; i >= 0; i--) {
                const packet = dataPackets[i];
                packet.progress += packet.speed;

                if (packet.progress >= 1) {
                    dataPackets.splice(i, 1);
                    continue;
                }

                // Easing function for smooth movement
                const easeProgress = 1 - Math.pow(1 - packet.progress, 3);
                packet.x = packet.sourceNode.x + (packet.targetX - packet.sourceNode.x) * easeProgress;
                packet.y = packet.sourceNode.y + (packet.targetY - packet.sourceNode.y) * easeProgress;

                // Draw packet with trail
                const trailLength = 5;
                for (let t = 0; t < trailLength; t++) {
                    const trailProgress = Math.max(0, packet.progress - t * 0.02);
                    const trailEase = 1 - Math.pow(1 - trailProgress, 3);
                    const tx = packet.sourceNode.x + (packet.targetX - packet.sourceNode.x) * trailEase;
                    const ty = packet.sourceNode.y + (packet.targetY - packet.sourceNode.y) * trailEase;

                    ctx.beginPath();
                    ctx.arc(tx, ty, 4 - t * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(16, 185, 129, ${0.8 - t * 0.15})`;
                    ctx.fill();
                }
            }

            // Update and draw gradient packets (orange - gradients)
            for (let i = gradientPackets.length - 1; i >= 0; i--) {
                const packet = gradientPackets[i];
                packet.progress += packet.speed;

                if (packet.progress >= 1) {
                    gradientPackets.splice(i, 1);
                    continue;
                }

                const startX = neuralLayers[neuralLayers.length - 1][0].x;
                const startY = packet.y - (packet.y - packet.targetY) * packet.progress;

                const easeProgress = 1 - Math.pow(1 - packet.progress, 3);
                const currentX = startX + (packet.targetX - startX) * easeProgress;
                const currentY = packet.y + (packet.targetY - packet.y) * easeProgress;

                // Draw packet with trail
                const trailLength = 5;
                for (let t = 0; t < trailLength; t++) {
                    const trailProgress = Math.max(0, packet.progress - t * 0.02);
                    const trailEase = 1 - Math.pow(1 - trailProgress, 3);
                    const tx = startX + (packet.targetX - startX) * trailEase;
                    const ty = packet.y + (packet.targetY - packet.y) * trailEase;

                    ctx.beginPath();
                    ctx.arc(tx, ty, 4 - t * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(245, 158, 11, ${0.8 - t * 0.15})`;
                    ctx.fill();
                }
            }
        }

        function drawConnections(time) {
            // Draw connections between nodes and neural network
            const nnCenterX = canvas.width / 2;
            const nnCenterY = canvas.height / 2;

            nodes.forEach((node, index) => {
                // Animated dashed line to neural network
                ctx.beginPath();
                ctx.setLineDash([5, 10]);
                ctx.lineDashOffset = -time * 0.05;
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(nnCenterX, nnCenterY);
                ctx.strokeStyle = node.isServer ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.setLineDash([]);
            });
        }

        function drawMetrics(time) {
            // Update training metrics
            const now = Date.now();
            if (now - lastEpochTime > 3000) { // New epoch every 3 seconds
                epoch++;
                loss = Math.max(0.01, loss * (0.85 + Math.random() * 0.1));
                accuracy = Math.min(0.99, accuracy + (1 - accuracy) * (0.1 + Math.random() * 0.05));
                lastEpochTime = now;
            }

            // Draw metrics panel (top right corner)
            const panelX = canvas.width - (canvas.width < 768 ? 120 : 160);
            const panelY = canvas.width < 768 ? 80 : 100;
            const panelWidth = canvas.width < 768 ? 110 : 140;
            const panelHeight = canvas.width < 768 ? 70 : 85;

            // Panel background
            ctx.fillStyle = 'rgba(10, 14, 39, 0.7)';
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
            ctx.fill();
            ctx.stroke();

            // Metrics text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = `bold ${canvas.width < 768 ? 9 : 11}px monospace`;
            ctx.textAlign = 'left';

            const lineHeight = canvas.width < 768 ? 16 : 20;
            const textX = panelX + 10;
            let textY = panelY + (canvas.width < 768 ? 18 : 22);

            ctx.fillText(`Epoch: ${epoch}`, textX, textY);
            textY += lineHeight;

            ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
            ctx.fillText(`Loss: ${loss.toFixed(4)}`, textX, textY);
            textY += lineHeight;

            ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
            ctx.fillText(`Acc: ${(accuracy * 100).toFixed(1)}%`, textX, textY);
        }

        function drawLegend() {
            const legendX = canvas.width < 768 ? 10 : 20;
            const legendY = canvas.height - (canvas.width < 768 ? 60 : 80);
            const fontSize = canvas.width < 768 ? 9 : 11;

            ctx.font = `${fontSize}px -apple-system, sans-serif`;
            ctx.textAlign = 'left';

            // Data flow legend
            ctx.fillStyle = colors.dataPacket;
            ctx.beginPath();
            ctx.arc(legendX + 6, legendY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText('Data Flow', legendX + 15, legendY + 4);

            // Gradient sync legend
            ctx.fillStyle = colors.gradientPacket;
            ctx.beginPath();
            ctx.arc(legendX + 6, legendY + 18, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText('Gradient Sync', legendX + 15, legendY + 22);
        }

        function animate(time) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Randomly spawn data packets from worker nodes
            if (Math.random() < 0.03) {
                const workerNodes = nodes.filter(n => !n.isServer);
                const randomWorker = workerNodes[Math.floor(Math.random() * workerNodes.length)];
                if (randomWorker) createDataPacket(randomWorker, 0);
            }

            // Randomly spawn gradient packets to parameter server
            if (Math.random() < 0.02) {
                const paramServer = nodes.find(n => n.isServer);
                if (paramServer) createGradientPacket(paramServer);
            }

            // Draw all elements
            drawConnections(time);
            drawNeuralNetwork(time);
            nodes.forEach(node => drawNode(node, time));
            drawDataPackets(time);
            drawMetrics(time);
            drawLegend();

            animationId = requestAnimationFrame(animate);
        }

        // Initialize and start
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate(0);

        // Pause animation when not visible for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate(0);
            }
        });
    }
    // ==========================================
    // End Distributed Neural Network Visualization
    // ==========================================

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');
    const contactForm = document.querySelector('.contact-form');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.98)';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');

        if (body.classList.contains('light-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
            navbar.style.background = 'rgba(10, 14, 39, 0.98)';
        }
        });
    }

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0) translate(0, 0)';
        spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
        spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(7px, -6px)' : 'rotate(0) translate(0, 0)';
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

    window.addEventListener('scroll', () => {
        const isLightMode = body.classList.contains('light-mode');
        const bgColor = isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10, 14, 39, 0.98)';

        navbar.style.background = bgColor;
        navbar.style.backdropFilter = 'blur(10px)';
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.skill-card, .project-card, .stat').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (name && email && message) {
            alert(`Thank you for your message, ${name}! I'll get back to you soon.`);
            contactForm.reset();
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    let ticking = false;
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateNavbar(lastScrollY);
                ticking = false;
            });

            ticking = true;
        }
    });

    function updateNavbar(scrollY) {
        if (scrollY > 100) {
            navbar.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        } else {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }
    }
});

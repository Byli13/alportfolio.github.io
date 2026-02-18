// Portfolio - Network Canvas Animation & Interactions
// Wrapped in IIFE to avoid global scope pollution
(function () {
    'use strict';

    // ============================================================
    // Constants
    // ============================================================
    var NODE_CONNECTION_DISTANCE = 150;
    var MAX_NODES = 50;
    var NODE_DENSITY_DIVISOR = 15000;
    var MAX_DATA_PARTICLES = 20;
    var DATA_PARTICLE_INTERVAL_MS = 100;
    var SIGNAL_BAR_INTERVAL_MS = 1500;
    var PARALLAX_HERO_FACTOR = 0.3;
    var PARALLAX_VISUAL_FACTOR = 0.2;
    var SKILL_CARD_STAGGER_MS = 100;

    // ============================================================
    // Respect prefers-reduced-motion
    // ============================================================
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============================================================
    // Network Canvas Animation
    // ============================================================
    var canvas = document.getElementById('networkCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var nodes = [];
    var dataFlowParticles = [];
    var animationId = null;
    var isPageVisible = true;

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function Node() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    Node.prototype.update = function () {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    };

    Node.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    };

    function createNodes() {
        nodes = [];
        // Reduce node count on mobile for better performance
        var isMobile = width < 768;
        var maxNodes = isMobile ? Math.floor(MAX_NODES / 2) : MAX_NODES;
        var nodeCount = Math.min(maxNodes, Math.floor((width * height) / NODE_DENSITY_DIVISOR));
        for (var i = 0; i < nodeCount; i++) {
            nodes.push(new Node());
        }
    }

    function connectNodes() {
        var distSq = NODE_CONNECTION_DISTANCE * NODE_CONNECTION_DISTANCE;
        ctx.lineWidth = 0.5;
        for (var i = 0; i < nodes.length; i++) {
            for (var j = i + 1; j < nodes.length; j++) {
                var dx = nodes[i].x - nodes[j].x;
                var dy = nodes[i].y - nodes[j].y;
                var d2 = dx * dx + dy * dy;

                if (d2 < distSq) {
                    var distance = Math.sqrt(d2);
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = 'rgba(0, 255, 204, ' + (1 - distance / NODE_CONNECTION_DISTANCE) + ')';
                    ctx.stroke();
                }
            }
        }
    }

    // Data flow particles
    function DataParticle() {
        this.x = Math.random() * width;
        this.y = -10;
        this.speed = Math.random() * 2 + 1;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random();
    }

    DataParticle.prototype.update = function () {
        this.y += this.speed;
        this.opacity -= 0.005;
    };

    DataParticle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 204, ' + this.opacity + ')';
        ctx.fill();
    };

    DataParticle.prototype.isOffScreen = function () {
        return this.y > height || this.opacity <= 0;
    };

    // Single unified animation loop (fixes duplicate animate/enhancedAnimate bug)
    function animateCanvas() {
        if (!isPageVisible) {
            animationId = null;
            return;
        }

        ctx.clearRect(0, 0, width, height);

        // Batch: set fill style once for all nodes
        ctx.fillStyle = '#00ffcc';
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].update();
            nodes[i].draw();
        }
        connectNodes();

        // Update data particles
        var alive = [];
        for (var j = 0; j < dataFlowParticles.length; j++) {
            dataFlowParticles[j].update();
            dataFlowParticles[j].draw();
            if (!dataFlowParticles[j].isOffScreen()) {
                alive.push(dataFlowParticles[j]);
            }
        }
        dataFlowParticles = alive;

        animationId = requestAnimationFrame(animateCanvas);
    }

    // Page Visibility API - pause animation when tab is hidden
    document.addEventListener('visibilitychange', function () {
        isPageVisible = !document.hidden;
        if (isPageVisible && !animationId && !prefersReducedMotion) {
            animateCanvas();
        }
    });

    // Initialize and start canvas (skip animation entirely if reduced motion)
    initCanvas();
    createNodes();
    if (!prefersReducedMotion) {
        animateCanvas();

        // Spawn data particles periodically
        setInterval(function () {
            if (isPageVisible && dataFlowParticles.length < MAX_DATA_PARTICLES) {
                dataFlowParticles.push(new DataParticle());
            }
        }, DATA_PARTICLE_INTERVAL_MS);
    } else {
        // Draw a single static frame for reduced-motion users
        ctx.fillStyle = '#00ffcc';
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].draw();
        }
        connectNodes();
    }

    // Debounced resize handler
    var resizeTimeout = null;
    window.addEventListener('resize', function () {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            initCanvas();
            createNodes();
            if (prefersReducedMotion) {
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = '#00ffcc';
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].draw();
                }
                connectNodes();
            }
        }, 150);
    }, { passive: true });

    // ============================================================
    // Smooth Scroll for anchor links
    // ============================================================
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var a = 0; a < anchors.length; a++) {
        anchors[a].addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // ============================================================
    // Intersection Observer for scroll-in animations
    // ============================================================
    var observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                if (!prefersReducedMotion) {
                    entries[i].target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                } else {
                    entries[i].target.style.opacity = '1';
                }

                observer.unobserve(entries[i].target);
            }
        }
    }, observerOptions);

    var sections = document.querySelectorAll('.section');
    for (var s = 0; s < sections.length; s++) {
        observer.observe(sections[s]);
    }

    // ============================================================
    // Active nav link highlighting on scroll (throttled)
    // ============================================================
    var allSections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-links a');
    var scrollTicking = false;

    function updateActiveNav() {
        var scrollY = window.scrollY;
        for (var i = 0; i < allSections.length; i++) {
            var sectionHeight = allSections[i].offsetHeight;
            var sectionTop = allSections[i].offsetTop - 100;
            var sectionId = allSections[i].getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                for (var j = 0; j < navLinks.length; j++) {
                    navLinks[j].style.color = '';
                    if (navLinks[j].getAttribute('href') === '#' + sectionId) {
                        navLinks[j].style.color = '#00ffcc';
                    }
                }
            }
        }
        scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            requestAnimationFrame(updateActiveNav);
            scrollTicking = true;
        }
    }, { passive: true });

    // ============================================================
    // Skill card stagger animation
    // ============================================================
    var skillCards = document.querySelectorAll('.skill-card');
    if (skillCards.length > 0 && !prefersReducedMotion) {
        var skillObserver = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    var cards = entries[i].target.querySelectorAll('.skill-card');
                    if (cards.length === 0 && entries[i].target.classList.contains('skill-card')) {
                        entries[i].target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                        entries[i].target.style.opacity = '1';
                        entries[i].target.style.transform = 'translateY(0)';
                    }
                    skillObserver.unobserve(entries[i].target);
                }
            }
        }, { threshold: 0.1 });

        for (var sc = 0; sc < skillCards.length; sc++) {
            skillCards[sc].style.opacity = '0';
            skillCards[sc].style.transform = 'translateY(30px)';
            skillCards[sc].style.transitionDelay = (sc * SKILL_CARD_STAGGER_MS) + 'ms';
            skillObserver.observe(skillCards[sc]);
        }
    }

    // ============================================================
    // Parallax effect on scroll (throttled via rAF)
    // ============================================================
    var parallaxTicking = false;
    var heroContentEl = document.querySelector('.hero-content');
    var heroVisualEl = document.querySelector('.hero-visual');

    function updateParallax() {
        if (prefersReducedMotion) {
            parallaxTicking = false;
            return;
        }
        var scrolled = window.scrollY;

        if (heroContentEl) {
            heroContentEl.style.transform = 'translateY(' + (scrolled * PARALLAX_HERO_FACTOR) + 'px)';
        }
        if (heroVisualEl) {
            heroVisualEl.style.transform = 'translateY(-50%) translateY(' + (scrolled * PARALLAX_VISUAL_FACTOR) + 'px)';
        }
        parallaxTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!parallaxTicking) {
            requestAnimationFrame(updateParallax);
            parallaxTicking = true;
        }
    }, { passive: true });

    // ============================================================
    // Terminal typing animation delay
    // ============================================================
    var terminalLines = document.querySelectorAll('.terminal-line');
    for (var tl = 0; tl < terminalLines.length; tl++) {
        terminalLines[tl].style.animationDelay = (tl * 0.3) + 's';
    }

    // Cursor blink (CSS handles this via animation, JS interval unnecessary)
    // Removed redundant JS-based cursor blinking - CSS `animation: blink 1s infinite` handles it

    // ============================================================
    // Network node interaction on hero (mouse follow)
    // ============================================================
    var mainNode = document.querySelector('.main-node');
    var subNodes = document.querySelectorAll('.sub-node');

    if (mainNode && subNodes.length > 0 && !prefersReducedMotion) {
        var heroMouseX = 0;
        var heroMouseY = 0;
        var nodeAnimId = null;

        document.addEventListener('mousemove', function (e) {
            heroMouseX = e.clientX;
            heroMouseY = e.clientY;
        }, { passive: true });

        function animateNodes() {
            var rect = mainNode.getBoundingClientRect();
            var centerX = rect.left + rect.width / 2;
            var centerY = rect.top + rect.height / 2;
            var deltaX = (heroMouseX - centerX) * 0.02;
            var deltaY = (heroMouseY - centerY) * 0.02;

            for (var i = 0; i < subNodes.length; i++) {
                var angle = (i / subNodes.length) * Math.PI * 2;
                var dist = 120;
                var x = Math.cos(angle) * dist + deltaX;
                var y = Math.sin(angle) * dist + deltaY;
                subNodes[i].style.setProperty('--x', x + 'px');
                subNodes[i].style.setProperty('--y', y + 'px');
            }

            if (isPageVisible) {
                nodeAnimId = requestAnimationFrame(animateNodes);
            }
        }

        animateNodes();

        // Pause node animation when page hidden
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                if (nodeAnimId) {
                    cancelAnimationFrame(nodeAnimId);
                    nodeAnimId = null;
                }
            } else if (!nodeAnimId) {
                animateNodes();
            }
        });
    }

    // ============================================================
    // Dynamic signal bars animation
    // ============================================================
    var signalBars = document.querySelectorAll('.bar');
    if (signalBars.length > 0 && !prefersReducedMotion) {
        setInterval(function () {
            if (!isPageVisible) return;
            for (var i = 0; i < signalBars.length; i++) {
                var randomHeight = Math.random() * 60 + 30;
                signalBars[i].style.setProperty('--height', randomHeight + '%');
            }
        }, SIGNAL_BAR_INTERVAL_MS);
    }

})();

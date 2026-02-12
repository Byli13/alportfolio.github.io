// Network Canvas Animation
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let width, height, nodes = [], mouse = { x: 0, y: 0 };

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Node {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffcc';
        ctx.fill();
    }
}

function createNodes() {
    nodes = [];
    const nodeCount = Math.min(50, (width * height) / 15000);
    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
    }
}

function connectNodes() {
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(0, 255, 204, ${1 - distance / 150})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    connectNodes();
    requestAnimationFrame(animate);
}

initCanvas();
createNodes();
animate();

window.addEventListener('resize', () => {
    initCanvas();
    createNodes();
});

// Mouse tracking for network effect
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Stats Counter Animation
function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';

            // Animate counters when hero is visible
            if (entry.target.classList.contains('hero')) {
                document.querySelectorAll('.stat-value').forEach(stat => {
                    animateCounter(stat);
                });
            }

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.style.color = '#00ffcc';
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Skill card stagger animation
const skillCards = document.querySelectorAll('.skill-card');
skillCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';

    setTimeout(() => {
        card.style.transition = 'all 0.6s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, index * 100);
});

// Project card stagger animation
const projectCards = document.querySelectorAll('.project-card');
const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }, index * 150);
            projectObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

projectCards.forEach(card => {
    card.style.opacity = '0';
    projectObserver.observe(card);
});

// Parallax effect on scroll
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    }

    if (heroVisual) {
        heroVisual.style.transform = `translateY(-50%) translateY(${scrolled * 0.2}px)`;
    }

    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Terminal typing effect enhancement
const terminalLines = document.querySelectorAll('.terminal-line');
terminalLines.forEach((line, index) => {
    line.style.animationDelay = `${index * 0.3}s`;
});

// Add cursor blink to last terminal line
const lastTerminalLine = document.querySelector('.terminal-line:last-child .cursor');
if (lastTerminalLine) {
    setInterval(() => {
        lastTerminalLine.style.opacity = lastTerminalLine.style.opacity === '0' ? '1' : '0';
    }, 500);
}

// Network node interaction on hero
const mainNode = document.querySelector('.main-node');
const subNodes = document.querySelectorAll('.sub-node');

if (mainNode) {
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateNodes() {
        const rect = mainNode.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (mouseX - centerX) * 0.02;
        const deltaY = (mouseY - centerY) * 0.02;

        subNodes.forEach((node, index) => {
            const angle = (index / subNodes.length) * Math.PI * 2;
            const distance = 120;
            const x = Math.cos(angle) * distance + deltaX;
            const y = Math.sin(angle) * distance + deltaY;

            node.style.setProperty('--x', `${x}px`);
            node.style.setProperty('--y', `${y}px`);
        });

        requestAnimationFrame(animateNodes);
    }

    animateNodes();
}

// Add glitch effect to hero title on hover
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    heroTitle.addEventListener('mouseenter', () => {
        heroTitle.style.animation = 'none';
        setTimeout(() => {
            heroTitle.style.animation = 'glitch 0.3s ease-in-out';
        }, 10);
    });
}

// Dynamic signal bars animation
const signalBars = document.querySelectorAll('.bar');
setInterval(() => {
    signalBars.forEach(bar => {
        const randomHeight = Math.random() * 60 + 30;
        bar.style.setProperty('--height', `${randomHeight}%`);
    });
}, 1500);

// Add data flow effect on scroll
let dataFlowParticles = [];

class DataParticle {
    constructor() {
        this.x = Math.random() * width;
        this.y = -10;
        this.speed = Math.random() * 2 + 1;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random();
    }

    update() {
        this.y += this.speed;
        this.opacity -= 0.005;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 204, ${this.opacity})`;
        ctx.fill();
    }

    isOffScreen() {
        return this.y > height || this.opacity <= 0;
    }
}

// Initialize data particles periodically
setInterval(() => {
    if (dataFlowParticles.length < 20) {
        dataFlowParticles.push(new DataParticle());
    }
}, 100);

// Enhanced animate function with data flow
function enhancedAnimate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw nodes
    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    connectNodes();

    // Update and draw data particles
    dataFlowParticles = dataFlowParticles.filter(particle => {
        particle.update();
        particle.draw();
        return !particle.isOffScreen();
    });

    requestAnimationFrame(enhancedAnimate);
}

// Replace the original animate call
enhancedAnimate();

console.log('%c🌐 Network Portfolio Initialized', 'color: #00ffcc; font-size: 16px; font-weight: bold;');
console.log('%c📡 All systems operational', 'color: #00ff88; font-size: 12px;');
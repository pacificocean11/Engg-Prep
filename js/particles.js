document.addEventListener('DOMContentLoaded', () => {
// --- DYNAMIC BACKGROUND PARTICLE SYSTEM (A-1) ---
    class Particle {
        constructor(canvas, type = 'default') {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.type = type;
            this.reset();
        }

        reset() {
            this.x = Math.random() * this.canvas.width;
            this.y = Math.random() * this.canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = 'rgba(255, 0, 110, ' + this.opacity + ')'; // Default pink

            if (this.type === 'thermo' || this.type === 'heat') {
                this.y = this.canvas.height + Math.random() * 100;
                this.speedY = -Math.random() * 2 - 0.5;
                this.speedX = (Math.random() - 0.5) * 1;
                this.color = `rgba(255, ${Math.floor(Math.random() * 100 + 50)}, 0, ${this.opacity})`;
            } else if (this.type === 'fluids' || this.type === 'water-res') {
                this.x = -10;
                this.speedX = Math.random() * 2 + 1;
                this.speedY = Math.sin(this.x * 0.01) * 0.5;
                this.color = `rgba(0, ${Math.floor(Math.random() * 100 + 155)}, 255, ${this.opacity})`;
            } else if (this.type === 'electricity') {
                this.speedX = (Math.random() - 0.5) * 4;
                this.speedY = (Math.random() - 0.5) * 4;
                this.color = `rgba(253, 166, 10, ${this.opacity})`;
            }
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.type === 'thermo' || this.type === 'heat') {
                if (this.y < -10) this.reset();
            } else if (this.type === 'fluids' || this.type === 'water-res') {
                this.speedY = Math.sin(this.x * 0.02) * 1;
                if (this.x > this.canvas.width + 10) this.reset();
            } else {
                if (this.x < 0 || this.x > this.canvas.width || this.y < 0 || this.y > this.canvas.height) {
                    this.reset();
                }
            }
        }

        draw() {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    const ParticleSystem = {
        canvas: document.getElementById('bg-canvas'),
        ctx: null,
        particles: [],
        count: 60,
        animationId: null,
        currentType: 'default',

        init() {
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.createParticles();
            this.animate();
        },

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.count; i++) {
                this.particles.push(new Particle(this.canvas, this.currentType));
            }
        },

        setTheme(type) {
            if (this.currentType === type) return;
            this.currentType = type;
            
            // Fade out effect
            this.canvas.style.opacity = '0';
            setTimeout(() => {
                this.createParticles();
                this.canvas.style.opacity = '0.5';
            }, 500);
        },

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles.forEach(p => {
                p.update();
                p.draw();
            });
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    };

    ParticleSystem.init();

    window.updateBackgroundTheme = function(subjectId) {
        const themeMap = {
            'thermo': 'thermo',
            'heat': 'thermo',
            'fluids': 'fluids',
            'water-res': 'fluids',
            'electricity': 'electricity',
            'math': 'default',
            'statics': 'default',
            'dynamics': 'default',
            'mock': 'electricity', // Mock exam uses high-energy gold theme
            'structural': 'default',
            'geotech': 'default',
            'transport': 'default',
            'construction': 'default'
        };
        ParticleSystem.setTheme(themeMap[subjectId] || 'default');
    };

    
});

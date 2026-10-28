/**
 * ENGG.tv - Live Interactive Sandbox Blueprints (Dynamic Physics Playground)
 * GPU-accelerated HTML5 Canvas micro-simulations calibrated to NCEES Reference Handbook formulas.
 */

(function(window) {
    'use strict';

    let canvas = null;
    let ctx = null;
    let animId = null;
    let isRunning = false;
    let currentTopic = 'venturi';
    let currentCard = null;

    // Simulation State Parameters
    const state = {
        slider1: 50,       // Primary parameter (0 - 100)
        time: 0,
        particles: [],
        isDragging: false,
        dragStartY: 0
    };

    // Initialize particle pool for fluid simulations
    function initParticles(count = 35) {
        state.particles = [];
        for (let i = 0; i < count; i++) {
            state.particles.push({
                x: Math.random(),
                y: 0.15 + Math.random() * 0.7,
                speedOffset: 0.85 + Math.random() * 0.3,
                size: 2 + Math.random() * 2,
                alpha: 0.4 + Math.random() * 0.5
            });
        }
    }

    // Determine simulation topic from card metadata
    function detectTopic(card) {
        if (!card) return 'venturi';
        const str = ((card.title || '') + ' ' + (card.formula || '') + ' ' + (card.description || '')).toLowerCase();
        
        if (str.includes('bernoulli') || str.includes('venturi') || str.includes('fluid') || str.includes('pipe') || str.includes('manometer') || str.includes('head loss')) {
            return 'venturi';
        }
        if (str.includes('mohr') || str.includes('principal stress') || str.includes('shear stress') || str.includes('stress transformation')) {
            return 'mohr';
        }
        if (str.includes('carnot') || str.includes('thermodynamic') || str.includes('heat engine') || str.includes('rankine') || str.includes('efficiency')) {
            return 'carnot';
        }
        if (str.includes('curvature') || str.includes('radius of curvature') || str.includes('beam') || str.includes('derivative') || str.includes('osculating')) {
            return 'curvature';
        }
        if (str.includes('rlc') || str.includes('resonance') || str.includes('ac circuit') || str.includes('filter') || str.includes('frequency')) {
            return 'resonance';
        }
        return 'venturi'; // default dynamic fluid playground
    }

    // Set up canvas with high DPI sharpness
    function resizeCanvas() {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        if (ctx) ctx.scale(dpr, dpr);
    }

    // =========================================================================
    // SIMULATION 1: VENTURI TUBE & BERNOULLI FLUID STREAMLINES
    // =========================================================================
    function renderVenturi(w, h) {
        const throatRatio = 0.2 + (state.slider1 / 100) * 0.65; // 0.2 to 0.85
        const pipeH1 = h * 0.44;
        const pipeH2 = pipeH1 * throatRatio;
        const centerY = h * 0.52;
        const throatWidth = w * 0.22;
        const throatX = w * 0.5;

        // Pipe profile function: returns half-height at horizontal coordinate x
        function getHalfHeight(x) {
            const dist = Math.abs(x - throatX);
            const blendDist = w * 0.28;
            if (dist < throatWidth / 2) {
                return pipeH2 / 2;
            } else if (dist > blendDist) {
                return pipeH1 / 2;
            } else {
                const t = (dist - throatWidth / 2) / (blendDist - throatWidth / 2);
                const smooth = (1 - Math.cos(t * Math.PI)) / 2;
                return (pipeH2 / 2) + smooth * ((pipeH1 / 2) - (pipeH2 / 2));
            }
        }

        // Draw Pipe Interior Background (Dark Slate Glass)
        ctx.fillStyle = '#070d19';
        ctx.fillRect(0, 0, w, h);

        // Draw Pipe Fluid Stream Channel
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, centerY - pipeH1 / 2);
        for (let x = 0; x <= w; x += 8) {
            ctx.lineTo(x, centerY - getHalfHeight(x));
        }
        ctx.lineTo(w, centerY + pipeH1 / 2);
        for (let x = w; x >= 0; x -= 8) {
            ctx.lineTo(x, centerY + getHalfHeight(x));
        }
        ctx.closePath();

        // Water Fluid Gradient
        const fluidGrad = ctx.createLinearGradient(0, centerY - pipeH1/2, 0, centerY + pipeH1/2);
        fluidGrad.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
        fluidGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.28)');
        fluidGrad.addColorStop(1, 'rgba(6, 182, 212, 0.18)');
        ctx.fillStyle = fluidGrad;
        ctx.fill();

        // Glowing Glass Walls of Pipe
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();

        // Draw Streamlines
        ctx.save();
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        const streamlineOffsets = [-0.6, -0.3, 0, 0.3, 0.6];
        streamlineOffsets.forEach(off => {
            ctx.beginPath();
            for (let x = 0; x <= w; x += 10) {
                const y = centerY + getHalfHeight(x) * off;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
        ctx.restore();

        // Animate Fluid Flow Particles
        ctx.save();
        state.particles.forEach(p => {
            const currentHalfH = getHalfHeight(p.x * w);
            // Continuity equation: v * A = const => v proportional to 1 / height
            const localVelocity = (pipeH1 / (currentHalfH * 2)) * 0.0035 * p.speedOffset;
            p.x += localVelocity;
            if (p.x > 1.05) p.x = -0.05;

            const px = p.x * w;
            const py = centerY + (p.y - 0.5) * 2 * currentHalfH;

            ctx.fillStyle = px > throatX - throatWidth/2 && px < throatX + throatWidth/2 
                ? 'rgba(250, 204, 21, 0.95)' 
                : 'rgba(56, 189, 248, 0.8)';
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // 3 Vertical Manometer Tubes for Static Pressure Height h = P / (rho * g)
        const v1 = 2.0; // base velocity m/s
        const v2 = v1 / throatRatio;
        // Bernoulli: P1 + 0.5*rho*v1^2 = P2 + 0.5*rho*v2^2 => deltaP = 0.5*rho*(v2^2 - v1^2)
        const deltaP = 0.5 * 1000 * (v2 * v2 - v1 * v1) / 1000; // in kPa
        const manH1 = h * 0.38;
        const manH2 = Math.max(h * 0.08, manH1 - (deltaP * 1.8));
        const manH3 = manH1 * 0.94;

        const manometers = [
            { x: w * 0.22, height: manH1, label: 'P₁ (Static)' },
            { x: throatX, height: manH2, label: 'P₂ (Low P)' },
            { x: w * 0.78, height: manH3, label: 'P₃ (Recovery)' }
        ];

        manometers.forEach((m, idx) => {
            const topPipeY = centerY - getHalfHeight(m.x);
            const tubeTopY = h * 0.08;
            const tubeW = 12;

            // Glass tube casing
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(m.x - tubeW/2, tubeTopY, tubeW, topPipeY - tubeTopY);

            // Water column inside tube
            const liquidLevel = topPipeY - m.height;
            const colGrad = ctx.createLinearGradient(0, liquidLevel, 0, topPipeY);
            colGrad.addColorStop(0, idx === 1 ? '#f59e0b' : '#06b6d4');
            colGrad.addColorStop(1, 'rgba(14, 165, 233, 0.5)');
            ctx.fillStyle = colGrad;
            ctx.fillRect(m.x - tubeW/2 + 1, liquidLevel, tubeW - 2, topPipeY - liquidLevel);

            // Meniscus line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(m.x - tubeW/2 + 1, liquidLevel);
            ctx.lineTo(m.x + tubeW/2 - 1, liquidLevel);
            ctx.stroke();

            // Label above
            ctx.fillStyle = idx === 1 ? '#fef08a' : '#7dd3fc';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(m.label, m.x, tubeTopY - 4);
        });

        // Throttle Arrow Indicator at Throat
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`v₂ = ${v2.toFixed(1)} m/s (High Speed)`, throatX, centerY + pipeH2/2 + 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`v₁ = ${v1.toFixed(1)} m/s`, w * 0.22, centerY + pipeH1/2 + 16);

        // Update Bottom Readout HUD
        const metricEl = document.getElementById('fc-sandbox-metric');
        if (metricEl) {
            metricEl.innerHTML = `ΔP: <span class="text-amber-300 font-bold">${deltaP.toFixed(1)} kPa</span> | v₂/v₁: ${(v2/v1).toFixed(1)}×`;
        }
    }

    // =========================================================================
    // SIMULATION 2: MOHR'S CIRCLE & 2D STRESS ROTATION
    // =========================================================================
    function renderMohr(w, h) {
        ctx.fillStyle = '#070d19';
        ctx.fillRect(0, 0, w, h);

        const thetaDeg = (state.slider1 / 100) * 180; // 0 to 180 deg
        const thetaRad = (thetaDeg * Math.PI) / 180;

        // Base Stresses (MPa)
        const sigmaX = 80;
        const sigmaY = 20;
        const tauXY = 35;

        // Mohr's circle center & radius
        const centerSigma = (sigmaX + sigmaY) / 2; // 50
        const radius = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2)); // 46.1
        const sigma1 = centerSigma + radius; // 96.1 MPa
        const sigma2 = centerSigma - radius; // 3.9 MPa
        const tauMax = radius;

        // Scale factors for plotting circle on right half
        const plotCenterX = w * 0.65;
        const plotCenterY = h * 0.50;
        const scale = (h * 0.36) / (radius * 1.35);

        // Grid axes for Mohr's Circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Horizontal normal stress axis (sigma)
        ctx.moveTo(w * 0.38, plotCenterY);
        ctx.lineTo(w * 0.94, plotCenterY);
        // Vertical shear stress axis (tau)
        ctx.moveTo(plotCenterX - centerSigma * scale, h * 0.1);
        ctx.lineTo(plotCenterX - centerSigma * scale, h * 0.88);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('σ (MPa)', w * 0.94, plotCenterY - 6);
        ctx.textAlign = 'center';
        ctx.fillText('τ (Shear)', plotCenterX - centerSigma * scale, h * 0.08);

        // Draw Circle
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(plotCenterX, plotCenterY, radius * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Circle Center Point (C)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(plotCenterX, plotCenterY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Current Transformed Diameter Line (rotated by 2*theta)
        const ptX = plotCenterX + ((sigmaX - sigmaY) / 2 * Math.cos(2 * thetaRad) + tauXY * Math.sin(2 * thetaRad)) * scale;
        const ptY = plotCenterY - (-((sigmaX - sigmaY) / 2 * Math.sin(2 * thetaRad) + tauXY * Math.cos(2 * thetaRad)) * scale);
        
        const ptOppX = plotCenterX - (ptX - plotCenterX);
        const ptOppY = plotCenterY - (ptY - plotCenterY);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ptOppX, ptOppY);
        ctx.lineTo(ptX, ptY);
        ctx.stroke();

        // Point X' Marker
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(ptX, ptY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // -------------------------------------------------------------
        // Left side: Rotated Stress Element Cube
        // -------------------------------------------------------------
        const cubeX = w * 0.20;
        const cubeY = h * 0.50;
        const cubeSize = Math.min(w * 0.16, h * 0.35);

        ctx.save();
        ctx.translate(cubeX, cubeY);
        ctx.rotate(-thetaRad); // counter-clockwise theta

        // Cube Fill & Outline
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.fillRect(-cubeSize/2, -cubeSize/2, cubeSize, cubeSize);
        ctx.strokeRect(-cubeSize/2, -cubeSize/2, cubeSize, cubeSize);

        // Normal stress arrows
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        // Right face (sigmaTheta)
        ctx.beginPath();
        ctx.moveTo(cubeSize/2, 0);
        ctx.lineTo(cubeSize/2 + 18, 0);
        ctx.stroke();
        // Left face
        ctx.beginPath();
        ctx.moveTo(-cubeSize/2, 0);
        ctx.lineTo(-cubeSize/2 - 18, 0);
        ctx.stroke();

        ctx.restore();

        // Angle Arc on Cube
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
        ctx.beginPath();
        ctx.arc(cubeX, cubeY, cubeSize * 0.75, 0, -thetaRad, true);
        ctx.stroke();
        ctx.fillStyle = '#fef08a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`θ = ${thetaDeg.toFixed(0)}°`, cubeX + cubeSize * 0.65, cubeY - 8);

        // Update Bottom Readout HUD
        const metricEl = document.getElementById('fc-sandbox-metric');
        if (metricEl) {
            metricEl.innerHTML = `σ₁: <span class="text-emerald-300 font-bold">${sigma1.toFixed(1)}</span> | τ_max: <span class="text-amber-300 font-bold">${tauMax.toFixed(1)} MPa</span>`;
        }
    }

    // =========================================================================
    // SIMULATION 3: CARNOT / RANKINE THERMODYNAMIC CYCLE
    // =========================================================================
    function renderCarnot(w, h) {
        ctx.fillStyle = '#070d19';
        ctx.fillRect(0, 0, w, h);

        const tH = 500 + (state.slider1 / 100) * 700; // 500 K to 1200 K
        const tC = 300; // 300 K
        const efficiency = (1 - (tC / tH)) * 100; // %

        const ox = w * 0.15;
        const oy = h * 0.78;
        const graphW = w * 0.68;
        const graphH = h * 0.60;

        // Axes (P vs V)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ox, oy - graphH);
        ctx.lineTo(ox, oy);
        ctx.lineTo(ox + graphW, oy);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText('P (Pressure)', ox, oy - graphH - 6);
        ctx.fillText('V (Volume)', ox + graphW - 20, oy + 14);

        // Carnot Cycle 4 points
        const expansionRatio = (tH / 500);
        const p1 = { x: ox + graphW * 0.18, y: oy - graphH * 0.88 };
        const p2 = { x: ox + graphW * (0.35 + expansionRatio * 0.08), y: oy - graphH * (0.55 + (expansionRatio - 1) * 0.12) };
        const p3 = { x: ox + graphW * (0.75 + expansionRatio * 0.08), y: oy - graphH * 0.22 };
        const p4 = { x: ox + graphW * 0.40, y: oy - graphH * 0.35 };

        // Shaded Work Area
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo((p1.x + p2.x)/2, (p1.y + p2.y)/2 - 10, p2.x, p2.y);
        ctx.quadraticCurveTo((p2.x + p3.x)/2 + 10, (p2.y + p3.y)/2, p3.x, p3.y);
        ctx.quadraticCurveTo((p3.x + p4.x)/2, (p3.y + p4.y)/2 + 8, p4.x, p4.y);
        ctx.quadraticCurveTo((p4.x + p1.x)/2 - 10, (p4.y + p1.y)/2, p1.x, p1.y);
        ctx.closePath();

        const workGrad = ctx.createRadialGradient((p1.x+p3.x)/2, (p1.y+p3.y)/2, 10, (p1.x+p3.x)/2, (p1.y+p3.y)/2, graphW * 0.4);
        workGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        workGrad.addColorStop(1, 'rgba(6, 182, 212, 0.15)');
        ctx.fillStyle = workGrad;
        ctx.fill();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // Cycle process labels
        ctx.fillStyle = '#fef08a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Net Work W_net (T_H = ${tH.toFixed(0)} K)`, (p1.x + p3.x) / 2, (p1.y + p3.y) / 2);

        // Efficiency Gauge Pill Top-Right
        const gaugeX = w * 0.82;
        const gaugeY = h * 0.35;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gaugeX - 45, gaugeY - 30, 90, 60);
        ctx.fillRect(gaugeX - 45, gaugeY - 30, 90, 60);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${efficiency.toFixed(1)}%`, gaugeX, gaugeY + 4);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText('CARNOT η', gaugeX, gaugeY + 18);

        // Update Bottom Readout HUD
        const metricEl = document.getElementById('fc-sandbox-metric');
        if (metricEl) {
            metricEl.innerHTML = `η: <span class="text-emerald-300 font-bold">${efficiency.toFixed(1)}%</span> | T_H: ${tH.toFixed(0)}K`;
        }
    }

    // =========================================================================
    // SIMULATION 4: RADIUS OF CURVATURE & OSCULATING CIRCLE
    // =========================================================================
    function renderCurvature(w, h) {
        ctx.fillStyle = '#070d19';
        ctx.fillRect(0, 0, w, h);

        const curveSharpness = 0.002 + (state.slider1 / 100) * 0.016; // k in y = k*x^2
        const cx = w * 0.50;
        const cy = h * 0.70;

        // Radius at origin: rho = 1 / |y''| = 1 / (2k)
        const rhoPixels = Math.min(h * 0.55, (1 / (2 * curveSharpness)) * 0.15);

        // Draw Coordinate Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.1, cy);
        ctx.lineTo(w * 0.9, cy);
        ctx.moveTo(cx, h * 0.1);
        ctx.lineTo(cx, h * 0.88);
        ctx.stroke();

        // Draw Parabolic Curve y = k * x^2
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let x = -w * 0.4; x <= w * 0.4; x += 4) {
            const y = cy - (curveSharpness * x * x);
            if (x === -w * 0.4) ctx.moveTo(cx + x, y);
            else ctx.lineTo(cx + x, y);
        }
        ctx.stroke();
        ctx.restore();

        // Draw Osculating Circle at vertex (x = 0)
        const oscY = cy - rhoPixels;
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, oscY, rhoPixels, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Radius Vector
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, oscY);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Osculating Center Point
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, oscY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`ρ = ${(1 / (2 * curveSharpness)).toFixed(1)} m`, cx + 8, cy - rhoPixels / 2);
        ctx.fillText(`κ = ${(2 * curveSharpness).toFixed(3)} m⁻¹`, cx + 8, cy - rhoPixels / 2 + 14);

        // Update Bottom Readout HUD
        const metricEl = document.getElementById('fc-sandbox-metric');
        if (metricEl) {
            metricEl.innerHTML = `ρ: <span class="text-amber-300 font-bold">${(1 / (2 * curveSharpness)).toFixed(1)} m</span> | κ: ${(2 * curveSharpness).toFixed(3)}`;
        }
    }

    // =========================================================================
    // MAIN ANIMATION LOOP
    // =========================================================================
    function loop() {
        if (!isRunning || !canvas || !ctx) return;
        state.time += 0.016;

        const w = canvas.getBoundingClientRect().width;
        const h = canvas.getBoundingClientRect().height;

        if (w === 0 || h === 0) {
            animId = requestAnimationFrame(loop);
            return;
        }

        ctx.clearRect(0, 0, w, h);

        switch (currentTopic) {
            case 'venturi':
                renderVenturi(w, h);
                break;
            case 'mohr':
                renderMohr(w, h);
                break;
            case 'carnot':
                renderCarnot(w, h);
                break;
            case 'curvature':
                renderCurvature(w, h);
                break;
            default:
                renderVenturi(w, h);
        }

        animId = requestAnimationFrame(loop);
    }

    // =========================================================================
    // PUBLIC CONTROLLER API
    // =========================================================================
    function startSandbox(card) {
        currentCard = card;
        currentTopic = detectTopic(card);
        canvas = document.getElementById('fc-sandbox-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        resizeCanvas();
        initParticles(35);

        // Update Header Badge
        const titleBadge = document.getElementById('fc-sandbox-topic-title');
        if (titleBadge) {
            const topicTitles = {
                venturi: 'Fluid Venturi & Bernoulli Manometer',
                mohr: "Mohr's Circle Stress Transformation",
                carnot: 'Carnot Cycle & Thermal Work Output',
                curvature: 'Osculating Circle & Curvature ρ'
            };
            titleBadge.textContent = topicTitles[currentTopic] || 'Interactive Physics Blueprint';
        }

        // Update Slider Label
        const sliderLabel = document.getElementById('fc-sandbox-slider1-label');
        if (sliderLabel) {
            const sliderLabels = {
                venturi: 'Throat:',
                mohr: 'Angle θ:',
                carnot: 'Heat T_H:',
                curvature: 'Curve k:'
            };
            sliderLabel.textContent = sliderLabels[currentTopic] || 'Param:';
        }

        const slider = document.getElementById('fc-sandbox-slider1');
        if (slider) {
            slider.value = state.slider1;
            slider.oninput = function() {
                state.slider1 = parseFloat(this.value);
            };
        }

        const resetBtn = document.getElementById('fc-sandbox-reset-btn');
        if (resetBtn) {
            resetBtn.onclick = function() {
                state.slider1 = 50;
                if (slider) slider.value = 50;
                initParticles(35);
            };
        }

        // Mouse / Touch Drag Support directly on canvas
        canvas.onmousedown = function(e) {
            state.isDragging = true;
            updateDrag(e);
        };
        window.onmousemove = function(e) {
            if (state.isDragging) updateDrag(e);
        };
        window.onmouseup = function() {
            state.isDragging = false;
        };

        canvas.ontouchstart = function(e) {
            state.isDragging = true;
            if (e.touches && e.touches[0]) updateDrag(e.touches[0]);
        };
        window.ontouchmove = function(e) {
            if (state.isDragging && e.touches && e.touches[0]) updateDrag(e.touches[0]);
        };
        window.ontouchend = function() {
            state.isDragging = false;
        };

        function updateDrag(e) {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            state.slider1 = relX * 100;
            if (slider) slider.value = state.slider1;
        }

        isRunning = true;
        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(loop);
    }

    function stopSandbox() {
        isRunning = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    window.addEventListener('resize', () => {
        if (isRunning) resizeCanvas();
    });

    window.ENGG_SANDBOX = {
        start: startSandbox,
        stop: stopSandbox,
        detectTopic: detectTopic
    };

})(window);

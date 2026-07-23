// --- CONTEXTUAL FORMULA POPUPS (A-5) ---
// Extracted from app.js for modular architecture

const FORMULA_DATA = {
    'Discriminant': {
        title: 'Discriminant (Conics)',
        formula: '$$\\Delta = B^2 - 4AC$$',
        context: 'Used to classify conic sections: $\\Delta < 0$ (Ellipse), $\\Delta = 0$ (Parabola), $\\Delta > 0$ (Hyperbola).'
    },
    'Point-Slope Form': {
        title: 'Point-Slope Form',
        formula: '$$y - y_1 = m(x - x_1)$$',
        context: 'Equation of a line passing through $(x_1, y_1)$ with slope $m$.'
    },
    'Perpendicular': {
        title: 'Perpendicular Lines',
        formula: '$$m_1 \\cdot m_2 = -1$$',
        context: 'The product of the slopes of two perpendicular lines is $-1$.'
    },
    'Bernoulli': {
        title: "Bernoulli's Equation",
        formula: '$$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho gh_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho gh_2$$',
        context: 'Energy conservation for an incompressible, non-viscous fluid in steady flow.'
    },
    'Ideal Gas Law': {
        title: 'Ideal Gas Law',
        formula: '$$PV = nRT$$',
        context: 'Relates pressure, volume, temperature, and amount of an ideal gas.'
    },
    'Newton\'s Second Law': {
        title: 'Newton\'s Second Law',
        formula: '$$F = ma$$',
        context: 'The force acting on an object is equal to the mass of that object times its acceleration.'
    },
    'Shear Stress': {
        title: 'Shear Stress (Average)',
        formula: '$$\\tau = \\frac{V}{A}$$',
        context: 'The internal force per unit area acting tangent to a cross-section.'
    },
    'Hooke\'s Law': {
        title: 'Hooke\'s Law',
        formula: '$$\\sigma = E \\epsilon$$',
        context: 'The stress in a material is proportional to the strain within its elastic limit.'
    },
    'Reynolds Number': {
        title: 'Reynolds Number',
        formula: '$$Re = \\frac{\\rho v D}{\\mu}$$',
        context: 'A dimensionless quantity used to predict fluid flow patterns (laminar vs turbulent).'
    },
    'Moment of Inertia': {
        title: 'Moment of Inertia (Rectangular)',
        formula: '$$I_x = \\frac{bh^3}{12}$$',
        context: 'A measure of an object\'s resistance to changes in its rotation or bending.'
    },
    'Manning\'s Equation': {
        title: 'Manning\'s Equation',
        formula: '$$v = \\frac{1.486}{n} R^{2/3} S^{1/2}$$',
        context: 'Used to calculate flow velocity in open channels (US units).'
    }
};

function injectFormulaTriggers(text) {
    return text;
}

// Attach to window so app.js can call it
window.injectFormulaTriggers = injectFormulaTriggers;

// Formula popup DOM elements and event listeners
// (These scripts load at the bottom of body, so DOM is already available)
const formulaPopup = document.getElementById('formula-popup');
const formulaTitle = document.getElementById('formula-title');
const formulaLatex = document.getElementById('formula-latex');
const formulaContext = document.getElementById('formula-context');

function showFormulaPopup(keyword, x, y) {
    const data = FORMULA_DATA[keyword];
    if (!data) return;

    if (formulaTitle) formulaTitle.textContent = data.title;
    if (formulaLatex) formulaLatex.innerHTML = data.formula;
    if (formulaContext) formulaContext.textContent = data.context;

    if (formulaPopup) {
        formulaPopup.style.left = `${x}px`;
        formulaPopup.style.top = `${y - 10}px`;
        formulaPopup.classList.add('visible');
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([formulaLatex]);
    }
}

function hideFormulaPopup() {
    if (formulaPopup) formulaPopup.classList.remove('visible');
}

// Attach to window
window.showFormulaPopup = showFormulaPopup;
window.hideFormulaPopup = hideFormulaPopup;

document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('formula-trigger')) {
        const keyword = e.target.getAttribute('data-keyword');
        const rect = e.target.getBoundingClientRect();
        const px = rect.left + window.scrollX;
        const py = rect.top + window.scrollY - 220;
        showFormulaPopup(keyword, px, py);
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('formula-trigger')) {
        hideFormulaPopup();
    }
});

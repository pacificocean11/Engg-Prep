document.addEventListener('DOMContentLoaded', () => {
// ===== DIGITAL SCRATCHPAD LOGIC =====
    const btnOpenScratchpad = document.getElementById('btn-open-scratchpad');
    const scratchpadModal = document.getElementById('scratchpad-modal');
    const btnCloseScratchpad = document.getElementById('btn-close-scratchpad');
    const spCanvas = document.getElementById('scratchpad-canvas');
    
    const toolPen = document.getElementById('sp-tool-pen');
    const toolEraser = document.getElementById('sp-tool-eraser');
    const toolClear = document.getElementById('sp-tool-clear');

    let spIsDrawing = false;
    let spCurrentTool = 'pen';
    let spCtx = null;

    if (spCanvas) {
        spCtx = spCanvas.getContext('2d', { willReadFrequently: true });
    }

    function resizeScratchpad() {
        if (!spCanvas || !spCtx) return;
        const parent = spCanvas.parentElement;
        const imgData = spCtx.getImageData(0, 0, spCanvas.width || 1, spCanvas.height || 1);
        spCanvas.width = parent.clientWidth;
        spCanvas.height = parent.clientHeight;
        if (spCanvas.width > 0 && spCanvas.height > 0) {
            spCtx.putImageData(imgData, 0, 0);
            spCtx.lineCap = 'round';
            spCtx.lineJoin = 'round';
        }
    }

    function getPointerPos(e) {
        const rect = spCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function startDraw(e) {
        if (!spCtx) return;
        spIsDrawing = true;
        const pos = getPointerPos(e);
        spCtx.beginPath();
        spCtx.moveTo(pos.x, pos.y);
        if (e.cancelable) e.preventDefault();
    }

    function drawPath(e) {
        if (!spIsDrawing || !spCtx) return;
        const pos = getPointerPos(e);
        spCtx.lineTo(pos.x, pos.y);
        
        if (spCurrentTool === 'pen') {
            spCtx.strokeStyle = '#f59e0b';
            spCtx.lineWidth = 3;
            spCtx.globalCompositeOperation = 'source-over';
        } else {
            spCtx.lineWidth = 30;
            spCtx.globalCompositeOperation = 'destination-out';
            spCtx.strokeStyle = 'rgba(0,0,0,1)';
        }
        
        spCtx.stroke();
        if (e.cancelable) e.preventDefault();
    }

    function stopDraw() {
        spIsDrawing = false;
    }

    if (spCanvas) {
        spCanvas.addEventListener('mousedown', startDraw);
        spCanvas.addEventListener('mousemove', drawPath);
        spCanvas.addEventListener('mouseup', stopDraw);
        spCanvas.addEventListener('mouseout', stopDraw);
        
        spCanvas.addEventListener('touchstart', startDraw, {passive: false});
        spCanvas.addEventListener('touchmove', drawPath, {passive: false});
        spCanvas.addEventListener('touchend', stopDraw);
    }

    if (btnOpenScratchpad && scratchpadModal) {
        btnOpenScratchpad.addEventListener('click', () => {
            scratchpadModal.classList.remove('hidden');
            setTimeout(() => {
                scratchpadModal.classList.add('opacity-100');
                resizeScratchpad();
            }, 10);
        });
    }

    if (btnCloseScratchpad && scratchpadModal) {
        btnCloseScratchpad.addEventListener('click', () => {
            scratchpadModal.classList.remove('opacity-100');
            setTimeout(() => scratchpadModal.classList.add('hidden'), 300);
        });
    }

    function updateSpToolUI() {
        if (spCurrentTool === 'pen') {
            if(toolPen) toolPen.className = "w-10 h-10 rounded-lg flex items-center justify-center text-white bg-primary shadow-inner transition-colors border border-primary/50";
            if(toolEraser) toolEraser.className = "w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors";
        } else {
            if(toolEraser) toolEraser.className = "w-10 h-10 rounded-lg flex items-center justify-center text-white bg-slate-600 shadow-inner transition-colors border border-slate-500";
            if(toolPen) toolPen.className = "w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors";
        }
    }

    if (toolPen) toolPen.addEventListener('click', () => { spCurrentTool = 'pen'; updateSpToolUI(); });
    if (toolEraser) toolEraser.addEventListener('click', () => { spCurrentTool = 'eraser'; updateSpToolUI(); });
    
    if (toolClear) {
        toolClear.addEventListener('click', () => {
            if (spCtx && spCanvas) {
                spCtx.clearRect(0, 0, spCanvas.width, spCanvas.height);
            }
        });
    }

    window.addEventListener('resize', () => {
        if (scratchpadModal && !scratchpadModal.classList.contains('hidden')) {
            resizeScratchpad();
        }
    });
});

function initCharts(overallPercentage, range = '7d') {
    const state = window.state;
    if (!state) {
        console.warn("⚠️ State is not initialized yet in initCharts");
        return;
    }
    state.intensityRange = range;
    
    // Update toggle UI
    const btn7d = document.getElementById('btn-intensity-7d');
    const btn30d = document.getElementById('btn-intensity-30d');
    if (btn7d && btn30d) {
        if (range === '7d') {
            btn7d.className = "text-[10px] px-2 py-0.5 rounded-full bg-secondary text-white font-bold transition-all";
            btn30d.className = "text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-outline font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all";
        } else {
            btn30d.className = "text-[10px] px-2 py-0.5 rounded-full bg-secondary text-white font-bold transition-all";
            btn7d.className = "text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-outline font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all";
        }
    }

    // Study Intensity Line Chart (B-3)
    const lineCtx = document.getElementById('studyIntensityChart');
    if (lineCtx) {
        let labels = [];
        let intensityData = [];
        const daysCount = range === '7d' ? 7 : 30;
        
        // Generate labels and real data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = daysCount - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            if (range === '7d') {
                labels.push(date.toLocaleDateString([], { weekday: 'short' }));
            } else {
                labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
            }
            
            // Calculate real intensity for this day
            const dayStart = new Date(date).getTime();
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);
            
            const dayIntensity = (state.recentActivity || [])
                .filter(a => {
                    const ts = new Date(a.timestamp).getTime();
                    return ts >= dayStart && ts < dayEnd;
                })
                .reduce((sum, a) => sum + (a.attempted || 0), 0);
            
            intensityData.push(dayIntensity);
        }

        if (state.charts && state.charts.line) {
            state.charts.line.data.labels = labels;
            state.charts.line.data.datasets[0].data = intensityData;
            state.charts.line.update();
        } else {
            const ctx = lineCtx.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(255, 0, 110, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 0, 110, 0.02)');

            if (!state.charts) state.charts = {};

            state.charts.line = new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Questions Answered',
                        data: intensityData,
                        borderColor: '#FF006E',
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 4,
                        pointRadius: range === '7d' ? 4 : 0,
                        pointBackgroundColor: '#FF006E',
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#FF006E',
                        pointHoverBorderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            titleFont: { family: 'Outfit', size: 12 },
                            bodyFont: { family: 'Lexend', size: 12 },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    return ` ${context.parsed.y} Questions`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { 
                            grid: { display: false }, 
                            border: { display: false },
                            ticks: {
                                display: true,
                                maxRotation: 0,
                                autoSkip: true,
                                maxTicksLimit: 7,
                                font: { size: 9, family: 'Lexend' },
                                color: '#94a3b8'
                            }
                        },
                        y: { 
                            display: false, 
                            grid: { display: false },
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Diagnostic Performance Report (NCEES Style)
    const diagnosticTbody = document.getElementById('diagnostic-report-body');
    if (diagnosticTbody) {
        const subjectStats = {};
        state.subjects.forEach(s => {
            subjectStats[s.id] = { name: s.name, correct: 0, attempted: 0 };
        });

        (state.recentActivity || []).forEach(a => {
            if (a.isMockExam) return;
            const sid = a.minimalSnapshot?.subjectId;
            if (sid && subjectStats[sid]) {
                subjectStats[sid].correct += (a.score || 0);
                subjectStats[sid].attempted += (a.attempted || 0);
            }
        });

        const diagnosticSubjects = state.subjects.map(s => subjectStats[s.id]);
        let html = '';

        if (!diagnosticSubjects.some(s => s.attempted > 0)) {
            html = `<tr><td colspan="3" class="text-center py-12 text-slate-400 dark:text-slate-500 text-sm font-medium">No diagnostic data available.<br>Complete a quiz to generate your report.</td></tr>`;
        } else {
            diagnosticSubjects.forEach(s => {
                const accuracy = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
                const barColor = accuracy >= 70 ? 'bg-emerald-500' : (accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500');
                const widthVal = s.attempted === 0 ? 0 : accuracy; // 0 if unattempted
                
                html += `
                <tr class="border-b border-slate-100 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td class="py-4 px-2 text-sm font-bold text-slate-800 dark:text-slate-200">${s.name}</td>
                    <td class="py-4 px-2 text-sm text-slate-600 dark:text-slate-400 text-center font-mono font-bold">${s.attempted}</td>
                    <td class="py-4 px-2 relative">
                        <!-- Continuous Dashed Target Line -->
                        <div class="absolute top-0 bottom-0 left-[70%] w-0 border-l-2 border-dashed border-black dark:border-white z-20 opacity-80 ml-2 pointer-events-none"></div>
                        
                        <!-- Progress Bar Container -->
                        <div class="w-full h-3 bg-slate-200 dark:bg-slate-700/50 rounded-full relative overflow-hidden shadow-inner z-10">
                            <!-- Performance Bar -->
                            <div class="h-full ${barColor} rounded-full relative transition-all duration-1000 ease-out" style="width: ${widthVal}%"></div>
                        </div>
                    </td>
                </tr>`;
            });
        }
        diagnosticTbody.innerHTML = html;
    }
}

// Attach to global scope for usage in app.js
window.initCharts = initCharts;

window.exportProgressReport = function() {
    if(!window.state) return;
    const s = window.state;
    
    // Calculate stats
    let totalQs = 0;
    let completedQs = 0;
    let advancedTotalQs = 0;
    let advancedCompletedQs = 0;
    
    // get both sources safely
    const qBasic = typeof QUESTIONS !== 'undefined' ? QUESTIONS : {};
    const qAdv = typeof ADVANCED_QUESTIONS !== 'undefined' ? ADVANCED_QUESTIONS : {};
    
    const subjectStats = {};
    if(s.subjects) {
        s.subjects.forEach(subj => {
            subjectStats[subj.id] = { id: subj.id, name: subj.name, correct: 0, attempted: 0 };
        });
    }
    
    // Populate diagnostic data from recent activity
    if(s.recentActivity) {
        s.recentActivity.forEach(a => {
            if (a.isMockExam) return;
            const sid = a.minimalSnapshot?.subjectId;
            if (sid && subjectStats[sid]) {
                subjectStats[sid].correct += (a.score || 0);
                subjectStats[sid].attempted += (a.attempted || 0);
            }
        });
    }
    
    const subjectBreakdown = [];
    
    if(s.subjects) {
        s.subjects.forEach(subj => {
            const basicQuestions = qBasic[subj.id] || [];
            const advQuestions = qAdv[subj.id] || [];
            
            const countBasic = basicQuestions.length;
            const countAdv = advQuestions.length;
            
            totalQs += countBasic;
            advancedTotalQs += countAdv;
            
            let progBasic = 0;
            let progAdv = 0;
            
            if(s.userProgress) {
                if(s.userProgress[subj.id]) {
                    progBasic = s.userProgress[subj.id].completed || 0;
                }
                if(s.userProgress[subj.id + '_advanced']) {
                    progAdv = s.userProgress[subj.id + '_advanced'].completed || 0;
                }
            }
            
            completedQs += progBasic;
            advancedCompletedQs += progAdv;
            
            subjectBreakdown.push({
                name: subj.name,
                basicCompleted: progBasic,
                basicTotal: countBasic,
                basicPct: countBasic > 0 ? Math.round((progBasic/countBasic)*100) : 0,
                advCompleted: progAdv,
                advTotal: countAdv,
                advPct: countAdv > 0 ? Math.round((progAdv/countAdv)*100) : 0
            });
        });
    }
    
    let overallProgress = totalQs > 0 ? Math.round((completedQs/totalQs)*100) : 0;
    let overallAdvProgress = advancedTotalQs > 0 ? Math.round((advancedCompletedQs/advancedTotalQs)*100) : 0;
    
    let name = s.user.username || "Student";
    let discipline = s.user.discipline || "Engineering";
    let points = s.userPoints || 0;
    
    // Calculate accurate Date Joined based on earliest activity
    let earliestDate = null;
    if(s.recentActivity && s.recentActivity.length > 0) {
        let timestamps = s.recentActivity.map(a => a.timestamp).filter(t => t);
        if(timestamps.length > 0) {
            let minTs = Math.min(...timestamps);
            earliestDate = new Date(minTs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    }
    let dateJoined = earliestDate || localStorage.getItem('enggtv_date_joined') || new Date().toLocaleDateString();
    
    const logoUrl = location.origin + '/engg_tv_logo.png';
    
    // Generate Diagnostic HTML Table Rows
    const diagnosticSubjects = s.subjects.map(subj => subjectStats[subj.id]);
    const hasDiagnosticData = diagnosticSubjects.some(stat => stat.attempted > 0);
    
    let diagnosticRowsHtml = '';
    if (!hasDiagnosticData) {
        diagnosticRowsHtml = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 30px;">No diagnostic data available. Complete a quiz to generate your report.</td></tr>`;
    } else {
        diagnosticRowsHtml = diagnosticSubjects.map((stat, i) => {
            const accuracy = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;
            let barColor = '#ef4444'; // Red
            if (accuracy >= 70) barColor = '#10b981'; // Emerald
            else if (accuracy >= 50) barColor = '#f59e0b'; // Amber
            
            const widthVal = stat.attempted === 0 ? 0 : accuracy;
            const uniqueQs = subjectBreakdown[i].basicCompleted + subjectBreakdown[i].advCompleted;
            
            return `
            <tr>
                <td class="td-subject">${stat.name}</td>
                <td style="text-align: center; font-size: 13px; font-weight: 800;" class="td-attempted">${uniqueQs}</td>
                <td style="vertical-align: middle;">
                    <div style="position: relative; width: 100%;">
                        <div style="position: absolute; top: -13px; bottom: -13px; left: 70%; border-left: 2px dashed #000; z-index: 20; opacity: 0.8;"></div>
                        <div class="progress-bar-bg" style="height: 12px; position: relative; overflow: hidden; z-index: 10;">
                            <div class="progress-bar-fill" style="width: ` + widthVal + `%; background-color: ` + barColor + `;"></div>
                        </div>
                    </div>
                </td>
                <td class="diag-pct" style="text-align: right; color: ` + barColor + `;">${accuracy}%</td>
            </tr>
            `;
        }).join('');
    }

    // Generate HTML
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${name} - FE Exam Progress Report</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body {
                font-family: 'Inter', sans-serif;
                color: #1e293b;
                margin: 0;
                padding: 40px;
                background: #f8fafc;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .report-container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                padding: 50px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                border-bottom: 2px solid #f1f5f9;
                padding-bottom: 30px;
                margin-bottom: 30px;
                text-align: left;
            }
            .header img {
                height: 60px;
                width: auto;
                object-fit: contain;
                border-radius: 8px;
            }
            .header-text {
                display: flex;
                align-items: center;
                height: 60px;
            }
            .header-text p {
                margin: 0;
                color: #1e293b;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }
            .student-info {
                display: flex;
                justify-content: space-between;
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .info-block {
                text-align: left;
            }
            .info-block span {
                display: block;
                font-size: 11px;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
                margin-bottom: 4px;
            }
            .info-block strong {
                font-size: 16px;
                color: #334155;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin-bottom: 40px;
            }
            .stat-card {
                background: #fff;
                border: 1px solid #e2e8f0;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
            .stat-card.highlight {
                background: #fff0f6;
                border-color: #fbcfe8;
            }
            .stat-card .value {
                font-size: 24px;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 5px;
            }
            .stat-card.highlight .value {
                color: #be185d;
            }
            .stat-card .label {
                font-size: 11px;
                color: #64748b;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .section-title {
                font-size: 18px;
                font-weight: 800;
                color: #334155;
                margin-bottom: 20px;
                border-left: 4px solid #FF006E;
                padding-left: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                margin-bottom: 50px;
            }
            th, td {
                padding: 12px 10px;
                text-align: left;
                border-bottom: 1px solid #f1f5f9;
            }
            th {
                background: #f8fafc;
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            td {
                font-size: 13px;
                color: #334155;
                font-weight: 600;
            }
            .td-subject {
                font-size: 13px;
            }
            .td-attempted {
                font-size: 14px;
            }
            .diag-pct {
                font-size: 16px;
                font-weight: 800;
            }
            .progress-container {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .progress-bar-bg {
                flex-grow: 1;
                background: #e2e8f0;
                height: 6px;
                border-radius: 3px;
                overflow: hidden;
            }
            .progress-bar-fill {
                background: #10b981;
                height: 100%;
                border-radius: 3px;
            }
            .progress-bar-fill.adv {
                background: #3b82f6;
            }
            .progress-text {
                width: 45px;
                text-align: right;
                font-size: 11px;
                color: #64748b;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
                padding-top: 20px;
            }
            
            /* Responsive Mobile View */
            @media (max-width: 768px) {
                body { padding: 10px; }
                .report-container { padding: 20px; }
                .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
                .student-info { flex-direction: column; gap: 15px; }
                .info-block { text-align: left !important; }
                
                .section-title { font-size: 14px; }
                th { font-size: 9px; padding: 8px 4px; }
                td { padding: 8px 4px; font-size: 11px; }
                .td-subject { font-size: 11px; }
                .td-attempted { font-size: 12px; }
                .diag-pct { font-size: 12px; }
                
                .progress-text { width: 35px; font-size: 9px; }
                .header img { width: auto; height: 40px; }
                .header-text { height: 40px; }
                .header-text p { font-size: 20px; }
            }

            @media print {
                body { background: white; padding: 0; }
                .report-container { box-shadow: none; border: none; padding: 0; width: 100%; max-width: 100%; }
            }
        </style>
    </head>
    <body onload="setTimeout(() => window.print(), 500)">
        <div class="report-container">
            <div class="header">
                <img src="${logoUrl}" alt="ENGG.tv Logo" onerror="this.style.display='none'">
                <div class="header-text">
                    <p>FE Exam Readiness Report</p>
                </div>
            </div>
            
            <div class="student-info">
                <div class="info-block">
                    <span>Candidate Name</span>
                    <strong>${name}</strong>
                </div>
                <div class="info-block">
                    <span>Discipline</span>
                    <strong>${discipline}</strong>
                </div>
                <div class="info-block">
                    <span>Date Joined</span>
                    <strong>${dateJoined}</strong>
                </div>
                <div class="info-block" style="text-align: right;">
                    <span>Report Date</span>
                    <strong>${new Date().toLocaleDateString()}</strong>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${overallProgress}%</div>
                    <div class="label">Basic Syllabus</div>
                </div>
                <div class="stat-card">
                    <div class="value">${overallAdvProgress}%</div>
                    <div class="label">Advanced Syllabus</div>
                </div>
                <div class="stat-card">
                    <div class="value">${completedQs + advancedCompletedQs} <span style="font-size: 14px; color: #94a3b8;">/ ${totalQs + advancedTotalQs}</span></div>
                    <div class="label">Total Qs Done</div>
                </div>
                <div class="stat-card highlight">
                    <div class="value">${points}</div>
                    <div class="label">Total Points</div>
                </div>
            </div>

            <h3 class="section-title">Section I: Syllabus Coverage: How many questions did you attempt</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 35%;">Subject Domain</th>
                        <th style="width: 32.5%;">Basic Foundation</th>
                        <th style="width: 32.5%;">Advanced Mastery</th>
                    </tr>
                </thead>
                <tbody>
                    ${subjectBreakdown.map(subj => {
                        let fillBasic = `width: ${subj.basicPct}%;`;
                        if (subj.basicPct === 100) fillBasic += ' background: #FF006E;';
                        
                        let fillAdv = `width: ${subj.advPct}%;`;
                        if (subj.advPct === 100) fillAdv += ' background: #FF006E;';

                        return `
                        <tr>
                            <td class="td-subject">${subj.name}</td>
                            <td>
                                <div class="progress-container">
                                    <div class="progress-bar-bg">
                                        <div class="progress-bar-fill" style="` + fillBasic + `"></div>
                                    </div>
                                    <div class="progress-text">${subj.basicCompleted}/${subj.basicTotal}</div>
                                </div>
                            </td>
                            <td>
                                <div class="progress-container">
                                    <div class="progress-bar-bg">
                                        <div class="progress-bar-fill adv" style="` + fillAdv + `"></div>
                                    </div>
                                    <div class="progress-text">${subj.advCompleted}/${subj.advTotal}</div>
                                </div>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <h3 class="section-title">Section II: Diagnostic Performance: This is your RECENT accuracy</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 35%;">Subject Domain</th>
                        <th style="width: 25%; text-align: center; line-height: 1.2;">Correctly answered<br>unique questions</th>
                        <th style="width: 30%;">Accuracy</th>
                        <th style="width: 10%; text-align: right;">Score</th>
                    </tr>
                </thead>
                <tbody>
                    ` + diagnosticRowsHtml + `
                </tbody>
            </table>

            <div class="footer">
                This report is automatically generated by ENGG.tv for self-assessment purposes. <br> Keep pushing forward—you're getting closer to passing the FE Exam!
            </div>
        </div>
    </body>
    </html>
    `;

    // Open in a new tab
    const newWindow = window.open();
    if(newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
    } else {
        if(window.showToast) {
            window.showToast("Popup Blocked", "Please allow popups to download your report.", "warning");
        } else {
            alert("Please allow popups to download your report.");
        }
    }
};

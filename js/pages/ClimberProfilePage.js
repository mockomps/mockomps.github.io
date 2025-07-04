
let currentClimberTab = 'profile'; // Module-level state

export function renderClimberProfilePage(headerContent, mainContent, controlsContainer, appData, navigate, context) {
    const { climberName, from, tab } = context;

    currentClimberTab = tab || 'profile';

    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">${climberName}</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    
    headerContent.querySelector('#back-btn').addEventListener('click', () => {
        history.back(); // Use history.back() for this back button
    });
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    controlsContainer.classList.remove('hidden');
    controlsContainer.innerHTML = `<div class="flex justify-center">
        <div id="climber-profile-selector" class="inline-flex bg-gray-800 p-1 rounded-md gap-1 overflow-x-auto no-scrollbar h-scroll">
            <button data-tab="profile" class="climber-tab-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">Profile</button>
            <button data-tab="progress" class="climber-tab-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">Progress</button>
            <button data-tab="history" class="climber-tab-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">History</button>
        </div>
    </div>`;
    
    mainContent.innerHTML = `<div id="climber-tab-content"></div>`;

    function setActiveClimberTab() {
        controlsContainer.querySelectorAll('.climber-tab-btn').forEach(btn => {
            const isSelected = btn.dataset.tab === currentClimberTab;
            btn.classList.toggle('bg-blue-600', isSelected);
            btn.classList.toggle('text-white', isSelected);
            btn.classList.toggle('shadow-md', isSelected);
            btn.classList.toggle('text-gray-300', !isSelected);
        });
    }

    setActiveClimberTab();
    renderClimberTabContent(mainContent, climberName, context, appData, navigate);

    controlsContainer.querySelector('#climber-profile-selector').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.tab !== currentClimberTab) {
            currentClimberTab = e.target.dataset.tab;
            // For tab changes, we replace state to keep a clean history within profile view
            history.replaceState({ page: 'climberProfile', context: { ...context, tab: currentClimberTab } }, '', window.location.hash);
            setActiveClimberTab();
            renderClimberTabContent(mainContent, climberName, context, appData, navigate);
        }
    });
}

function renderClimberTabContent(mainContent, climberName, profilePageContext, appData, navigate) {
    const container = mainContent.querySelector('#climber-tab-content');
    container.innerHTML = '';
    if (currentClimberTab === 'profile') {
        renderClimberProfile_ProfileTab(container, climberName, appData);
    } else if (currentClimberTab === 'progress') {
        renderClimberProfile_ProgressTab(container, climberName, appData);
    } else if (currentClimberTab === 'history') {
        renderClimberProfile_HistoryTab(container, climberName, profilePageContext, appData, navigate);
    }
}

function renderClimberProfile_ProfileTab(container, climberName, appData) {
    const climberInfo = appData.climbers.find(c => c.name === climberName);
    const climberStats = appData.climberStats.find(s => s.climber === climberName);

    let profileHTML = '<div class="space-y-4">';

    if (climberInfo) {
        let instaHTML = '';
        if (climberInfo.instagram && climberInfo.instagram !== 'N/A') {
            const handle = climberInfo.instagram.replace(/^@/, '');
            instaHTML = `<a href="https://instagram.com/${handle}" target="_blank" class="text-blue-400 hover:underline">@${handle}</a>`;
        }
        profileHTML += `
            <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4">
                <h2 class="text-xl font-bold text-gray-100 mb-2">${climberInfo.name}</h2>
                <div class="text-sm space-y-1 text-gray-300">
                    <p><span class="font-semibold text-gray-400">Country:</span> ${climberInfo.country || 'N/A'}</p>
                    <p><span class="font-semibold text-gray-400">Born:</span> ${climberInfo.date_of_birth || 'N/A'}</p>
                    <p><span class="font-semibold text-gray-400">Instagram:</span> ${instaHTML || 'N/A'}</p>
                </div>
            </div>`;
    }

    if (climberStats) {
        profileHTML += `
            <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4">
                <h3 class="text-lg font-bold text-gray-200 mb-3">All-Time Stats</h3>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Qualis</div><div class="font-bold text-xl text-gray-100">${climberStats.all_time_q || '0'}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Boulders</div><div class="font-bold text-xl text-gray-100">${climberStats.all_time_b || '0'}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Flashes</div><div class="font-bold text-xl text-gray-100">${climberStats.all_time_f || '0'}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Tops</div><div class="font-bold text-xl text-gray-100">${climberStats.all_time_t || '0'}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Zones</div><div class="font-bold text-xl text-gray-100">${climberStats.all_time_z || '0'}</div></div>
                </div>
            </div>`;

        const createGradeStatBox = (grade, stats) => {
            return `
            <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4">
                <h3 class="text-lg font-bold text-gray-200 mb-3">Grade ${grade} Stats</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Boulders</div><div class="font-bold text-xl text-gray-100">${stats[`grade_${grade}_b`] || '0'}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Flashes</div><div class="font-bold text-xl text-gray-100">${stats[`grade_${grade}_f`] || '0'}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Tops</div><div class="font-bold text-xl text-gray-100">${stats[`grade_${grade}_t`] || '0'}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Tops %</div><div class="font-bold text-xl text-gray-100">${stats[`grade_${grade}_t_pct`] || '0%'}</div></div>
                </div>
            </div>`;
        };

        profileHTML += `<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">`;
        profileHTML += createGradeStatBox(3, climberStats);
        profileHTML += createGradeStatBox(4, climberStats);
        profileHTML += createGradeStatBox(5, climberStats);
        profileHTML += createGradeStatBox(6, climberStats);
        profileHTML += `</div>`;
    } else if (!climberInfo) {
        profileHTML += `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No profile information available for this climber.</div>`;
    }
    
    profileHTML += '</div>';
    container.innerHTML = profileHTML;
}

function renderClimberProfile_ProgressTab(container, climberName, appData) {
    const climberData = appData.perCompGradeStats.filter(d => d.climber === climberName);
    
    if (climberData.length === 0) {
        container.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No progress data available for this climber.</div>`;
        return;
    }
    
    const gradeColors = {
        '3': '#facc15', // yellow-400
        '4': '#fb923c', // orange-400
        '5': '#f87171', // red-400
        '6': '#c084fc', // purple-400
    };

    let legendHTML = '<div class="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">';
    for (const grade in gradeColors) {
        legendHTML += `<div class="flex items-center space-x-2 text-sm">
            <div class="w-3 h-3 rounded-full" style="background-color: ${gradeColors[grade]}"></div>
            <span class="text-gray-400">Grade ${grade}</span>
        </div>`;
    }
    legendHTML += '</div>';

    container.innerHTML = `<div>
        ${legendHTML}
        <div class="space-y-6">
            <div>
                <h3 class="text-base font-semibold text-gray-200 text-center mb-2">Top Percentage</h3>
                <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-sm"><canvas id="topsChart"></canvas></div>
            </div>
            <div>
                <h3 class="text-base font-semibold text-gray-200 text-center mb-2">Zone Percentage</h3>
                <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-sm"><canvas id="zonesChart"></canvas></div>
            </div>
            <div>
                <h3 class="text-base font-semibold text-gray-200 text-center mb-2">Flash Percentage</h3>
                <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-sm"><canvas id="flashesChart"></canvas></div>
            </div>
            <div>
                <h3 class="text-base font-semibold text-gray-200 text-center mb-2">Qualis Placement</h3>
                <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-sm"><canvas id="qualiPlacementChart"></canvas></div>
            </div>
             <div id="final-placement-chart-container"></div>
        </div>
    </div>`;

    const climberComps = [...new Set(climberData.map(d => d.comp))].sort();

    const createPercentageChart = (canvasId, statKey) => {
        const isMobile = window.innerWidth <= 768;
        const datasets = Object.keys(gradeColors).map(grade => {
            const data = climberComps.map(comp => {
                const record = climberData.find(d => d.comp === comp && d.grade === grade);
                return record ? parseFloat(record[statKey]) : null;
            });
            return {
                label: `Grade ${grade}`,
                data: data,
                borderColor: gradeColors[grade],
                backgroundColor: gradeColors[grade],
                fill: false,
                tension: 0.1,
                spanGaps: true,
                borderWidth: isMobile ? 1.5 : 2.5,
                pointRadius: isMobile ? 2.5 : 3.5,
                clip: false
            };
        });

        new Chart(container.querySelector(`#${canvasId}`), {
            type: 'line',
            data: {
                labels: climberComps,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                layout: { padding: { top: 10 } },
                plugins: {
                    title: { display: false },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { 
                            color: '#94a3b8', 
                            stepSize: 20,
                            callback: value => value + '%' 
                        },
                        grid: { color: 'rgba(55, 65, 81, 0.5)', drawBorder: false }
                    },
                    x: {
                        ticks: { color: '#94a3b8', autoSkip: true, maxRotation: 0, minRotation: 0, font: {size: 10} },
                        grid: { display: false }
                    }
                }
            }
        });
    };

    const createPlacementChart = (canvasId, data, color) => {
        const isMobile = window.innerWidth <= 768;
        
        const labels = data.map(d => d.comp || (d.final || '').replace(/F$/, ''));
        const placementData = data.map(d => parseInt(d.place));

        new Chart(container.querySelector(`#${canvasId}`), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Placement',
                    data: placementData,
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                    tension: 0.1,
                    spanGaps: true,
                    borderWidth: isMobile ? 1.5 : 2.5,
                    pointRadius: isMobile ? 2.5 : 3.5,
                    clip: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                layout: { padding: { top: 10 } },
                plugins: {
                    title: { display: false },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        reverse: true,
                        beginAtZero: false,
                        ticks: {
                            color: '#94a3b8',
                            stepSize: 1
                        },
                        grid: { color: 'rgba(55, 65, 81, 0.5)', drawBorder: false }
                    },
                    x: {
                        ticks: { color: '#94a3b8', autoSkip: true, maxRotation: 0, minRotation: 0, font: {size: 10} },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    createPercentageChart('topsChart', 'top_pct');
    createPercentageChart('zonesChart', 'zone_pct');
    createPercentageChart('flashesChart', 'flash_pct');

    const qualiPlacements = appData.qStandings
        .filter(s => s.climber === climberName)
        .sort((a,b) => a.comp.localeCompare(b.comp));
    if (qualiPlacements.length > 0) {
            createPlacementChart('qualiPlacementChart', qualiPlacements, '#38bdf8');
    }

    const finalPlacements = appData.fRankings
        .filter(s => s.climber === climberName)
        .sort((a,b) => a.final.localeCompare(b.final));
    if (finalPlacements.length > 0) {
        container.querySelector('#final-placement-chart-container').innerHTML = `
            <div>
                <h3 class="text-base font-semibold text-gray-200 text-center mb-2">Final Placement</h3>
                <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-sm"><canvas id="finalPlacementChart"></canvas></div>
            </div>
        `;
        createPlacementChart('finalPlacementChart', finalPlacements, '#4ade80');
    }
}

function getOrdinal(n) {
    if (isNaN(n) || n === null || n === '') return n;
    const num = parseInt(n, 10);
    if (isNaN(num)) return n;
    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

function renderClimberProfile_HistoryTab(container, climberName, profilePageContext, appData, navigate) {
    const compDateMap = new Map(appData.comps.map(c => [c.comp, new Date(c.start)]));
    const historyByComp = Object.create(null);

    appData.qStandings
        .filter(s => s.climber === climberName)
        .forEach(s => {
            if (s.comp) {
                if (!historyByComp[s.comp]) {
                    historyByComp[s.comp] = { date: compDateMap.get(s.comp) || new Date(0), results: [] };
                }
                historyByComp[s.comp].results.push(`<span class="text-gray-400 font-semibold">Qualis</span> <strong class="text-white">${getOrdinal(s.place)} place</strong>`);
            }
        });

    appData.fRankings
        .filter(s => s.climber === climberName)
        .forEach(s => {
            const compName = (s.final || '').replace(/F$/, '');
             if (compName) {
                if (!historyByComp[compName]) {
                    historyByComp[compName] = { date: compDateMap.get(compName) || new Date(0), results: [] };
                }
                historyByComp[compName].results.push(`<span class="text-cyan-400 font-semibold">Finals</span> <strong class="text-white">${getOrdinal(s.place)} place</strong>`);
            }
        });
    
    const sortedHistory = Object.entries(historyByComp).sort(([, a], [, b]) => b.date - a.date);

    if (sortedHistory.length === 0) {
        container.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No competition history found.</div>`;
        return;
    }

    let historyHTML = '<div class="space-y-4">';
    sortedHistory.forEach(([compName, data]) => {
        historyHTML += `<div class="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-sm">
            <button data-comp="${compName}" class="history-comp-link font-bold text-lg text-left text-gray-100 mb-2 hover:text-blue-400">${compName}</button>
            <div class="space-y-1 text-gray-200">`;
        data.results.forEach(resultText => {
            historyHTML += `<p>${resultText}</p>`;
        });
        historyHTML += `</div></div>`;
    });
    historyHTML += '</div>';
    container.innerHTML = historyHTML;

    container.querySelectorAll('.history-comp-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const compName = e.currentTarget.dataset.comp;
            const newFromContext = {
                ...profilePageContext,
                tab: 'history'
            };
            navigate('resultsComp', {
                comp: compName,
                from: { page: 'climberProfile', context: newFromContext }
            });
        });
    });
}

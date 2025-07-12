let currentClimberTab = 'profile'; // Module-level state

export function renderClimberProfilePage(headerContent, mainContent, controlsContainer, appData, navigate, context, GOOGLE_APP_SCRIPT_URL) {
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
            <button data-tab="stats" class="climber-tab-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">Stats</button>
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
    renderClimberTabContent(mainContent, climberName, context, appData, navigate, GOOGLE_APP_SCRIPT_URL);

    controlsContainer.querySelector('#climber-profile-selector').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.tab !== currentClimberTab) {
            currentClimberTab = e.target.dataset.tab;
            // For tab changes, we replace state to keep a clean history within profile view
            history.replaceState({ page: 'climberProfile', context: { ...context, tab: currentClimberTab } }, '', window.location.hash);
            setActiveClimberTab();
            renderClimberTabContent(mainContent, climberName, context, appData, navigate, GOOGLE_APP_SCRIPT_URL);
        }
    });
}

function renderClimberTabContent(mainContent, climberName, profilePageContext, appData, navigate, GOOGLE_APP_SCRIPT_URL) {
    const container = mainContent.querySelector('#climber-tab-content');
    container.innerHTML = '';
    if (currentClimberTab === 'profile') {
        renderClimberProfile_ProfileTab(container, climberName, appData, GOOGLE_APP_SCRIPT_URL);
    } else if (currentClimberTab === 'stats') {
        renderClimberProfile_StatsTab(container, climberName, appData);
    } else if (currentClimberTab === 'progress') {
        renderClimberProfile_ProgressTab(container, climberName, appData);
    } else if (currentClimberTab === 'history') {
        renderClimberProfile_HistoryTab(container, climberName, profilePageContext, appData, navigate);
    }
}

function formatPercentage(value, total) {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
}

function createGradeStatBox(grade, stats, color) {
    const gradeBoulders = stats[`grade_${grade}_b`] || '0';
    const gradeFlashes = stats[`grade_${grade}_f`] || '0';
    const gradeTops = stats[`grade_${grade}_t`] || '0';
    const gradeZones = stats[`grade_${grade}_z`] || '0';

    const flashPct = stats[`grade_${grade}_f_pct`] || '0';
    const topPct = stats[`grade_${grade}_t_pct`] || '0';
    const zonePct = stats[`grade_${grade}_z_pct`] || '0';

    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return `
    <div class="border border-gray-800 rounded-lg shadow-md p-4" style="background-color: ${hexToRgba(color, 0.08)};">
        <h3 class="text-lg font-bold text-gray-200 mb-3">Grade ${grade} Stats</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Boulders</div><div class="font-bold text-xl text-gray-100">${gradeBoulders}</div></div>
            <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Flashes</div><div class="font-bold text-xl text-gray-100">${gradeFlashes}${parseInt(gradeBoulders) > 0 ? `/${flashPct}%` : ''}</div></div>
            <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Tops</div><div class="font-bold text-xl text-gray-100">${gradeTops}${parseInt(gradeBoulders) > 0 ? `/${topPct}%` : ''}</div></div>
            <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Zones</div><div class="font-bold text-xl text-gray-100">${gradeZones}${parseInt(gradeBoulders) > 0 ? `/${zonePct}%` : ''}</div></div>
        </div>
    </div>`;
}

function createRatingModalHTML(climbers) {
    const attributes = ['Power', 'Fingers', 'Coordination', 'Balance', 'Technique', 'Reading', 'Commitment'];
    let slidersHTML = '';
    attributes.forEach(attr => {
        const attrId = attr.toLowerCase().replace(/\./g, '');
        slidersHTML += `
            <div class="mb-3">
                <label for="${attrId}-slider" class="block text-sm font-medium text-gray-300">${attr}</label>
                <div class="flex items-center space-x-3">
                    <input type="range" id="${attrId}-slider" name="${attrId}" min="0" max="10" value="5" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
                    <span id="${attrId}-value" class="text-gray-200 font-semibold w-6 text-center">5</span>
                </div>
            </div>
        `;
    });

    const climberOptions = climbers.map(climber => `<option value="${climber.name}">${climber.name}</option>`).join('');

    return `
        <div id="rating-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center p-4 z-50">
            <div class="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button id="close-modal-btn" class="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                <h2 class="text-xl font-bold text-white mb-4">Rate Attributes</h2>
                <form id="rating-form">
                    <div class="mb-4">
                        <label for="rater-name" class="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                        <select id="rater-name" name="raterName" class="w-full bg-gray-800 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select your name</option>
                            ${climberOptions}
                        </select>
                    </div>
                    <div class="space-y-2">
                        ${slidersHTML}
                    </div>
                    <div class="mt-6 text-right">
                        <button type="submit" id="submit-rating-btn" class="bg-blue-600 text-white font-bold py-2 px-5 rounded-md hover:bg-blue-700">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderClimberProfile_ProfileTab(container, climberName, appData, GOOGLE_APP_SCRIPT_URL) {
    const climberInfo = appData.climbers.find(c => c.name === climberName);
    const climberStats = appData.climberStats.find(s => s.climber === climberName);

    let climberGrade = null;
    if (climberStats) {
        let totalTopPercentage = 0;
        for (let i = 1; i <= 6; i++) {
            const topPct = parseFloat(climberStats[`grade_${i}_t_pct`] || '0') / 100;
            totalTopPercentage += topPct;
        }
        climberGrade = totalTopPercentage;
    }

    let profileHTML = '<div class="space-y-4">';

    if (climberInfo) {
        let instaHTML = '';
        if (climberInfo.instagram && climberInfo.instagram !== 'N/A') {
            const handle = climberInfo.instagram.replace(/^@/, '');
            instaHTML = `<a href="https://instagram.com/${handle}" target="_blank" class="text-blue-400 hover:underline">@${handle}</a>`;
        }
        profileHTML += `
            <div class="flex items-start space-x-4">
                <div class="flex-1 bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4">
                    <h2 class="text-xl font-bold text-gray-100 mb-2">${climberInfo.name}</h2>
                    <div class="text-sm space-y-1 text-gray-300">
                        <p><span class="font-semibold text-gray-400">Country:</span> ${climberInfo.country || 'N/A'}</p>
                        <p><span class="font-semibold text-gray-400">Born:</span> ${climberInfo.date_of_birth || 'N/A'}</p>
                        <p><span class="font-semibold text-gray-400">Instagram:</span> ${instaHTML || 'N/A'}</p>
                    </div>
                </div>
                ${climberGrade !== null ? `
                <div class="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-md text-center flex-shrink-0" style="width: 120px;">
                    <div class="text-xs text-gray-400">Climber Grade</div>
                    <div class="font-bold text-2xl text-gray-100">${climberGrade.toFixed(2)}</div>
                </div>` : ''}
            </div>`;
        
        // Add chart container here
        profileHTML += `
            <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-lg font-bold text-gray-200">Attributes</h3>
                    <button id="rate-attributes-btn" class="bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-blue-700">Rate</button>
                </div>
                <div id="climber-attributes-chart-area" class="h-80 md:h-80 flex items-center justify-center">
                    <canvas id="climberAttributesChart"></canvas>
                </div>
                <p class="text-xs text-gray-500 mt-2">The data points on the chart represent the average of all community submitted ratings.</p>
            </div>
        `;

    } else {
        profileHTML += `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No profile information available for this climber.</div>`;
    }
    
    profileHTML += '</div>';
    profileHTML += createRatingModalHTML(appData.climbers); // Add modal to the DOM
    container.innerHTML = profileHTML;

    // --- Modal Logic ---
    const modal = container.querySelector('#rating-modal');
    if (modal) {
        const openModalBtn = container.querySelector('#rate-attributes-btn');
        const closeModalBtn = container.querySelector('#close-modal-btn');
        const ratingForm = container.querySelector('#rating-form');
        const submitRatingBtn = container.querySelector('#submit-rating-btn');

        if (openModalBtn) {
            openModalBtn.addEventListener('click', () => {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) { // Click on backdrop
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });

        if (ratingForm) {
            ratingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                submitRatingBtn.disabled = true;
                submitRatingBtn.textContent = 'Submitting...';

                const formData = new FormData(ratingForm);
                const payload = {
                    formType: 'submitAttributeRating',
                    climberName: climberName,
                    raterName: formData.get('raterName'),
                };

                const attributes = ['Power', 'Fingers', 'Coordination', 'Balance', 'Technique', 'Reading', 'Commitment'];
                attributes.forEach(attr => {
                    const attrId = attr.toLowerCase().replace(/\./g, '');
                    payload[attrId] = formData.get(attrId);
                });

                try {
                    const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors', // Required for Google Apps Script
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });

                    // For no-cors, response.ok will always be true, and status will be 0.
                    // You'll need to rely on the Apps Script to confirm success/failure
                    // via other means (e.g., checking the spreadsheet).
                    console.log('Attribute rating submitted.', response);

                } catch (error) {
                    console.error('Error submitting rating:', error);
                } finally {
                    submitRatingBtn.disabled = false;
                    submitRatingBtn.textContent = 'Submit';
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
            });
        }

        // Update slider value displays
        const attributes = ['Power', 'Fingers', 'Coordination', 'Balance', 'Technique', 'Reading', 'Commitment'];
        attributes.forEach(attr => {
            const attrId = attr.toLowerCase().replace(/\./g, '');
            const slider = container.querySelector(`#${attrId}-slider`);
            const valueSpan = container.querySelector(`#${attrId}-value`);
            if (slider && valueSpan) {
                slider.addEventListener('input', () => {
                    valueSpan.textContent = slider.value;
                });
            }
        });
    }

    // Render the Chart.js radar chart
    const ctx = container.querySelector('#climberAttributesChart');
    const chartArea = container.querySelector('#climber-attributes-chart-area');

    if (ctx && chartArea) {
        const attributes = ['Power', 'Fingers', 'Coordination', 'Balance', 'Technique', 'Reading', 'Commitment'];
        const climberRatings = appData.climberAttributesRatings.filter(r => r.climber_name === climberName);

        if (climberRatings.length >= 5) {
            const averagedData = {};
            attributes.forEach(attr => {
                const attrKey = attr.toLowerCase();
                const sum = climberRatings.reduce((acc, curr) => acc + parseInt(curr[attrKey] || 0), 0);
                averagedData[attrKey] = sum / climberRatings.length;
            });

            const labels = ['Power', 'Fingers', 'Coord.', 'Balance', 'Tech.', 'Reading', 'Commit.'];
            const chartData = attributes.map(attr => averagedData[attr.toLowerCase()]);

            const backgroundColors = [
                'rgba(30, 64, 175, 1)',   // for value 2 (innermost), fully opaque
                'rgba(30, 64, 175, 0.6)',   // for value 4
                'rgba(30, 64, 175, 0.4)',   // for value 6
                'rgba(30, 64, 175, 0.15)',   // for value 8
                'rgba(30, 64, 175, 0.07)'    // for value 10 (outermost), more transparent
            ];

            const datasets = [];

            // Add background layers (from innermost to outermost for correct layering)
            for (let i = 1; i <= 5; i++) { // i goes from 1 (value 2) up to 5 (value 10)
                const value = i * 2;
                datasets.push({
                    label: `Level ${value}`,
                    data: Array(labels.length).fill(value),
                    backgroundColor: backgroundColors[i - 1],
                    borderColor: 'transparent',
                    pointBackgroundColor: 'transparent',
                    pointBorderColor: 'transparent',
                    fill: true,
                    borderWidth: 0,
                    pointRadius: 0,
                    hoverBorderWidth: 0,
                    hoverBackgroundColor: backgroundColors[i - 1],
                    hoverBorderColor: 'transparent',
                    order: i // Assign order for layering: 1 for innermost (value 2), 5 for outermost (value 10)
                });
            }

            // Add the actual climber data layer
            datasets.push({
                label: 'Climbing Attributes',
                data: chartData,
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue-500 with transparency
                borderColor: 'rgba(59, 130, 246, 1)',
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
                fill: false,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                order: 0 // Ensure this layer is on top of all background layers
            });

            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false, // Disable animation
                    scales: {
                        r: {
                            angleLines: { color: 'transparent' },
                            grid: { color: 'transparent' },
                            pointLabels: { color: '#cbd5e1', font: { size: 12 } }, // slate-300
                            min: 0,
                            max: 10,
                            beginAtZero: true,
                            ticks: {
                                display: false, // Hide numerical labels
                                stepSize: 2,
                                color: '#cbd5e1', // slate-300
                                backdropColor: 'transparent',
                                showLabelBackdrop: false
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    }
                }
            });
        } else {
            // Clear the canvas and display a message within the chart area
            ctx.remove(); // Remove the canvas element
            chartArea.innerHTML = '<div class="p-4 text-left text-gray-400">The Attributes chart requires a minimum of 5 rating submissions to be displayed. Be one of the first to contribute and help build a comprehensive profile for this climber!</div>';
        }
    }
}

function renderClimberProfile_StatsTab(container, climberName, appData) {
    const climberStats = appData.climberStats.find(s => s.climber === climberName);

    let statsHTML = '<div class="space-y-4">';

    if (climberStats) {
        const totalBoulders = parseInt(climberStats.all_time_b || '0');
        const totalFlashes = parseInt(climberStats.all_time_f || '0');
        const totalTops = parseInt(climberStats.all_time_t || '0');
        const totalZones = parseInt(climberStats.all_time_z || '0');
        const totalNothings = totalBoulders - totalZones;

        const gradeColors = {
            1: '#4ade80', // green-400
            2: '#60a5fa', // blue-400
            3: '#facc15', // yellow-400
            4: '#fb923c', // orange-400
            5: '#f87171', // red-400
            6: '#c084fc', // purple-400
        };

        statsHTML += `
            <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4">
                <h3 class="text-lg font-bold text-gray-200 mb-3">All-Time Stats</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Qualis</div><div class="font-bold text-xl text-gray-100">${climberStats.all_time_q || '0'}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Boulders</div><div class="font-bold text-xl text-gray-100">${totalBoulders}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Flashes</div><div class="font-bold text-xl text-gray-100">${totalFlashes}${totalBoulders > 0 ? `/${formatPercentage(totalFlashes, totalBoulders)}` : ''}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Tops</div><div class="font-bold text-xl text-gray-100">${totalTops}${totalBoulders > 0 ? `/${formatPercentage(totalTops, totalBoulders)}` : ''}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Zones</div><div class="font-bold text-xl text-gray-100">${totalZones}${totalBoulders > 0 ? `/${formatPercentage(totalZones, totalBoulders)}` : ''}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Nothing</div><div class="font-bold text-xl text-gray-100">${totalNothings}${totalBoulders > 0 ? `/${formatPercentage(totalNothings, totalBoulders)}` : ''}</div></div>
                </div>
            </div>`;

        statsHTML += `<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">`;
        statsHTML += createGradeStatBox(1, climberStats, gradeColors[1]);
        statsHTML += createGradeStatBox(2, climberStats, gradeColors[2]);
        statsHTML += createGradeStatBox(3, climberStats, gradeColors[3]);
        statsHTML += createGradeStatBox(4, climberStats, gradeColors[4]);
        statsHTML += createGradeStatBox(5, climberStats, gradeColors[5]);
        statsHTML += createGradeStatBox(6, climberStats, gradeColors[6]);
        statsHTML += `</div>`;
    } else {
        statsHTML += `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No stats information available for this climber.</div>`;
    }
    
    statsHTML += '</div>';
    container.innerHTML = statsHTML;
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

    const compDateMap = new Map(appData.comps.map(c => [c.comp, new Date(c.start)]));

    const climberComps = [...new Set(climberData.map(d => d.comp))].sort((a, b) => {
        const dateA = compDateMap.get(a) || 0;
        const dateB = compDateMap.get(b) || 0;
        return dateA - dateB;
    });

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
        .sort((a, b) => {
            const dateA = compDateMap.get(a.comp) || 0;
            const dateB = compDateMap.get(b.comp) || 0;
            return dateA - dateB;
        });
    if (qualiPlacements.length > 0) {
            createPlacementChart('qualiPlacementChart', qualiPlacements, '#38bdf8');
    }

    const finalPlacements = appData.fRankings
        .filter(s => s.climber === climberName)
        .sort((a, b) => {
            const compA = (a.final || '').replace(/F$/, '');
            const compB = (b.final || '').replace(/F$/, '');
            const dateA = compDateMap.get(compA) || 0;
            const dateB = compDateMap.get(compB) || 0;
            return dateA - dateB;
        });
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
        historyHTML += `<div data-comp="${compName}" class="history-comp-box bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-800 transition duration-200">
            <h3 class="font-bold text-lg text-left text-gray-100 mb-2">${compName}</h3>
            <div class="space-y-1 text-gray-200">`;
        data.results.forEach(resultText => {
            historyHTML += `<p>${resultText}</p>`;
        });
        historyHTML += `</div></div>`;
    });
    historyHTML += '</div>';
    container.innerHTML = historyHTML;

    container.querySelectorAll('.history-comp-box').forEach(box => {
        box.addEventListener('click', (e) => {
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
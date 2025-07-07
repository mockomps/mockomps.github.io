
let currentComp = null;
let currentRound = 'qualis';

function renderResultsTable(headerContent, mainContent, controlsContainer, appData, Maps, pageContext) {
    const resultsContainer = mainContent.querySelector('#results-container');
    let compStandings = [];
    let isOverallQualis = currentRound === 'qualis';
    let isFinals = currentRound === 'finals';
    let isIndividualQuali = !isOverallQualis && !isFinals;

    if (isFinals) {
        compStandings = appData.fRankings.filter(s => (s.final || '').replace(/F$/, '') === currentComp);
    } else if (isOverallQualis) {
        compStandings = appData.qStandings.filter(s => s.comp === currentComp);
    } else {
        compStandings = appData.qRankings.filter(s => s.quali === currentRound);
    }
    
    if (isFinals) {
        compStandings.sort((a,b) => parseInt(a.place) - parseInt(b.place));
    } else {
        compStandings.sort((a, b) => parseFloat(b.quali_points) - parseFloat(a.quali_points));
        
        let lastScore = -1;
        let currentRank = 0;
        compStandings.forEach((s, i) => {
            const score = parseFloat(s.quali_points);
            if(score !== lastScore) {
                currentRank = i + 1;
                lastScore = score;
            }
            s.place = currentRank;
        });
    }


    if (compStandings.length === 0) {
        resultsContainer.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No results available for this round.</div>`;
        return;
    }
    
    const headers = isFinals
        ? ['Place', 'Climber', 'Tops', 'Top Attempts', 'Zones', 'Zone Attempts']
        : ['Place', 'Climber', 'Quali Points', 'Flashes', 'Tops', 'Zones'];

    let mobileHTML = '<div class="md:hidden space-y-2">';
    let desktopHTML = `<div class="hidden md:block bg-gray-900 border border-gray-800 p-4 sm:p-6 rounded-lg shadow-md"><table class="w-full border-collapse"><thead><tr class="border-b border-gray-800">${headers.map(h => `<th class="p-3 font-semibold text-sm text-left text-gray-400">${h}</th>`).join('')}</tr></thead><tbody>`;
    
    for (const standing of compStandings) {
        const isQualisTop8 = !isFinals && parseInt(standing.place) <= 8;
        const isFinalsTop3 = isFinals && parseInt(standing.place) <= 3;
        let highlightClass = isQualisTop8 || isFinalsTop3 ? 'bg-sky-900/40' : '';
        
        const climberName = standing.climber || '-';
        const climberButton = `<button data-climber-name="${climberName}" class="profile-link-btn text-left hover:text-blue-400 transition-colors duration-150">${climberName}</button>`;

        let qualiPointsHTML;
        if (isIndividualQuali) {
            qualiPointsHTML = `<button data-climber-name="${climberName}" data-quali-name="${currentRound}" class="quali-detail-link font-bold text-blue-400 hover:text-blue-300">${standing.quali_points || '-'}</button>`;
        } else if (isOverallQualis) {
            qualiPointsHTML = `<button data-climber-name="${climberName}" data-comp-name="${currentComp}" class="quali-comp-detail-link font-bold text-blue-400 hover:text-blue-300">${standing.quali_points || '-'}</button>`;
        } else {
            qualiPointsHTML = `<span class="font-bold text-blue-400">${standing.quali_points || '-'}</span>`;
        }


        const qualiStatsHTML = `<div class="flex justify-between items-center text-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700"><div>Tops <span class="block font-medium text-gray-200 text-sm">${standing.tops || '-'}</span></div><div>Zones <span class="block font-medium text-gray-200 text-sm">${standing.zones || '-'}</span></div><div>Flashes <span class="block font-medium text-gray-200 text-sm">${standing.flashes || '-'}</span></div></div>`;
        
        let finalTotalScoreHTML = '';
        let finalBoulderScoresHTML = '';

        if (isFinals) {
            const tops = standing.tops || '0';
            const topAttempts = standing.top_attempts || '0';
            const zones = standing.zones || '0';
            const zoneAttempts = standing.zone_attempts || '0';
            finalTotalScoreHTML = `<div class="text-sm text-gray-200 font-semibold">T${tops}(${topAttempts}) Z${zones}(${zoneAttempts})</div>`;

            const finalId = currentComp + 'F';
            const climberFinalResults = appData.fResults.filter(r => r.climber === climberName && r.final === finalId);

            const boulders = ['A', 'B', 'C', 'D'];
            const boulderScoresHTML = boulders.map(b => {
                const boulderResult = climberFinalResults.find(r => r.boulder === b);
                const t = boulderResult ? (boulderResult.top_attempts || '0') : '0';
                const z = boulderResult ? (boulderResult.zone_attempts || '0') : '0';
                return `<span>${b} t${t}z${z}</span>`;
            }).join('');
            finalBoulderScoresHTML = `<div class="flex justify-between w-full text-xs text-gray-400 mt-1">${boulderScoresHTML}</div>`;
        }
        
        mobileHTML += `<div class="rounded-lg p-3 shadow-md border border-gray-800 ${highlightClass || 'bg-gray-900'}">
    <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
            <span class="font-bold text-base text-gray-200 w-6">${standing.place||'-'}</span>
            <span class="font-medium text-gray-100 text-sm">${climberButton}</span>
        </div>
        ${isFinals ? finalTotalScoreHTML : `<div class="text-base">${qualiPointsHTML}</div>`}
    </div>
    ${isFinals ? finalBoulderScoresHTML : qualiStatsHTML}
</div>`;
        
        const desktopRowContent = isFinals
            ? `<td class="p-3 text-left">${standing.tops||'-'}</td><td class="p-3 text-left">${standing.top_attempts||'-'}</td><td class="p-3 text-left">${standing.zones||'-'}</td><td class="p-3 text-left">${standing.zone_attempts||'-'}</td>`
            : `<td class="p-3 font-semibold text-blue-400 text-left">${qualiPointsHTML}</td><td class="p-3 text-left">${standing.flashes||'-'}</td><td class="p-3 text-left">${standing.tops||'-'}</td><td class="p-3 text-left">${standing.zones||'-'}</td>`;

        desktopHTML += `<tr class="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 ${highlightClass}"><td class="p-3 font-bold text-gray-100">${standing.place||'-'}</td><td class="p-3 font-medium text-gray-200">${climberButton}</td>${desktopRowContent}</tr>`;
    }

    mobileHTML += '</div>';
    desktopHTML += '</tbody></table></div>';
    resultsContainer.innerHTML = mobileHTML + desktopHTML;
    
    resultsContainer.querySelectorAll('.profile-link-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const climberName = e.currentTarget.dataset.climberName;
            Maps.navigate('climberProfile', {
                climberName: climberName,
                from: { page: 'resultsComp', context: pageContext }
            });
        });
    });
    
    resultsContainer.querySelectorAll('.quali-detail-link').forEach(btn => {
        btn.addEventListener('click', e => {
            const { climberName, qualiName } = e.currentTarget.dataset;
            Maps.navigate('qualiResultDetail', {
                climberName,
                qualiName,
                from: { page: 'resultsComp', context: pageContext }
            });
        });
    });

    resultsContainer.querySelectorAll('.quali-comp-detail-link').forEach(btn => {
        btn.addEventListener('click', e => {
            const { climberName, compName } = e.currentTarget.dataset;
            Maps.navigate('qualiCompResultDetail', {
                climberName,
                compName,
                from: { page: 'resultsComp', context: pageContext }
            });
        });
    });
}

export function renderResultsCompPage(headerContent, mainContent, controlsContainer, appData, Maps, context) {
    const pageContext = context;
    currentComp = pageContext.comp;
    currentRound = pageContext.round || 'qualis';
    const from = pageContext.from || { page: 'resultsHome' };

    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-to-comps-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">${currentComp}</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-to-comps-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => Maps.navigate('home'));
    
    const individualQualiRounds = [...new Set(appData.qRankings
        .filter(r => r.quali && r.quali.startsWith(currentComp))
        .map(r => r.quali)
    )].sort();

    let roundButtonsHTML = '';
    individualQualiRounds.forEach(roundName => {
        const shortName = roundName.replace(currentComp, '');
        roundButtonsHTML += `<button data-round="${roundName}" class="round-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">${shortName}</button>`;
    });
    
    roundButtonsHTML += `<button data-round="qualis" class="round-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">Qualis</button>`;
    roundButtonsHTML += `<button data-round="finals" class="round-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">Final</button>`;
    
    controlsContainer.classList.remove('hidden');
     controlsContainer.innerHTML = `<div class="flex justify-center">
            <div id="round-selector" class="inline-flex bg-gray-800 p-1 rounded-md gap-1 overflow-x-auto no-scrollbar h-scroll">
                    ${roundButtonsHTML}
            </div>
       </div>`;

    mainContent.innerHTML = `<div id="results-container" class="w-full"></div>`;
    
    function setActiveRoundButton() {
        controlsContainer.querySelectorAll('.round-btn').forEach(btn => {
            const isSelected = btn.dataset.round === currentRound;
            btn.classList.toggle('bg-blue-600', isSelected);
            btn.classList.toggle('text-white', isSelected);
            btn.classList.toggle('shadow-md', isSelected);
            btn.classList.toggle('text-gray-300', !isSelected);
        });
    }
    
    setActiveRoundButton();
    renderResultsTable(headerContent, mainContent, controlsContainer, appData, Maps, pageContext);

    controlsContainer.querySelector('#round-selector').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.round !== currentRound) {
            currentRound = e.target.dataset.round;
            pageContext.round = currentRound;
            // Replace state when changing tabs/rounds within the same competition view
            history.replaceState({ page: 'resultsComp', context: pageContext }, '', window.location.hash);
            setActiveRoundButton();
            renderResultsTable(headerContent, mainContent, controlsContainer, appData, Maps, pageContext);
       }
    });
}

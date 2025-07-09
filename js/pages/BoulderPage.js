function getResultStyling(result) {
    switch(result) {
        case 'Flash': return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
        case 'Top': return 'bg-green-500/10 border-green-500 text-green-400';
        case 'Zone': return 'bg-blue-500/10 border-blue-500 text-blue-400';
        default: return 'bg-gray-700/20 border-gray-700 text-gray-400';
    }
}

export function renderBoulderPage(headerContent, mainContent, appData, navigate, context) {
    const { qualiName, boulderName } = context;

    const boulderDetails = appData.qBoulders.find(b => b.quali === qualiName && b.name === boulderName);

    if (!boulderDetails) {
        headerContent.innerHTML = `
            <div class="flex-1">
                <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
            </div>
            <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Error</h1>
            <div class="flex-1 text-right">
                <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
            </div>`;
        headerContent.querySelector('#back-btn').addEventListener('click', () => history.back());
        headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));
        mainContent.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">Boulder details not found for ${boulderName} in ${qualiName}.</div>`;
        return;
    }

    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <div class="flex-1 text-center">
            <h1 class="text-2xl font-bold text-gray-100">${qualiName}</h1>
            <h2 class="text-sm font-medium text-gray-400 mt-1 whitespace-nowrap">Boulder ${boulderName}</h2>
        </div>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const boulderResults = appData.qResults.filter(r => r.quali === qualiName && r[boulderName.toLowerCase()]);

    const totalAttempts = boulderResults.length;
    const totalFlashes = boulderResults.filter(r => r[boulderName.toLowerCase()] === 'Flash').length;
    const totalTops = boulderResults.filter(r => r[boulderName.toLowerCase()] === 'Top' || r[boulderName.toLowerCase()] === 'Flash').length;
    const totalZones = boulderResults.filter(r => r[boulderName.toLowerCase()] === 'Zone' || r[boulderName.toLowerCase()] === 'Top' || r[boulderName.toLowerCase()] === 'Flash').length;

    const climberResultsForBoulder = appData.qResults.filter(r => r.quali === qualiName && r[boulderName.toLowerCase()]);

    climberResultsForBoulder.sort((a, b) => a.climber.localeCompare(b.climber));

    let climberListHTML = '';
    if (climberResultsForBoulder.length > 0) {
        climberListHTML = `
            <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4 space-y-3 mt-4">
                <h3 class="text-lg font-bold text-gray-200 mb-3">Results</h3>
                <div class="space-y-3">
                    ${climberResultsForBoulder.map(climberResult => {
                        const result = climberResult[boulderName.toLowerCase()];
                        return `
                            <div class="bg-gray-800/50 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between space-x-4">
                                <div class="flex items-center space-x-4">
                                    <button data-climber-name="${climberResult.climber}" class="profile-link-btn text-left font-semibold text-gray-200 hover:text-blue-400 transition-colors duration-150">${climberResult.climber}</button>
                                </div>
                                <div class="text-right">
                                    <span class="font-bold text-sm px-3 py-1 rounded-full border ${getResultStyling(result)}">${result}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    mainContent.innerHTML = `
        <div class="space-y-4">
            <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4 space-y-4">
                <div class="grid grid-cols-2 gap-4 mb-3">
                    <h2 class="text-xl font-bold text-gray-100">Boulder ${boulderDetails.name}</h2>
                    ${boulderDetails.a ? `<div class="bg-gray-800/50 p-2 rounded-md text-center"><div class="text-xs text-gray-400">Area</div><div class="font-bold text-xl text-gray-100">${boulderDetails.a}</div></div>` : ''}
                </div>
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Grade</div><div class="font-bold text-xl text-gray-100">${boulderDetails.grade}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Color</div><div class="font-bold text-xl text-gray-100">${boulderDetails.color}</div></div>
                </div>
                <div class="grid grid-cols-2 gap-4 text-center">
                    ${boulderDetails.wall ? `<div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Wall</div><div class="font-bold text-xl text-gray-100">${boulderDetails.wall}</div></div>` : ''}
                    ${boulderDetails.style ? `<div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Style</div><div class="font-bold text-xl text-gray-100">${boulderDetails.style}</div></div>` : ''}
                </div>
            </div>

            <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4 space-y-4">
                <h3 class="text-lg font-bold text-gray-200 mb-3">Stats</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Climbers</div><div class="font-bold text-xl text-gray-100">${totalAttempts}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Flashes</div><div class="font-bold text-xl text-gray-100">${totalFlashes}${totalAttempts > 0 ? `/${Math.round((totalFlashes / totalAttempts) * 100)}%` : ''}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Tops</div><div class="font-bold text-xl text-gray-100">${totalTops}${totalAttempts > 0 ? `/${Math.round((totalTops / totalAttempts) * 100)}%` : ''}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Zones</div><div class="font-bold text-xl text-gray-100">${totalZones}${totalAttempts > 0 ? `/${Math.round((totalZones / totalAttempts) * 100)}%` : ''}</div></div>
                </div>
            </div>
            ${climberListHTML}
        </div>
    `;

    mainContent.querySelectorAll('.profile-link-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const climberName = e.currentTarget.dataset.climberName;
            navigate('climberProfile', {
                climberName: climberName,
                from: { page: 'boulderPage', context: context }
            });
        });
    });
}
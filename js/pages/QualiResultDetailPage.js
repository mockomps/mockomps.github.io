function getResultStyling(result) {
    switch(result) {
        case 'Flash': return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
        case 'Top': return 'bg-green-500/10 border-green-500 text-green-400';
        case 'Zone': return 'bg-blue-500/10 border-blue-500 text-blue-400';
        default: return 'bg-gray-700/20 border-gray-700 text-gray-400';
    }
}

export function renderQualiResultDetailPage(headerContent, mainContent, appData, navigate, context) {
    const { climberName, qualiName, from } = context;

    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <div class="flex-1 text-center">
            <h1 class="text-2xl font-bold text-gray-100">${climberName}</h1>
            <h2 class="text-sm font-medium text-gray-400 mt-1 whitespace-nowrap">${qualiName}</h2>
        </div>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const qualiBoulders = appData.qBoulders.filter(b => b.quali === qualiName);
    const climberResults = appData.qResults.find(r => r.climber === climberName && r.quali === qualiName);

    if (!climberResults || qualiBoulders.length === 0) {
        mainContent.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No detailed results available for this climber in this round.</div>`;
        return;
    }

    let resultsHTML = '<div class="space-y-3">';
    qualiBoulders.forEach(boulder => {
        const result = climberResults[boulder.name.toLowerCase()] || 'Nothing';
        const grade = boulder.grade || '';
        const room = boulder.a || '';
        const wall = boulder.wall || '';
        const style = boulder.style || '';

        resultsHTML += `
            <div class="bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between space-x-4">
                <div class="flex items-center space-x-4">
                    <div class="font-bold text-xl text-gray-200 w-8 text-center">${boulder.name}</div>
                    <div>
                        <p class="font-semibold text-gray-200">${grade} ${boulder.color} ${room}</p>
                        ${(wall || style) ? `<div class="flex items-center space-x-2 mt-1.5">${wall ? `<span class="bg-gray-700/50 border border-gray-600/80 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">${wall}</span>` : ''}${style ? `<span class="bg-gray-700/50 border border-gray-600/80 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">${style}</span>` : ''}</div>` : ''}
                    </div>
                </div>
                <div class="text-right">
                    <span class="font-bold text-sm px-3 py-1 rounded-full border ${getResultStyling(result)}">${result}</span>
                </div>
            </div>
        `;
    });
    resultsHTML += '</div>';

    mainContent.innerHTML = resultsHTML;
}

export function renderQualiCompResultDetailPage(headerContent, mainContent, appData, navigate, context) {
    const { climberName, compName, from } = context;

    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <div class="flex-1 text-center">
            <h1 class="text-2xl font-bold text-gray-100">${climberName}</h1>
            <h2 class="text-sm font-medium text-gray-400 mt-1 whitespace-nowrap">${compName} Qualis</h2>
        </div>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const individualQualiRounds = [...new Set(appData.qRankings
        .filter(r => r.quali && r.quali.startsWith(compName))
        .map(r => r.quali)
    )].sort();

    if (individualQualiRounds.length === 0) {
         mainContent.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No qualification rounds found for this competition.</div>`;
        return;
    }

    let finalHTML = '<div class="space-y-8">';

    individualQualiRounds.forEach(qualiName => {
        const climberRanking = appData.qRankings.find(r => r.climber === climberName && r.quali === qualiName);
        const qualiPoints = climberRanking ? climberRanking.quali_points : '-';
        const roundTitle = qualiName.replace(compName, '');

        finalHTML += `<div><div class="flex justify-between items-center border-b border-gray-700 pb-2 mb-3"><h3 class="text-xl font-bold text-gray-200">${roundTitle}</h3><span class="font-bold text-blue-400">${qualiPoints}</span></div>`;
        
        const qualiBoulders = appData.qBoulders.filter(b => b.quali === qualiName);
        const climberResults = appData.qResults.find(r => r.climber === climberName && r.quali === qualiName);
        
        if (climberResults && qualiBoulders.length > 0) {
            let resultsHTML = '<div class="space-y-3">';
             qualiBoulders.forEach(boulder => {
                const result = climberResults[boulder.name.toLowerCase()] || 'Nothing';
                const grade = boulder.grade || '';
                const room = boulder.a || '';
                const wall = boulder.wall || '';
                const style = boulder.style || '';

                resultsHTML += `
                    <div class="bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between space-x-4">
                        <div class="flex items-center space-x-4">
                            <div class="font-bold text-xl text-gray-200 w-8 text-center">${boulder.name}</div>
                            <div>
                                <p class="font-semibold text-gray-200">${grade} ${boulder.color} ${room}</p>
                                ${(wall || style) ? `<div class="flex items-center space-x-2 mt-1.5">${wall ? `<span class="bg-gray-700/50 border border-gray-600/80 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">${wall}</span>` : ''}${style ? `<span class="bg-gray-700/50 border border-gray-600/80 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">${style}</span>` : ''}</div>` : ''}
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-sm px-3 py-1 rounded-full border ${getResultStyling(result)}">${result}</span>
                        </div>
                    </div>
                `;
            });
            resultsHTML += '</div>';
            finalHTML += resultsHTML;
        } else {
            finalHTML += `<div class="bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg shadow-sm text-center text-gray-400">No results found for this round.</div>`;
        }
        finalHTML += `</div>`;
    });

    finalHTML += '</div>';
    mainContent.innerHTML = finalHTML;
}
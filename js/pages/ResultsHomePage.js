
export function renderResultsHomePage(headerContent, mainContent, appData, navigate) {
    headerContent.innerHTML = `
        <div class="flex-1">
               <button id="home-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Results</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#home-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const qComps = appData.qStandings.map(s => s.comp);
    const fComps = appData.fRankings.map(s => (s.final || '').replace(/F$/, ''));
    const compDateMap = new Map(appData.comps.map(c => [c.comp, c.start]));
    const allCompNames = [...new Set([...qComps, ...fComps])].sort((a, b) => new Date(compDateMap.get(b) || 0) - new Date(compDateMap.get(a) || 0));

    let compGridHTML = '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">';
    allCompNames.forEach(compName => {
        compGridHTML += `<button data-comp="${compName}" class="comp-btn bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-xl">${compName}</button>`;
    });
    compGridHTML += '</div>';
    mainContent.innerHTML = compGridHTML;

    mainContent.querySelectorAll('.comp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => navigate('resultsComp', { comp: e.target.dataset.comp, from: { page: 'resultsHome' } }));
    });
}

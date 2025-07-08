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
            <h2 class="text-sm font-medium text-gray-400 mt-1 whitespace-nowrap">${boulderName} Details</h2>
        </div>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const boulderResults = appData.qResults.filter(r => r.quali === qualiName && r[boulderName.toLowerCase()]);

    const totalAttempts = boulderResults.length;
    const totalFlashes = boulderResults.filter(r => r[boulderName.toLowerCase()] === 'Flash').length;
    const totalTops = boulderResults.filter(r => r[boulderName.toLowerCase()] === 'Top').length;
    const totalZones = boulderResults.filter(r => r[boulderName.toLowerCase()] === 'Zone').length;

    mainContent.innerHTML = `
        <div class="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-4 space-y-4">
            <h2 class="text-xl font-bold text-gray-100 mb-3">${boulderDetails.name} - ${boulderDetails.grade} ${boulderDetails.color}</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Wall</div><div class="font-bold text-xl text-gray-100">${boulderDetails.wall}</div></div>
                <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Style</div><div class="font-bold text-xl text-gray-100">${boulderDetails.style}</div></div>
                <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Room</div><div class="font-bold text-xl text-gray-100">${boulderDetails.a}</div></div>
            </div>

            <div class="border-t border-gray-700 pt-4 mt-4">
                <h3 class="text-lg font-bold text-gray-200 mb-3">Performance Stats</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Attempted</div><div class="font-bold text-xl text-gray-100">${totalAttempts}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Flashes</div><div class="font-bold text-xl text-gray-100">${totalFlashes}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Tops</div><div class="font-bold text-xl text-gray-100">${totalTops}</div></div>
                    <div class="bg-gray-800/50 p-2 rounded-md"><div class="text-xs text-gray-400">Zones</div><div class="font-bold text-xl text-gray-100">${totalZones}</div></div>
                </div>
            </div>
        </div>
    `;
}
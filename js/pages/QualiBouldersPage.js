export function renderQualiBouldersPage(headerContent, mainContent, appData, navigate, context) {
    const { qualiName } = context;

    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <div class="flex-1 text-center">
            <h1 class="text-2xl font-bold text-gray-100">${qualiName}</h1>
            <h2 class="text-sm font-medium text-gray-400 mt-1 whitespace-nowrap">Boulders</h2>
        </div>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const boulders = appData.qBoulders.filter(boulder => boulder.quali === qualiName);

    if (boulders.length === 0) {
        mainContent.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No boulders found for ${qualiName}.</div>`;
        return;
    }

    let bouldersHTML = '<div class="space-y-3">';
    boulders.forEach(boulder => {
        const grade = boulder.grade || '';
        const room = boulder.a || '';
        const wall = boulder.wall || '';
        const style = boulder.style || '';

        const boulderNameLower = boulder.name.toLowerCase();
        const climbersSubmitted = appData.qResults.filter(result => 
            result.quali === qualiName && 
            result[boulderNameLower]
        ).length;

        bouldersHTML += `
            <div data-boulder-name="${boulder.name}" class="boulder-button bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between space-x-4 cursor-pointer hover:bg-gray-800 transition-colors duration-150">
                <div class="flex items-center space-x-4">
                    <div class="font-bold text-xl text-gray-200 w-8 text-center">${boulder.name}</div>
                    <div>
                        <p class="font-semibold text-gray-200">${grade} ${boulder.color} ${room}</p>
                        ${(wall || style) ? `<div class="flex items-center space-x-2 mt-1.5">${wall ? `<span class="bg-gray-700/50 border border-gray-600/80 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">${wall}</span>` : ''}${style ? `<span class="bg-gray-700/50 border border-gray-600/80 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">${style}</span>` : ''}</div>` : ''}
                    </div>
                </div>
                <div class="text-right">
                    <span class="font-bold text-sm px-3 py-1 rounded-full border border-gray-700 bg-gray-700/20 text-gray-400">${climbersSubmitted} Climbers</span>
                </div>
            </div>
        `;
    });
    bouldersHTML += '</div>';
    mainContent.innerHTML = bouldersHTML;

    mainContent.querySelectorAll('.boulder-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const boulderName = e.currentTarget.dataset.boulderName;
            navigate('boulderPage', { qualiName: qualiName, boulderName: boulderName });
        });
    });
}
export function renderRoutesettingPage(headerContent, mainContent, appData, navigate) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Routesetting</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const qualis = appData.qualis.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

    let qualisButtonsHTML = '';
    const qualisWithBoulders = qualis.filter(quali => appData.qBoulders.filter(b => b.quali === quali.quali).length > 0);

    if (qualisWithBoulders.length > 0) {
        qualisButtonsHTML = `<div class="grid grid-cols-2 gap-4 text-center">`;
        qualisWithBoulders.forEach(quali => {
            const bouldersCount = appData.qBoulders.filter(b => b.quali === quali.quali).length;
            const formattedDate = new Date(quali.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            qualisButtonsHTML += `
                <button data-quali-name="${quali.quali}" class="quali-button bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-lg md:text-xl flex flex-col items-center justify-center space-y-1">
                    <span class="text-sm text-gray-400 font-normal">${formattedDate}</span>
                    <span class="text-xl font-bold">${quali.quali}</span>
                    <span class="text-sm text-gray-400 font-normal">
                        ${bouldersCount} Boulders
                    </span>
                </button>
            `;
        });
        qualisButtonsHTML += `</div>`;
    } else {
        qualisButtonsHTML = `<div class="text-center text-gray-400">No quali rounds with boulders found.</div>`;
    }

    mainContent.innerHTML = qualisButtonsHTML;

    mainContent.querySelectorAll('.quali-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const qualiName = e.currentTarget.dataset.qualiName;
            navigate('qualiBouldersPage', { qualiName: qualiName }); // Navigate to the new page
        });
    });
}
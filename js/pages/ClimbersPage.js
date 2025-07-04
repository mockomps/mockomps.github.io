
export function renderClimbersPage(headerContent, mainContent, appData, navigate) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="home-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Climbers</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#home-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    mainContent.innerHTML = `
        <div class="mb-4">
            <input type="text" id="climber-search" placeholder="Search for a climber..." class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-gray-700">
        </div>
        <div id="climber-list-container" class="space-y-2"></div>
    `;

    const climbers = [...appData.climbers].sort((a, b) => a.name.localeCompare(b.name));
    const listContainer = mainContent.querySelector('#climber-list-container');

    function renderClimberList(filteredClimbers) {
        listContainer.innerHTML = '';
        if (filteredClimbers.length === 0) {
            listContainer.innerHTML = `<p class="text-gray-400 text-center">No climbers found.</p>`;
            return;
        }

        let climberListHTML = '';
        filteredClimbers.forEach(climber => {
            if (climber.name) {
                climberListHTML += `<button data-climber-name="${climber.name}" class="climber-btn w-full text-left bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-sm text-gray-100 font-semibold hover:bg-gray-800 flex justify-between items-center">
                                                <span>${climber.name}</span>
                                                <i class="fas fa-chevron-right text-gray-500"></i>
                                            </button>`;
            }
        });
        listContainer.innerHTML = climberListHTML;

        listContainer.querySelectorAll('.climber-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const climberName = e.currentTarget.dataset.climberName;
                navigate('climberProfile', {
                    climberName: climberName,
                    from: { page: 'climbers' }
                });
            });
        });
    }

    renderClimberList(climbers);

    mainContent.querySelector('#climber-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = climbers.filter(climber => climber.name && climber.name.toLowerCase().includes(searchTerm));
        renderClimberList(filtered);
    });
}

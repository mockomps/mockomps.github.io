
export function renderManageFinalsPage(headerContent, mainContent, appData, getLondonTime, showConfirmationModal, GOOGLE_APP_SCRIPT_URL) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Manage Finals Roster</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const today = getLondonTime(); // Use London time
    today.setHours(0, 0, 0, 0);
    const upcomingFinals = appData.finals.filter(f => new Date(f.date) >= today);
    const finalOptions = upcomingFinals.map(f => `<option value="${f.final}">${f.final}</option>`).join('');

    mainContent.innerHTML = `
        <div class="max-w-xl mx-auto">
            <form id="manage-finals-form" class="space-y-6">
                <div>
                    <label for="final-select" class="block text-sm font-medium text-gray-300 mb-1">Select Upcoming Final</label>
                    <select id="final-select" name="final" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                        <option value="">-- Select a Final --</option>
                        ${finalOptions}
                    </select>
                </div>

                <div id="roster-management-container" class="hidden space-y-4">
                    <!-- Roster will be rendered here -->
                </div>
                
                <div id="form-feedback" class="text-center h-6"></div>
            </form>
        </div>
    `;

    const finalSelect = mainContent.querySelector('#final-select');
    const rosterContainer = mainContent.querySelector('#roster-management-container');
    const feedback = mainContent.querySelector('#form-feedback');
    let currentFinalists = [];

    finalSelect.addEventListener('change', () => {
        const selectedFinal = finalSelect.value;
        rosterContainer.innerHTML = '';
        if (!selectedFinal) return;

        // Update the URL hash to reflect the selected final, allowing direct linking or refresh persistence.
        // This replaces the current history entry to prevent an unnecessary back button press
        // just to deselect the final.
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = `#manageFinals-final=${selectedFinal}`;
        history.replaceState({ page: 'manageFinals', context: { final: selectedFinal } }, '', currentUrl.hash);

        let finalists = appData.fClimbers
            .filter(fc => fc.final === selectedFinal)
            .map(fc => fc.climber);
        
        if (finalists.length === 0) {
            const compName = selectedFinal.replace(/F$/, '');
            finalists = appData.qStandings
                .filter(s => s.comp === compName)
                .sort((a,b) => parseInt(a.place) - parseInt(b.place))
                .slice(0, 8)
                .map(s => s.climber);
        }
        currentFinalists = finalists;
        renderRosterUI();
    });

    function renderRosterUI() {
        let html = `<h3 class="text-lg font-semibold text-gray-200 pt-4 border-t border-gray-800">Current Finalists</h3>`;
        
        html += '<div id="finalists-list" class="space-y-2">';
        currentFinalists.forEach(climber => {
            html += `
                <div class="flex justify-between items-center bg-gray-800 p-2 rounded-lg">
                    <span class="text-gray-200">${climber}</span>
                    <button type="button" data-climber="${climber}" class="remove-climber-btn text-red-500 hover:text-red-400 text-2xl font-bold">&times;</button>
                </div>
            `;
        });
        html += `</div>`;

        const availableClimbers = appData.climbers
            .map(c => c.name)
            .filter(name => !currentFinalists.includes(name))
            .sort();
        
        let climberOptions = availableClimbers.map(c => `<option value="${c}">${c}</option>`).join('');

        html += `
            <div class="pt-4 border-t border-gray-800">
                 <label for="add-climber-select" class="block text-sm font-medium text-gray-300 mb-1">Add Climber</label>
                 <div class="flex gap-2">
                     <select id="add-climber-select" class="flex-grow bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3">
                         <option value="">-- Select a climber to add --</option>
                         ${climberOptions}
                     </select>
                     <button type="button" id="add-climber-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-lg">Add</button>
                 </div>
            </div>

            <div class="pt-4">
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg">Save Changes</button>
            </div>
        `;
        rosterContainer.innerHTML = html;
        rosterContainer.classList.remove('hidden');

        rosterContainer.querySelectorAll('.remove-climber-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const climberToRemove = e.target.dataset.climber;
                currentFinalists = currentFinalists.filter(c => c !== climberToRemove);
                renderRosterUI();
            });
        });

        rosterContainer.querySelector('#add-climber-btn').addEventListener('click', () => {
            const select = rosterContainer.querySelector('#add-climber-select');
            const climberToAdd = select.value;
            if (climberToAdd && !currentFinalists.includes(climberToAdd)) {
                currentFinalists.push(climberToAdd);
                currentFinalists.sort();
                renderRosterUI();
            }
        });
    }

    mainContent.querySelector('#manage-finals-form').addEventListener('submit', e => {
        e.preventDefault();

        showConfirmationModal('Confirm Changes', 'Are you sure you want to save this finals roster?', () => {
            feedback.innerHTML = '';

            const payload = {
                formType: 'manageFinalists',
                final: finalSelect.value,
                climbers: currentFinalists
            };

            const submitButton = e.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Saving...`;

            fetch(GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(() => {
                feedback.innerHTML = `<p class="text-green-400">Finalist roster for ${finalSelect.value} has been updated!</p>`;
            })
            .catch(err => {
                 console.error('Error!', err);
                feedback.innerHTML = `<p class="text-red-400">Error: Could not save roster. Check connection.</p>`;
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = `Save Changes`;
            });
        });
    });
}


export function renderHomePage(headerContent, mainContent, appData, getLondonTime, showPinModal, navigate) {
    headerContent.innerHTML = `<div class="flex-1"></div><div class="flex-1 text-center"><h1 class="text-2xl font-bold text-gray-100">Mockomps</h1></div><div class="flex-1 text-right"><button id="admin-btn" class="text-gray-600 hover:text-white"><i class="fas fa-cog text-xl"></i></button></div>`;
    
    headerContent.querySelector('#admin-btn').addEventListener('click', showPinModal);

    let mainHTML = `
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <button id="schedule-btn" class="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-lg md:text-xl flex items-center justify-center"><i class="fas fa-calendar-alt mr-2"></i>Calendar</button>
            <button id="rules-btn" class="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-lg md:text-xl flex items-center justify-center"><i class="fas fa-gavel mr-2"></i>Rules</button>
            <button id="climbers-btn" class="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-lg md:text-xl flex items-center justify-center"><i class="fas fa-users mr-2"></i>Climbers</button>
            <button id="leaderboards-btn" class="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-lg md:text-xl flex items-center justify-center"><i class="fas fa-trophy mr-2"></i>Leaderboards</button>
            <button id="results-btn" class="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-lg md:text-xl flex items-center justify-center"><i class="fas fa-poll mr-2"></i>Results</button>
            <button id="routesetting-btn" class="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-lg md:text-xl flex items-center justify-center"><i class="fas fa-screwdriver-wrench mr-2"></i>Routesetting</button>
            <button id="register-btn" class="col-span-2 sm:col-span-3 bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-lg md:text-xl flex items-center justify-center"><i class="fas fa-user-plus mr-2"></i>Sign Up</button>
        </div>`;
    
    mainContent.innerHTML = mainHTML;
    
    const today = getLondonTime(); // Use London time
    today.setHours(0, 0, 0, 0);

    const liveComps = appData.comps.filter(comp => {
        const startDate = new Date(comp.start);
        const endDate = new Date(comp.end);
        return today >= startDate && today <= endDate;
    });
    
    let callToActionHTML = '';
    if (liveComps.length > 0) {
        callToActionHTML += `
            <div class="mt-12">
                <h2 class="text-2xl font-bold text-center text-rose-400 mb-4">Live!</h2>
                <div class="flex justify-center gap-4 text-center">`;
        
        liveComps.forEach(comp => {
            callToActionHTML += `<button data-comp="${comp.comp}" class="live-comp-btn flex-1 bg-rose-500/10 border border-rose-400/30 p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-rose-500/20 transition-all duration-200 text-gray-100 font-bold text-xl">${comp.comp}</button>`;
        });

        callToActionHTML += `</div></div>`;
    }

    callToActionHTML += `
        <div class="mt-4 text-center">
            <button id="submit-results-btn" class="w-full md:w-auto bg-blue-800 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-xl">
                <i class="fas fa-clipboard-check mr-2"></i> Submit Results
            </button>
        </div>`;

    mainContent.innerHTML += callToActionHTML;

    mainContent.querySelector('#schedule-btn').addEventListener('click', () => navigate('schedule'));
    mainContent.querySelector('#results-btn').addEventListener('click', () => navigate('resultsHome'));
    mainContent.querySelector('#climbers-btn').addEventListener('click', () => navigate('climbers'));
    mainContent.querySelector('#leaderboards-btn').addEventListener('click', () => navigate('leaderboards'));
    mainContent.querySelector('#rules-btn').addEventListener('click', () => navigate('rules'));
    mainContent.querySelector('#routesetting-btn').addEventListener('click', () => navigate('routesetting'));
    mainContent.querySelector('#register-btn').addEventListener('click', () => navigate('register'));
    mainContent.querySelector('#submit-results-btn').addEventListener('click', () => navigate('submitResults'));
    
    mainContent.querySelectorAll('.live-comp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => navigate('resultsComp', { comp: e.target.dataset.comp, from: { page: 'home' } }));
    });
}

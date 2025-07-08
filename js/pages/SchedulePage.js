
export function renderSchedulePage(headerContent, mainContent, appData, navigate) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="home-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Calendar</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#home-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const events = [
        ...appData.qualis.map(q => ({ date: q.date, title: q.quali, type: 'Quali' })),
        ...appData.finals.map(f => ({ date: f.date, title: f.final, type: 'Final' })),
    ];
    events.sort((a,b) => new Date(b.date) - new Date(a.date));

    const qComps = appData.qStandings.map(s => s.comp);
    const fComps = appData.fRankings.map(s => (s.final || '').replace(/F$/, ''));
    const allResultCompNames = new Set([...qComps, ...fComps]);

    let scheduleHTML = '<div class="space-y-2">';
    let currentMonth = '';
    
    events.forEach(event => {
        const eventDate = new Date(event.date);
        const month = eventDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        if (month !== currentMonth) {
            currentMonth = month;
            scheduleHTML += `<h2 class="text-lg font-bold text-gray-300 mt-0 mb-1 border-b border-gray-700 pb-1">${month}</h2>`;
        }

        const compName = event.title.replace(/(Q\d*|F)$/, '');
        let titleHTML;

        if (allResultCompNames.has(compName)) {
            const round = event.type === 'Final' ? 'finals' : event.title;
            titleHTML = `<button data-comp="${compName}" data-round="${round}" class="schedule-comp-link text-left font-semibold text-sm text-gray-100 hover:text-blue-400">${event.title}</button>`;
        } else {
            titleHTML = `<p class="font-semibold text-sm text-gray-100">${event.title}</p>`;
        }

        scheduleHTML += `
            <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-sm flex items-center space-x-3">
                <div class="text-center w-14">
                    <div class="font-bold text-lg text-gray-200">${eventDate.getDate()}</div>
                    <div class="text-xs text-gray-400">${eventDate.toLocaleString('default', { weekday: 'short' })}</div>
                </div>
                <div>
                    ${titleHTML}
                    <p class="text-xs ${event.type === 'Final' ? 'text-cyan-400' : 'text-gray-400'}">${event.type}</p>
                </div>
            </div>`;
    });
    scheduleHTML += '</div>';
    mainContent.innerHTML = scheduleHTML;

    mainContent.querySelectorAll('.schedule-comp-link').forEach(btn => {
        btn.addEventListener('click', e => {
            const compName = e.currentTarget.dataset.comp;
            const roundName = e.currentTarget.dataset.round;
            navigate('resultsComp', { comp: compName, round: roundName, from: { page: 'schedule' } });
        });
    });
}

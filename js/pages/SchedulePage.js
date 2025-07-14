
export function renderSchedulePage(headerContent, mainContent, appData, navigate, getLondonTime) {
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

    const today = getLondonTime();
    today.setHours(0, 0, 0, 0);

    let currentCompName = null;
    // Find the current competition where today's date is between its start and end dates
    for (const comp of appData.comps) {
        const compStartDate = new Date(comp.start);
        const compEndDate = new Date(comp.end);
        compStartDate.setHours(0, 0, 0, 0);
        compEndDate.setHours(23, 59, 59, 999);

        if (today >= compStartDate && today <= compEndDate) {
            currentCompName = comp.comp;
            break;
        }
    }

    const filteredQualis = appData.qualis.filter(q => {
        const qualiDate = new Date(q.date);
        qualiDate.setHours(0, 0, 0, 0);
        const compName = q.quali.replace(/( Quali \d*|Q\d*)$/, '');
        return qualiDate <= today || compName === currentCompName;
    });

    const filteredFinals = appData.finals.filter(f => {
        const finalDate = new Date(f.date);
        finalDate.setHours(0, 0, 0, 0);
        const compName = f.final.replace(/F$/, '');
        return finalDate <= today || compName === currentCompName;
    });

    const events = [
        ...filteredQualis.map(q => ({ date: q.date, title: q.quali, type: 'Quali' })),
        ...filteredFinals.map(f => ({ date: f.date, title: f.final, type: 'Final' })),
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
            <div class="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-sm flex items-center justify-between space-x-3">
                <div class="flex items-center space-x-3">
                    <div class="text-center w-14">
                        <div class="font-bold text-lg text-gray-200">${eventDate.getDate()}</div>
                        <div class="text-xs text-gray-400">${eventDate.toLocaleString('default', { weekday: 'short' })}</div>
                    </div>
                    <div>
                        ${titleHTML}
                        <p class="text-xs ${event.type === 'Final' ? 'text-cyan-400' : 'text-gray-400'}">${event.type}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    ${event.type === 'Quali' ? `<button data-quali-name="${event.title}" class="routesetting-btn w-10 h-10 flex items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors duration-150"><i class="fas fa-screwdriver-wrench"></i></button>` : ''}
                    <button data-comp="${compName}" data-round="${event.type === 'Final' ? 'finals' : event.title}" class="results-btn w-10 h-10 flex items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors duration-150"><i class="fas fa-poll"></i></button>
                </div>
            </div>`;
    });
    scheduleHTML += '</div>';
    mainContent.innerHTML = scheduleHTML;

    mainContent.querySelectorAll('.routesetting-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const qualiName = e.currentTarget.dataset.qualiName;
            navigate('qualiBouldersPage', { qualiName: qualiName });
        });
    });

    mainContent.querySelectorAll('.results-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const compName = e.currentTarget.dataset.comp;
            const roundName = e.currentTarget.dataset.round;
            navigate('resultsComp', { comp: compName, round: roundName, from: { page: 'schedule' } });
        });
    });
}

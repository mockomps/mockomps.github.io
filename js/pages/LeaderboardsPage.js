
let currentLeaderboard = 'qualis';

function renderLeaderboardTable(container, appData, navigate, leaderboardType) {
    let data, headers, scoreKey;

    if (leaderboardType === 'qualis') {
        data = [...appData.qLeaderboard];
        headers = ['Circuit', 'Place', 'Climber', 'Quali Points', 'Tops', 'Zones', 'Flashes', 'Qualis'];
        scoreKey = 'quali_points';
        data.sort((a, b) => parseFloat(b[scoreKey]) - parseFloat(a[scoreKey]));
    } else {
        data = [...appData.cStandings];
        headers = ['Circuit', 'Place', 'Climber', 'Circuit Points', '1st', '2nd', '3rd', 'Finals', 'Flashes'];
        scoreKey = 'circuit_points';
        data.sort((a, b) => parseFloat(b[scoreKey]) - parseFloat(a[scoreKey]));
    }
    
    let lastScore = -1;
    let currentRank = 0;
    data.forEach((entry, i) => {
        const score = parseFloat(entry[scoreKey]);
        if(score !== lastScore) {
            currentRank = i + 1;
            lastScore = score;
        }
        entry.place = currentRank;
    });

    if (data.length === 0) {
        container.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No leaderboard data available.</div>`;
        return;
    }

    let mobileHTML = '<div class="md:hidden space-y-2">';
    let desktopHTML = `<div class="hidden md:block bg-gray-900 border border-gray-800 p-4 sm:p-6 rounded-lg shadow-md"><table class="w-full border-collapse"><thead><tr class="border-b border-gray-800">${headers.map(h => `<th class="p-3 font-semibold text-sm text-left text-gray-400">${h}</th>`).join('')}</tr></thead><tbody>`;

    for (const entry of data) {
        const climberName = entry.climber || '-';
        const climberButton = `<button data-climber-name="${climberName}" class="profile-link-btn text-left hover:text-blue-400 transition-colors duration-150">${climberName}</button>`;

        if (leaderboardType === 'qualis') {
            mobileHTML += `<div class="rounded-lg p-3 shadow-md border border-gray-800 bg-gray-900">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <span class="font-bold text-base text-gray-200 w-6">${entry.place}</span>
                        <span class="font-medium text-gray-100 text-sm">${climberButton}</span>
                    </div>
                    <div class="font-bold text-blue-400 text-base">${entry.quali_points}</div>
                </div>
                <div class="flex justify-between items-center text-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
                    <div>Tops <span class="block font-medium text-gray-200 text-sm">${entry.tops}</span></div>
                    <div>Zones <span class="block font-medium text-gray-200 text-sm">${entry.zones}</span></div>
                    <div>Flashes <span class="block font-medium text-gray-200 text-sm">${entry.flashes}</span></div>
                    <div>Qualis <span class="block font-medium text-gray-200 text-sm">${entry.number_of_qualis}</span></div>
                </div>
            </div>`;
            desktopHTML += `<tr class="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50">
                <td class="p-3">${entry.circuit}</td>
                <td class="p-3 font-bold text-gray-100">${entry.place}</td>
                <td class="p-3 font-medium text-gray-200">${climberButton}</td>
                <td class="p-3 font-semibold text-blue-400">${entry.quali_points}</td>
                <td class="p-3">${entry.tops}</td>
                <td class="p-3">${entry.zones}</td>
                <td class="p-3">${entry.flashes}</td>
                <td class="p-3">${entry.number_of_qualis}</td>
            </tr>`;
        } else { // Finals
            mobileHTML += `<div class="rounded-lg p-3 shadow-md border border-gray-800 bg-gray-900">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <span class="font-bold text-base text-gray-200 w-6">${entry.place}</span>
                        <span class="font-medium text-gray-100 text-sm">${climberButton}</span>
                    </div>
                    <div class="font-bold text-blue-400 text-base">${entry.circuit_points}</div>
                </div>
               <div class="flex flex-wrap justify-around items-center text-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700 gap-x-4 gap-y-2">
                    <div>1st <span class="block font-medium text-gray-200 text-sm">${entry['1st']}</span></div>
                    <div>2nd <span class="block font-medium text-gray-200 text-sm">${entry['2nd']}</span></div>
                    <div>3rd <span class="block font-medium text-gray-200 text-sm">${entry['3rd']}</span></div>
                    <div>Finals <span class="block font-medium text-gray-200 text-sm">${entry.finals}</span></div>
                    <div>Flashes <span class="block font-medium text-gray-200 text-sm">${entry.flashes}</span></div>
                </div>
            </div>`;
            desktopHTML += `<tr class="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50">
                <td class="p-3">${entry.circuit}</td>
                <td class="p-3 font-bold text-gray-100">${entry.place}</td>
                <td class="p-3 font-medium text-gray-200">${climberButton}</td>
                <td class="p-3 font-semibold text-blue-400">${entry.circuit_points}</td>
                <td class="p-3">${entry['1st']}</td>
                <td class="p-3">${entry['2nd']}</td>
                <td class="p-3">${entry['3rd']}</td>
                <td class="p-3">${entry.finals}</td>
                <td class="p-3">${entry.flashes}</td>
            </tr>`;
        }
    }

    mobileHTML += '</div>';
    desktopHTML += '</tbody></table></div>';
    container.innerHTML = mobileHTML + desktopHTML;

    container.querySelectorAll('.profile-link-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const climberName = e.currentTarget.dataset.climberName;
            navigate('climberProfile', {
                climberName: climberName,
                from: { page: 'leaderboards' }
            });
        });
    });
}

export function renderLeaderboardsPage(headerContent, mainContent, controlsContainer, appData, navigate) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="home-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Leaderboards</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    document.getElementById('home-btn').addEventListener('click', () => history.back());
    document.getElementById('go-home-btn').addEventListener('click', () => navigate('home'));

    controlsContainer.classList.remove('hidden');
    controlsContainer.innerHTML = `<div class="flex justify-center">
        <div id="leaderboard-selector" class="inline-flex bg-gray-800 p-1 rounded-md gap-1 overflow-x-auto no-scrollbar h-scroll">
            <button data-leaderboard="qualis" class="leaderboard-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">Qualis</button>
            <button data-leaderboard="finals" class="leaderboard-btn whitespace-nowrap text-gray-300 font-semibold py-1 px-4 rounded-md">Finals</button>
        </div>
    </div>`;
    
    mainContent.innerHTML = `<div id="leaderboard-container" class="w-full"></div>`;
    
    function setActiveLeaderboardButton() {
        document.querySelectorAll('.leaderboard-btn').forEach(btn => {
            const isSelected = btn.dataset.leaderboard === currentLeaderboard;
            btn.classList.toggle('bg-blue-600', isSelected);
            btn.classList.toggle('text-white', isSelected);
            btn.classList.toggle('shadow-md', isSelected);
            btn.classList.toggle('text-gray-300', !isSelected);
        });
    }

    currentLeaderboard = 'qualis';
    setActiveLeaderboardButton();
    renderLeaderboardTable(document.getElementById('leaderboard-container'), appData, navigate, currentLeaderboard);

    controlsContainer.querySelector('#leaderboard-selector').addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.leaderboard !== currentLeaderboard) {
            currentLeaderboard = e.target.dataset.leaderboard;
            history.replaceState({ page: 'leaderboards', context: { tab: currentLeaderboard } }, '', window.location.hash);
            setActiveLeaderboardButton();
            renderLeaderboardTable(document.getElementById('leaderboard-container'), appData, navigate, currentLeaderboard);
        }
    });
}

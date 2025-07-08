export function renderRulesPage(headerContent, mainContent, navigate) {
    headerContent.innerHTML = `
        <div class="flex-1">
               <button id="home-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Rules & Format</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#home-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    mainContent.innerHTML = `
        <div class="space-y-8 text-gray-300 leading-relaxed">
            <div>
                <h2 class="text-xl font-bold text-gray-100 border-b border-gray-700 pb-2 mb-3">1. The Circuit</h2>
                <p>Mockomps is divided into Circuits (e.g., MC01, MC02). Each Circuit consists of 10 individual Mockomps (M01 through M10 for MC01, M11 through M20 for MC02, and so on), culminating in two final events: the <strong class="text-white">Mockomp Challengers</strong> and the <strong class="text-white">Mockomp Champions</strong> to decide the Circuit Champion.</p>
            </div>
            <div>
                <h2 class="text-xl font-bold text-gray-100 border-b border-gray-700 pb-2 mb-3">2. The Mockomp</h2>
                <p>A Mockomp is a multi-week competition event held every one to two months at São Rock climbing gym. It is composed of a Qualification Phase and a Final.</p>
                <div class="space-y-4 mt-4">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-200">Qualification Phase</h3>
                        <p>The Qualification Phase consists of 3-5 consecutive Quali Rounds (e.g., M01Q1, M01Q2). A new round begins every Monday at São Rock with a fresh set of 10-15 boulders. Climbers have one week (Monday-Sunday) to attempt them and submit scores.</p>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg text-gray-200">Final</h3>
                        <p>The top 8 climbers with the most Quali Points from that Mockomp's qualification phase advance to Final. The format is 4 boulders with a 4+ minute time limit per boulder. Climbers are held in <strong class="text-white">competitor isolation</strong>, meaning they do not see the boulders being climbed before their turn.</p>
                        <p class="mt-2"><strong class="text-gray-200">Ranking:</strong> Climbers are ranked based on the following criteria, in order: 1. Most Tops, 2. Most Zones, 3. Fewest Attempts to Top, 4. Fewest Attempts to Zone.</p>
                    </div>
                </div>
            </div>
             <div>
                <h2 class="text-xl font-bold text-gray-100 border-b border-gray-700 pb-2 mb-3">3. The Circuit Finale</h2>
                <p>At the end of a 10-Mockomp circuit, two special events determine the ultimate champion.</p>
                <div class="space-y-4 mt-4">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-200">Mockomp Challengers</h3>
                        <ul class="list-disc list-inside space-y-2 mt-2 pl-2">
                            <li><strong class="text-gray-200">Who:</strong> Open to all climbers who participated in the circuit but did not qualify for a Final in any of the 10 Mockomps.</li>
                            <li><strong class="text-gray-200">Format:</strong> One qualification week, followed by a Final with the top 8 climbers from that quali. The top 3 finishers from the Challengers Final advance to the Mockomp Champions event.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg text-gray-200">Mockomp Champions</h3>
                       <ul class="list-disc list-inside space-y-2 mt-2 pl-2">
                            <li><strong class="text-gray-200">Who:</strong> All climbers who made it to a Final during the circuit, plus the 3 winners from the Challengers event.</li>
                            <li><strong class="text-gray-200">Format:</strong> Two qualification weeks, followed by a Grand Final. For the 3 advancing Challengers, their score from the Challengers Quali serves as their score for the first Champions Quali week. All other competitors participate in both quali weeks. The top 8 climbers from the two Champions qualis advance to the Grand Final to decide the Circuit Champion.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div>
                <h2 class="text-xl font-bold text-gray-100 border-b border-gray-700 pb-2 mb-3">4. Scoring Explained</h2>
                <div class="space-y-4">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-200">Qualis Leaderboard Scoring</h3>
                        <p>Climbers are ranked by their total <strong class="text-white">Quali Points</strong>. Points per boulder are awarded as follows:</p>
                        <ul class="list-disc list-inside space-y-1 mt-2 pl-2">
                            <li><strong class="text-yellow-400">Flash:</strong> Points equal to the boulder's grade + 1 bonus point.</li>
                            <li><strong class="text-green-400">Top (after flash):</strong> Points equal to the boulder's grade.</li>
                            <li><strong class="text-blue-400">Zone only:</strong> Points equal to half of the boulder's grade.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg text-gray-200">Finals Leaderboard Scoring</h3>
                        <p>This leaderboard ranks climbers based on <strong class="text-white">Circuit Points</strong>, which are awarded only in the Finals. The winner receives points equal to the number of participants (e.g., if 8 climbers are in the Final, 1st place gets 8 points). Subsequent places receive one less point each.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}
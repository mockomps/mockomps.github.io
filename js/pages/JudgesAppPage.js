
export function renderJudgesAppPage(headerContent, mainContent, appData, navigate, getLondonTime) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Judges App</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    mainContent.innerHTML = `
        <div class="max-w-xl mx-auto">
            <form id="judges-form" class="space-y-6">
                
                <!-- Step 1: Final Selection -->
                <div>
                    <label for="final-select" class="block text-sm font-medium text-gray-300 mb-1">Select Final</label>
                    <select id="final-select" name="final" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                        <!-- Options will be populated dynamically -->
                    </select>
                </div>

                <!-- Step 2: Climber Selection (hidden initially) -->
                <div id="climber-select-container" class="hidden">
                    <label for="climber-select" class="block text-sm font-medium text-gray-300 mb-1">Select Climber</label>
                    <select id="climber-select" name="climber" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                        <!-- Options will be populated dynamically -->
                    </select>
                </div>

                <!-- Step 3: Boulder Selection (hidden initially) -->
                <div id="boulder-select-container" class="hidden">
                    <label for="boulder-select" class="block text-sm font-medium text-gray-300 mb-1">Select Boulder</label>
                    <select id="boulder-select" name="boulder" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                        <!-- Options will be populated dynamically -->
                    </select>
                </div>
                
                <!-- Next Button (hidden initially) -->
                <div id="next-btn-container" class="hidden pt-2">
                     <button type="submit" disabled class="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition">Next</button>
                </div>

            </form>
        </div>
    `;

    const form = mainContent.querySelector('#judges-form');
    const finalSelect = mainContent.querySelector('#final-select');
    const climberSelectContainer = mainContent.querySelector('#climber-select-container');
    const climberSelect = mainContent.querySelector('#climber-select');
    const boulderSelectContainer = mainContent.querySelector('#boulder-select-container');
    const boulderSelect = mainContent.querySelector('#boulder-select');
    const nextBtnContainer = mainContent.querySelector('#next-btn-container');
    
    // Populate Finals
    const now = getLondonTime(); // Use London time
    const liveFinals = appData.finals.filter(final => {
        const finalDate = new Date(final.date);
        const endDate = new Date(finalDate.getTime() + (30 * 60 * 60 * 1000)); // End of day + 6 hours -> 30 hours total
        return now >= finalDate && now <= endDate;
    });
    
    let finalsOptionsHTML = '<option value="">-- Select a Final --</option>';
    if (liveFinals.length > 0) {
        liveFinals.forEach(f => {
            finalsOptionsHTML += `<option value="${f.final}">${f.final}</option>`;
        });
    } else {
        finalsOptionsHTML = '<option value="">-- No Live Finals --</option>';
    }
    finalSelect.innerHTML = finalsOptionsHTML;

    // Event Listeners to show next step and enable button
    const checkCompletion = () => {
        const nextButton = nextBtnContainer.querySelector('button');
        if (finalSelect.value && climberSelect.value && boulderSelect.value) {
            nextButton.disabled = false;
            nextButton.classList.remove('bg-gray-600', 'cursor-not-allowed');
            nextButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
        } else {
            nextButton.disabled = true;
            nextButton.classList.add('bg-gray-600', 'cursor-not-allowed');
            nextButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        }
    };
    
    finalSelect.addEventListener('change', () => {
        climberSelectContainer.classList.add('hidden');
        boulderSelectContainer.classList.add('hidden');
        nextBtnContainer.classList.add('hidden');
        climberSelect.value = '';
        boulderSelect.value = '';


        if (finalSelect.value) {
            const climbersInFinal = appData.fClimbers
                .filter(r => r.final === finalSelect.value)
                .map(r => r.climber)
                .sort();
            let climberOptionsHTML = '<option value="">-- Select a Climber --</option>';
            climbersInFinal.forEach(c => {
                 climberOptionsHTML += `<option value="${c}">${c}</option>`;
            });
            climberSelect.innerHTML = climberOptionsHTML;
            climberSelectContainer.classList.remove('hidden');
        }
        checkCompletion();
    });

    climberSelect.addEventListener('change', () => {
        boulderSelectContainer.classList.add('hidden');
        nextBtnContainer.classList.add('hidden');
        boulderSelect.value = '';


        if (climberSelect.value) {
            boulderSelect.innerHTML = `
                <option value="">-- Select a Boulder --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
            `;
            boulderSelectContainer.classList.remove('hidden');
        }
         checkCompletion();
    });
    
    boulderSelect.addEventListener('change', () => {
        if (boulderSelect.value) {
            nextBtnContainer.classList.remove('hidden');
        } else {
            nextBtnContainer.classList.add('hidden');
        }
        checkCompletion();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const context = {
            final: finalSelect.value,
            climber: climberSelect.value,
            boulder: boulderSelect.value
        };
        navigate('judgeBoulderPage', context);
    });
}

export function renderJudgeBoulderPage(headerContent, mainContent, navigate, showConfirmationModal, GOOGLE_APP_SCRIPT_URL, context) {
    const { final, climber, boulder } = context;

    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <div class="flex-1 text-center">
            <h1 class="text-2xl font-bold text-gray-100">${climber}</h1>
            <h2 class="text-sm font-medium text-gray-400 mt-1 whitespace-nowrap">${boulder} &middot; ${final}</h2>
        </div>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    mainContent.innerHTML = `
        <div class="max-w-md mx-auto space-y-4">
            <!-- Timer Section -->
            <div class="text-center">
                <div id="timer-display" class="text-7xl font-mono font-bold text-white">04:00</div>
                <div class="flex justify-center items-center space-x-4 mt-2">
                    <button id="play-btn" class="text-gray-300 hover:text-white text-3xl p-2"><i class="fas fa-play"></i></button>
                    <button id="pause-btn" class="text-gray-300 hover:text-white text-3xl p-2"><i class="fas fa-pause"></i></button>
                    <button id="reset-clock-btn" class="text-gray-300 hover:text-white text-3xl p-2"><i class="fas fa-undo"></i></button>
                </div>
            </div>

            <!-- Scoreboard -->
            <div class="grid grid-cols-3 gap-4 text-center items-center py-4">
                <div>
                    <div class="text-sm text-green-400">TOP</div>
                    <div id="top-score" class="text-4xl font-bold text-green-400">0</div>
                </div>
                <div>
                    <div class="text-sm text-blue-400">ZONE</div>
                    <div id="zone-score" class="text-4xl font-bold text-blue-400">0</div>
                </div>
                <div>
                    <div class="text-sm text-gray-400">Attempts</div>
                    <div id="attempt-counter" class="text-4xl font-bold text-white">0</div>
                </div>
            </div>

            <!-- Main Action Area & Footer Actions in one grid -->
            <div class="grid grid-cols-2 gap-4 pt-4">
                <button id="top-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-24 text-2xl rounded-lg transition flex items-center justify-center">TOP</button>
                <button id="add-attempt-btn" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold h-24 text-4xl rounded-lg transition flex items-center justify-center">+</button>
                <button id="zone-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-24 text-2xl rounded-lg transition flex items-center justify-center">ZONE</button>
                <button id="subtract-attempt-btn" class="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold h-24 text-4xl rounded-lg transition flex items-center justify-center">-</button>
                 <button id="reset-btn" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-lg transition">Reset</button>
                 <button id="submit-btn" class="w-full bg-blue-800 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition">Submit</button>
            </div>
            <div id="form-feedback" class="text-center h-6 py-2"></div>
        </div>
    `;

    // --- State Management ---
    let timeRemaining = 240; // 4 minutes in seconds
    let timerInterval = null;
    let attemptCount = 0;
    let topAttempt = 0;
    let zoneAttempt = 0;

    // --- DOM Element References ---
    const timerDisplay = mainContent.querySelector('#timer-display');
    const playBtn = mainContent.querySelector('#play-btn');
    const pauseBtn = mainContent.querySelector('#pause-btn');
    const resetClockBtn = mainContent.querySelector('#reset-clock-btn');
    const attemptCounter = mainContent.querySelector('#attempt-counter');
    const topScore = mainContent.querySelector('#top-score');
    const zoneScore = mainContent.querySelector('#zone-score');
    const topBtn = mainContent.querySelector('#top-btn');
    const zoneBtn = mainContent.querySelector('#zone-btn');
    const addAttemptBtn = mainContent.querySelector('#add-attempt-btn');
    const subtractAttemptBtn = mainContent.querySelector('#subtract-attempt-btn');
    const resetBtn = mainContent.querySelector('#reset-btn'); // Renamed
    const submitBtn = mainContent.querySelector('#submit-btn');
    const feedbackDiv = mainContent.querySelector('#form-feedback');

    // --- Helper Functions ---
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const updateUI = () => {
        timerDisplay.textContent = formatTime(timeRemaining);
        attemptCounter.textContent = attemptCount;
        topScore.textContent = topAttempt;
        zoneScore.textContent = zoneAttempt;
        
        topBtn.classList.toggle('opacity-50', topAttempt > 0);
        zoneBtn.classList.toggle('opacity-50', zoneAttempt > 0);
    };
    
    const resetScoresAndAttempts = () => {
        attemptCount = 0;
        topAttempt = 0;
        zoneAttempt = 0;
        feedbackDiv.innerHTML = '';
        updateUI();
    };

    // --- Timer Logic ---
    const startTimer = () => {
        if (timerInterval || timeRemaining <= 0) return;
        timerInterval = setInterval(() => {
            timeRemaining--;
            timerDisplay.textContent = formatTime(timeRemaining);
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerDisplay.classList.add('text-red-500');
            }
        }, 1000);
    };

    playBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
    });
    resetClockBtn.addEventListener('click', () => {
        showConfirmationModal('Reset Timer?', 'This will only reset the clock.', () => {
            clearInterval(timerInterval);
            timerInterval = null;
            timeRemaining = 240;
            timerDisplay.classList.remove('text-red-500');
            updateUI();
        });
    });

    // --- Attempts Counter Logic ---
    addAttemptBtn.addEventListener('click', () => {
        attemptCount++;
        updateUI();
    });

    subtractAttemptBtn.addEventListener('click', () => {
        if (attemptCount > 0) {
            attemptCount--;
            updateUI();
        }
    });

    // --- Scoring Logic ---
    zoneBtn.addEventListener('click', () => {
        if (zoneAttempt > 0) {
            zoneAttempt = 0; 
        } else {
            zoneAttempt = attemptCount;
        }
        updateUI();
    });

    topBtn.addEventListener('click', () => {
        if (topAttempt > 0) {
            topAttempt = 0; 
        } else {
            topAttempt = attemptCount;
            if (zoneAttempt === 0) {
                zoneAttempt = attemptCount;
            }
        }
        updateUI();
    });
    
    // --- Footer Actions ---
    resetBtn.addEventListener('click', () => {
        showConfirmationModal('Reset Scores?', 'This will reset attempts, Top, and Zone scores. The timer will not be affected.', resetScoresAndAttempts);
    });

    submitBtn.addEventListener('click', () => {
        const isTopAwarded = topAttempt > 0;
        const isZoneAwarded = zoneAttempt > 0;
        const resultSummary = `Submit: Top(${topAttempt}), Zone(${zoneAttempt})?`;

        showConfirmationModal('Confirm Result', resultSummary, () => {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...`;
            
            const payload = {
                formType: 'submitFinalsResult',
                final: final,
                climber: climber,
                boulder: boulder,
                send: isTopAwarded ? 'Top' : (isZoneAwarded ? 'Zone' : 'Nothing'),
                topAttempts: topAttempt,
                zoneAttempts: zoneAttempt
            };

            fetch(GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(() => {
                feedbackDiv.innerHTML = `<p class="text-green-400">Result for ${climber} on Boulder ${boulder} saved!</p>`;
                setTimeout(() => history.back(), 1500); // Go back after successful submission
            })
            .catch(err => {
                console.error('Error!', err);
                feedbackDiv.innerHTML = `<p class="text-red-400">Error: Submission failed.</p>`;
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit';
            });
        });
    });
    
    // Initial UI setup
    updateUI();
}


export function renderSubmitResultsPage(headerContent, mainContent, appData, navigate, getLondonTime, GOOGLE_APP_SCRIPT_URL) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="home-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Submit Quali Results</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#home-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const climberOptions = [...appData.climbers].sort((a,b) => a.name.localeCompare(b.name)).map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    mainContent.innerHTML = `
        <div class="max-w-xl mx-auto">
            <form id="quali-results-form" class="space-y-6">
                
                <!-- Step 1: Climber Selection -->
                <div>
                    <label for="climber-select" class="block text-sm font-medium text-gray-300 mb-1">1. Select Your Name</label>
                    <select id="climber-select" name="climber" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                        <option value="">-- Select Climber --</option>
                        ${climberOptions}
                    </select>
                </div>

                <!-- Step 2: Quali Selection (hidden initially) -->
                <div id="quali-select-container" class="hidden">
                    <label for="quali-select" class="block text-sm font-medium text-gray-300 mb-1">2. Select Live Quali Round</label>
                    <select id="quali-select" name="quali" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                        <!-- Options will be populated dynamically -->
                    </select>
                </div>

                <!-- Step 3: Boulder Questions (hidden initially) -->
                <div id="boulder-questions-container" class="hidden space-y-4">
                    <!-- Questions will be populated dynamically -->
                </div>
                
                <div id="form-feedback" class="text-center h-6"></div>

                <!-- Submit Button (hidden initially) -->
                <div id="submit-btn-container" class="hidden">
                     <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Submit Scores</button>
                </div>

            </form>
        </div>
    `;

    const climberSelect = mainContent.querySelector('#climber-select');
    const qualiSelectContainer = mainContent.querySelector('#quali-select-container');
    const qualiSelect = mainContent.querySelector('#quali-select');
    const boulderQuestionsContainer = mainContent.querySelector('#boulder-questions-container');
    const submitBtnContainer = mainContent.querySelector('#submit-btn-container');
    const form = mainContent.querySelector('#quali-results-form');
    const feedback = mainContent.querySelector('#form-feedback');

    climberSelect.addEventListener('change', () => {
        boulderQuestionsContainer.innerHTML = '';
        boulderQuestionsContainer.classList.add('hidden');
        submitBtnContainer.classList.add('hidden');
        qualiSelect.value = '';
        
        if (climberSelect.value) {
            const now = getLondonTime(); // Use London time
            const liveQualis = appData.qualis.filter(quali => {
                const startDate = new Date(quali.date);
                const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000));
                return now >= startDate && now <= endDate;
            }).sort((a, b) => new Date(b.date) - new Date(a.date));

            let qualiOptionsHTML = '<option value="">-- Select Quali --</option>';
            if(liveQualis.length > 0) {
               liveQualis.forEach(q => {
                    qualiOptionsHTML += `<option value="${q.quali}">${q.quali}</option>`;
               });
            } else {
                qualiOptionsHTML = '<option value="">-- No Live Qualis Available --</option>';
            }
            
            qualiSelect.innerHTML = qualiOptionsHTML;
            qualiSelectContainer.classList.remove('hidden');
        } else {
            qualiSelectContainer.classList.add('hidden');
        }
    });

    qualiSelect.addEventListener('change', () => {
        const selectedClimber = climberSelect.value;
        const selectedQuali = qualiSelect.value;
        boulderQuestionsContainer.innerHTML = '';
        boulderQuestionsContainer.classList.add('hidden');
        submitBtnContainer.classList.add('hidden');
        
        if (selectedQuali && selectedClimber) {
            const boulders = appData.qBoulders.filter(b => b.quali === selectedQuali);
            
            const existingResult = appData.qResults.find(r => r.climber === selectedClimber && r.quali === selectedQuali);

            if(boulders.length > 0) {
                let questionsHTML = `<h3 class="text-lg font-semibold text-gray-200 pt-4 border-t border-gray-800">3. Log Your Results</h3>`;
                boulders.forEach(boulder => {
                    const boulderNameLower = boulder.name.toLowerCase();
                    const boulderId = `${selectedQuali}-${boulder.name}`;
                    
                    const previousAnswer = existingResult ? existingResult[boulderNameLower] : null;

                    questionsHTML += `
                        <div class="bg-gray-900/50 border border-gray-800 p-4 rounded-lg space-y-3">
                            <div class="flex justify-between items-center">
                                <p class="font-bold text-xl text-gray-200">${boulder.name}</p>
                                <p class="font-normal text-gray-300">${boulder.grade} ${boulder.color} ${boulder.a}</p>
                            </div>
                            <div class="segmented-control">
                                <input type="radio" id="${boulderId}-flash" name="results[${boulderNameLower}]" value="Flash" required ${previousAnswer === 'Flash' ? 'checked' : ''}>
                                <label for="${boulderId}-flash" class="text-flash">Flash</label>
                                <input type="radio" id="${boulderId}-top" name="results[${boulderNameLower}]" value="Top" required ${previousAnswer === 'Top' ? 'checked' : ''}>
                                <label for="${boulderId}-top" class="text-top">Top</label>
                                <input type="radio" id="${boulderId}-zone" name="results[${boulderNameLower}]" value="Zone" required ${previousAnswer === 'Zone' ? 'checked' : ''}>
                                <label for="${boulderId}-zone" class="text-zone">Zone</label>
                                <input type="radio" id="${boulderId}-nothing" name="results[${boulderNameLower}]" value="Nothing" required ${previousAnswer === 'Nothing' || !previousAnswer ? 'checked' : ''}>
                                <label for="${boulderId}-nothing" class="text-nothing">Nothing</label>
                            </div>
                        </div>
                    `;
                });
                boulderQuestionsContainer.innerHTML = questionsHTML;
                boulderQuestionsContainer.classList.remove('hidden');
                submitBtnContainer.classList.remove('hidden');
            }
        }
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        feedback.innerHTML = '';
        
        const formData = new FormData(form);
        const climber = formData.get('climber');
        const quali = formData.get('quali');
        const results = {};
        let questionCount = boulderQuestionsContainer.querySelectorAll('.segmented-control').length;
        let answeredCount = 0;

        for (let [key, value] of formData.entries()) {
           if (key.startsWith('results[')) {
               const boulderName = key.match(/\[(.*?)\]/)[1];
               results[boulderName] = value;
               answeredCount++;
           }
        }

        if (answeredCount < questionCount) {
            feedback.innerHTML = `<p class="text-red-400">Please answer all boulder questions before submitting.</p>`;
            return;
        }

        const payload = {
            formType: 'submitQualiResults',
            climber,
            quali,
            results
        };

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...`;

        fetch(GOOGLE_APP_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            feedback.innerHTML = `<p class="text-green-400">Success! Your results have been submitted and are being processed.</p>`;
            form.reset();
            qualiSelectContainer.classList.add('hidden');
            boulderQuestionsContainer.classList.add('hidden');
            submitBtnContainer.classList.add('hidden');
        })
        .catch(error => {
            console.error('Error!', error);
            feedback.innerHTML = `<p class="text-red-400">Error: Submission failed. Please check your connection.</p>`;
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = `Submit Scores`;
        });
    });
}

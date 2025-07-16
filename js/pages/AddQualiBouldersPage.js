export function renderAddQualiBouldersPage(headerContent, mainContent, appData, getLondonTime, showConfirmationModal, GOOGLE_APP_SCRIPT_URL, navigate) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-to-admin-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Manage Qualis Boulders</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-to-admin-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));
    
    const now = getLondonTime(); // Use London time
    const liveAndFutureQualis = appData.qualis
        .filter(q => {
            const endDate = new Date(new Date(q.date).getTime() + (7 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000));
            return endDate >= now;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const qualiOptions = liveAndFutureQualis.map(q => `<option value="${q.quali}">${q.quali}</option>`).join('');

    const gradeOptions = [1,2,3,4,5,6,7].map(g => `<option value="${g}">${g}</option>`).join('');
    const colorOptions = ["Black", "Blue", "Green", "Mint", "Purple", "Red", "White", "Yellow"].map(c => `<option value="${c}">${c}</option>`).join('');
    const wallOptions = ["90º", "45º", "30º", "20º", "10º", "0º", "-5º"].map(w => `<option value="${w}">${w}</option>`).join('');
    const styleOptions = ["Fingers", "Physical", "Power", "Dynamic", "Coordination", "Balance", "Mobility", "Ladder"].map(s => `<option value="${s}">${s}</option>`).join('');


    mainContent.innerHTML = `
        <div class="max-w-xl mx-auto">
            <form id="boulder-form" class="space-y-6">
                <div>
                    <label for="quali-select" class="block text-sm font-medium text-gray-300 mb-1">Select Quali Round</label>
                    <select id="quali-select" class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                        <option value="">-- Select a Quali --</option>
                        ${qualiOptions}
                    </select>
                </div>
                <div id="boulder-list" class="space-y-3">
                </div>
                <div class="flex justify-between items-center">
                    <button type="button" id="add-boulder-btn" class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Add Boulder</button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">Submit All Boulders</button>
                </div>
            </form>
            <div id="boulder-form-feedback" class="mt-4 text-center"></div>
        </div>
    `;

    const boulderList = mainContent.querySelector('#boulder-list');
    const qualiSelect = mainContent.querySelector('#quali-select');
    
    function addBoulderRow(boulder = {}) {
        const letter = String.fromCharCode(65 + boulderList.children.length);
        const row = document.createElement('div');
        row.className = "boulder-row grid grid-cols-12 gap-2 items-center";
        row.innerHTML = `
            <div class="col-span-1 text-center font-bold text-xl text-gray-400">${letter}</div>
            <div class="col-span-2"><select name="grade" class="w-full bg-gray-800 border border-gray-700 p-2 rounded-md">${gradeOptions}</select></div>
            <div class="col-span-2"><select name="color" class="w-full bg-gray-800 border border-gray-700 p-2 rounded-md">${colorOptions}</select></div>
            <div class="col-span-2"><select name="wall" class="w-full bg-gray-800 border border-gray-700 p-2 rounded-md">${wallOptions}</select></div>
            <div class="col-span-2"><select name="style" class="w-full bg-gray-800 border border-gray-700 p-2 rounded-md">${styleOptions}</select></div>
            <div class="col-span-2">
                <select name="room" class="w-full bg-gray-800 border border-gray-700 p-2 rounded-md">
                    <option>A1</option>
                    <option>A2</option>
                </select>
            </div>
            <div class="col-span-1 text-right">
                <button type="button" class="remove-boulder-btn text-red-500 hover:text-red-400 text-2xl font-bold">&times;</button>
            </div>
        `;
        boulderList.appendChild(row);

        if(boulder.grade) row.querySelector('select[name="grade"]').value = boulder.grade;
        if(boulder.color) row.querySelector('select[name="color"]').value = boulder.color;
        if(boulder.wall) row.querySelector('select[name="wall"]').value = boulder.wall;
        if(boulder.style) row.querySelector('select[name="style"]').value = boulder.style;
        if(boulder.a) row.querySelector('select[name="room"]').value = boulder.a;

        row.querySelector('.remove-boulder-btn').addEventListener('click', () => {
             row.remove();
             updateBoulderLetters();
        });
    }
    
    function updateBoulderLetters() {
        const rows = boulderList.querySelectorAll('.boulder-row');
        rows.forEach((row, index) => {
            row.querySelector('div:first-child').textContent = String.fromCharCode(65 + index);
        });
    }

    function populateBouldersForQuali(qualiName) {
        boulderList.innerHTML = '';
        const existingBoulders = appData.qBoulders.filter(b => b.quali === qualiName);

        if (existingBoulders.length > 0) {
            existingBoulders.forEach(boulder => addBoulderRow(boulder));
        } else {
            for(let i=0; i<5; i++) {
                addBoulderRow();
            }
        }
    }
    
    qualiSelect.addEventListener('change', (e) => {
        const selectedQuali = e.target.value;
        if(selectedQuali) {
            populateBouldersForQuali(selectedQuali);
        } else {
            boulderList.innerHTML = '';
        }
    });


    mainContent.querySelector('#add-boulder-btn').addEventListener('click', () => {
        addBoulderRow();
    });
    
    const boulderForm = mainContent.querySelector('#boulder-form');
    const boulderFeedback = mainContent.querySelector('#boulder-form-feedback');

    boulderForm.addEventListener('submit', e => {
        e.preventDefault();
        
        showConfirmationModal('Confirm Changes', 'Are you sure you want to save these boulders?', () => {
            boulderFeedback.innerHTML = '';
            
            const qualiName = mainContent.querySelector('#quali-select').value;
             if (!qualiName) {
                 boulderFeedback.innerHTML = `<p class="text-red-400">Please select a Quali round first.</p>`;
                 return;
             }

            const boulders = [];
            const rows = boulderList.querySelectorAll('.boulder-row');
            
            rows.forEach((row, index) => {
                const grade = row.querySelector('select[name="grade"]').value;
                const color = row.querySelector('select[name="color"]').value;
                const wall = row.querySelector('select[name="wall"]').value;
                const style = row.querySelector('select[name="style"]').value;
                const room = row.querySelector('select[name="room"]').value;

                boulders.push({
                    Name: String.fromCharCode(65 + index),
                    Grade: grade,
                    Color: color,
                    Wall: wall,
                    Style: style,
                    A: room
                });
            });
            
            const payload = {
                formType: 'addBoulders',
                quali: qualiName,
                boulders: boulders
            };
            
            const submitButton = boulderForm.querySelector('button[type="submit"]');
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
                boulderFeedback.innerHTML = `<p class="text-green-400">Success! Boulders for ${qualiName} have been updated.</p>`;
            })
            .catch(error => {
                console.error('Error!', error);
                boulderFeedback.innerHTML = `<p class="text-red-400">Error: Submission failed. Please check your connection.</p>`;
            })
             .finally(() => {
                 submitButton.disabled = false;
                 submitButton.innerHTML = `Submit All Boulders`;
             });
        });
    });
}
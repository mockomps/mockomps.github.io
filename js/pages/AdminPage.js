export function renderAdminPage(headerContent, mainContent, navigate) {
    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="admin-back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Admin Panel</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#admin-back-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    mainContent.innerHTML = `
            <div class="grid grid-cols-1 gap-4 text-center mt-0">
                <button id="add-quali-boulders-btn" class="bg-gray-900 border border-gray-800 p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-xl">Manage Qualis Boulders</button>
                <button id="submit-quali-images-btn" class="bg-gray-900 border border-gray-800 p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-xl">Submit Quali Boulder Images</button>
                <button id="manage-finals-btn" class="bg-gray-900 border border-gray-800 p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-xl">Manage Finals Rosters</button>
                <button id="judge-finals-btn" class="bg-gray-900 border border-gray-800 p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-xl">Judges App</button>
            </div>
    `;

    mainContent.querySelector('#add-quali-boulders-btn').addEventListener('click', () => navigate('addBoulders'));
    mainContent.querySelector('#manage-finals-btn').addEventListener('click', () => navigate('manageFinals'));
    mainContent.querySelector('#judge-finals-btn').addEventListener('click', () => navigate('judgesApp'));
    mainContent.querySelector('#submit-quali-images-btn').addEventListener('click', () => {
        window.open('https://forms.gle/rzN1ZYh6VzB6CR77A', '_blank');
    });
}

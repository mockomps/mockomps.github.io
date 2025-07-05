export function renderAboutPage(headerContent, mainContent, Maps) {
    headerContent.innerHTML = `
        <div class="flex-1">
               <button id="home-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">About</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#home-btn').addEventListener('click', () => history.back()); // Use history.back()
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => Maps.navigate('home'));

    mainContent.innerHTML = `
        <div class="text-center">
            <a href="https://instagram.com/mockomps" target="_blank" class="block bg-gray-900 border border-gray-800 p-8 rounded-lg shadow-md hover:shadow-xl hover:bg-gray-800 transition-all duration-200 text-gray-100 font-bold text-2xl"><i class="fab fa-instagram mr-2"></i>Follow us on Instagram</a>
        </div>`;
}
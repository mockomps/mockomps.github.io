export function renderQualiBouldersPage(headerContent, mainContent, appData, navigate, context) {


    const { qualiName } = context;

    headerContent.innerHTML = `
        <div class="flex-1">
            <button id="back-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <div class="flex-1 text-center">
            <h1 class="text-2xl font-bold text-gray-100">${qualiName}</h1>
            <h2 class="text-sm font-medium text-gray-400 mt-1 whitespace-nowrap">Boulders</h2>
        </div>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#back-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const boulders = appData.qBoulders.filter(boulder => boulder.quali === qualiName);

    if (boulders.length === 0) {
        mainContent.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No boulders found for ${qualiName}.</div>`;
        return;
    }

    let showImages = false; // State variable to toggle between boulder list and images

    const renderContent = () => {
        mainContent.innerHTML = `
            <div class="flex justify-center mb-4">
                <button id="view-boulder-images-btn" class="w-10 h-10 flex items-center justify-center p-2 rounded-md ${showImages ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white'}">
                    <i class="fas fa-images text-xl"></i>
                </button>
            </div>
            <div id="dynamic-content-area" class="space-y-3"></div>
        `;

        const dynamicContentArea = mainContent.querySelector('#dynamic-content-area');

        if (showImages) {
            const imagesData = appData.qBoulderImages.find(img => img.quali === qualiName);
            if (imagesData && imagesData.boulder_images) {
                const imageUrls = imagesData.boulder_images.split(',').map(url => {
                    let cleanUrl = url.trim().replace(/^"|"$/g, ''); // Remove quotes
                    if (cleanUrl.includes('drive.google.com/open?id=')) {
                        const fileId = cleanUrl.split('id=')[1];
                        cleanUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
                    }
                    return cleanUrl;
                }).filter(url => url);

                imageUrls.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.className = 'w-full h-auto rounded-lg'; // Tailwind classes for image
                    dynamicContentArea.appendChild(img);
                });
            } else {
                dynamicContentArea.innerHTML = `<div class="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400">No images found for this quali.</div>`;
            }
        } else {
            // Render boulder list
            let bouldersHTML = '';
            boulders.forEach(boulder => {
                const grade = boulder.grade || '';
                const room = boulder.a || '';
                const wall = boulder.wall || '';
                const style = boulder.style || '';

                bouldersHTML += `
                    <div data-boulder-name="${boulder.name}" class="boulder-button bg-gray-900 border border-gray-800 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between space-x-4 cursor-pointer hover:bg-gray-800 transition-colors duration-150">
                        <div class="flex items-center space-x-4">
                            <div class="font-bold text-xl text-gray-200 w-8 text-center">${boulder.name}</div>
                            <div>
                                <p class="font-semibold text-gray-200">${grade} ${boulder.color} ${room}</p>
                                ${(wall || style) ? `<div class="flex items-center space-x-2 mt-1.5">${wall ? `<span class="bg-gray-700/50 border border-gray-600/80 text-gray-300 px-1.5 py-0.25 rounded-md text-xs font-medium">${wall}</span>` : ''}${style ? `<span class="bg-gray-700/50 border border-gray-600/80 text-gray-300 px-1.5 py-0.25 rounded-md text-xs font-medium">${style}</span>` : ''}</div>` : ''}
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-gray-500"></i>
                    </div>
                `;
            });
            dynamicContentArea.innerHTML = bouldersHTML;

            dynamicContentArea.querySelectorAll('.boulder-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const boulderName = e.currentTarget.dataset.boulderName;
                    navigate('boulderPage', { qualiName: qualiName, boulderName: boulderName });
                });
            });
        }

        // Attach event listener to the toggle button
        mainContent.querySelector('#view-boulder-images-btn').addEventListener('click', () => {
            showImages = !showImages;
            renderContent(); // Re-render content based on new state
        });
    };

    renderContent(); // Initial render
}
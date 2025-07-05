export function renderRegisterPage(headerContent, mainContent, navigate, GOOGLE_APP_SCRIPT_URL) {
    headerContent.innerHTML = `
        <div class="flex-1">
               <button id="home-btn" class="flex items-center space-x-2 text-gray-400 hover:text-white font-medium"><i class="fas fa-arrow-left"></i><span class="hidden sm:inline">Back</span></button>
        </div>
        <h1 class="text-2xl font-bold text-gray-100 flex-1 text-center">Sign Up</h1>
        <div class="flex-1 text-right">
            <button id="go-home-btn" class="text-gray-400 hover:text-white"><i class="fas fa-home text-xl"></i></button>
        </div>`;
    headerContent.querySelector('#home-btn').addEventListener('click', () => history.back());
    headerContent.querySelector('#go-home-btn').addEventListener('click', () => navigate('home'));

    const countries = ["Portugal", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
    let countryOptions = countries.map(country => `<option value="${country}" ${country === 'Portugal' ? 'selected' : ''}>${country}</option>`).join('');

    mainContent.innerHTML = `
        <div class="max-w-md mx-auto">
            <form id="registration-form" class="space-y-4">
                <div>
                    <label for="Name" class="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input type="text" name="Name" id="Name" placeholder="first and last name" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label for="Date of Birth" class="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
                    <input type="text" name="Date of Birth" id="Date of Birth" placeholder="dd/mm/yyyy" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                </div>
                <div>
                    <label for="Country" class="block text-sm font-medium text-gray-300 mb-1">Country</label>
                    <select name="Country" id="Country" required class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                        ${countryOptions}
                    </select>
                </div>
                <div>
                    <label for="Instagram" class="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                    <input type="text" name="Instagram" id="Instagram" placeholder="without @" class="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                </div>
                <div class="pt-2">
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Sign Up</button>
                </div>
            </form>
            <div id="form-feedback" class="mt-4 text-center"></div>
        </div>
    `;

    const form = mainContent.querySelector('#registration-form');
    const feedback = mainContent.querySelector('#form-feedback');
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        feedback.innerHTML = ``;

        const nameInput = mainContent.querySelector('#Name');
        const dobInput = mainContent.querySelector('#Date of Birth');

        const dobValue = dobInput.value.trim();
        if(dobValue) {
            const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            if (!datePattern.test(dobValue)) {
                feedback.innerHTML = `<p class="text-red-400">Please enter the date of birth in DD/MM/YYYY format.</p>`;
                return;
            }
            const parts = dobValue.split("/");
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                feedback.innerHTML = `<p class="text-red-400">Please enter a valid date.</p>`;
                return;
            }
        }

        const cleanedName = nameInput.value
            .trim()
            .replace(/\s+/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...`;
        
        const plainFormData = Object.fromEntries(new FormData(form).entries());
        plainFormData.Name = cleanedName;
        plainFormData.formType = 'climberRegistration';

        fetch(GOOGLE_APP_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(plainFormData)
        })
        .then(() => {
            feedback.innerHTML = `<p class="text-green-400">Success! You are now registered.</p>`;
            form.reset();
        }).catch(error => {
            console.error('Error!', error);
            feedback.innerHTML = `<p class="text-red-400">Error: Submission failed. Please check your connection.</p>`;
        }).finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = `Sign Up`;
        });
    });
}

// Backend
function login(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('user-password').value;

    fetch('http://127.0.0.1:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            adminPanel();
        } else {
            console.log("Haslo nie prawidłowe lub login")
        }
    })
    .catch(err => {
        console.error('Błąd:', err);
    });
}

function changePassword() {
    const newPassword = document.getElementById('new-password').value;
    const token = localStorage.getItem('token');

    fetch('/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
    });
}

function adminPanel() {
    document.getElementById('loginContainer').style.display = 'none'; 
    document.getElementById('adminPanel').style.display = 'block'; 
}

function logout() {
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('user-password').value = '';
}

function saveSettings() {
    const settings = {
        minLength: parseInt(document.getElementById('password-length').value, 10),
        requireSpecialCharacters: document.getElementById('special-characters').checked,
        requireUpperLower: document.getElementById('upper-lower-letters').checked
    };

    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:3000/admin/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, settings })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        updateSettingsView(data.settings || settings);
    })
    .catch(err => {
        console.error('Błąd:', err);
        alert('Wystąpił błąd podczas zapisywania ustawień. Spróbuj ponownie później.');
    });

    return false;
}

let passwordSettings = {
    minLength: 8, // domyślna minimalna długość hasła
    requireSpecialCharacters: false, // czy wymagane są znaki specjalne
    requireUpperLower: false // czy wymagane są wielkie i małe litery
};

// Możesz aktualizować ten obiekt po zapisaniu nowych ustawień
function updateSettingsView(settings) {
    if (settings) {
        passwordSettings.minLength = settings.minLength || 8;
        passwordSettings.requireSpecialCharacters = settings.requireSpecialCharacters || false;
        passwordSettings.requireUpperLower = settings.requireUpperLower || false;

        const passwordLengthInput = document.getElementById('password-length');
        if (passwordLengthInput) {
            passwordLengthInput.value = passwordSettings.minLength;
            document.getElementById('min-length-value').innerText = passwordSettings.minLength;
        }

        const specialCharsCheckbox = document.getElementById('special-characters');
        if (specialCharsCheckbox) {
            specialCharsCheckbox.checked = passwordSettings.requireSpecialCharacters;
            document.getElementById('special-char-requirement').innerText = passwordSettings.requireSpecialCharacters ? '✔️' : '❌';
        }

        const upperLowerCheckbox = document.getElementById('upper-lower-letters');
        if (upperLowerCheckbox) {
            upperLowerCheckbox.checked = passwordSettings.requireUpperLower;
            document.getElementById('upper-lower-requirement').innerText = passwordSettings.requireUpperLower ? '✔️' : '❌';
        }
    } else {
        console.warn('Ustawienia są niezdefiniowane, używam wartości domyślnych');
    }
}



window.onload = loadSettings;

// Walidacja hasła admina
function validateAdminPassword() {
    const password = document.getElementById('new-admin-password').value;

    const minLengthRequirement = document.getElementById('admin-min-length-requirement');
    const uniqueCharactersRequirement = document.getElementById('admin-unique-characters-requirement');
    const specialCharRequirement = document.getElementById('admin-special-char-requirement');
    const upperLowerRequirement = document.getElementById('admin-upper-lower-requirement');

    let valid = true;

    if (password.length >= passwordSettings.minLength) {
        minLengthRequirement.querySelector('.icon').textContent = '✔️';
        minLengthRequirement.querySelector('.icon').style.color = 'green';
    } else {
        minLengthRequirement.querySelector('.icon').textContent = '❌';
        minLengthRequirement.querySelector('.icon').style.color = 'red';
        valid = false;
    }

    if (checkUniqueCharacters(password)) {
        uniqueCharactersRequirement.querySelector('.icon').textContent = '✔️';
        uniqueCharactersRequirement.querySelector('.icon').style.color = 'green';
    } else {
        uniqueCharactersRequirement.querySelector('.icon').textContent = '❌';
        uniqueCharactersRequirement.querySelector('.icon').style.color = 'red';
        valid = false;
    }

    if (passwordSettings.requireSpecialCharacters && /[\W\d]/.test(password)) {
        specialCharRequirement.querySelector('.icon').textContent = '✔️';
        specialCharRequirement.querySelector('.icon').style.color = 'green';
    } else if (passwordSettings.requireSpecialCharacters) {
        specialCharRequirement.querySelector('.icon').textContent = '❌';
        specialCharRequirement.querySelector('.icon').style.color = 'red';
        valid = false;
    }

    if (passwordSettings.requireUpperLower && /[a-z]/.test(password) && /[A-Z]/.test(password)) {
        upperLowerRequirement.querySelector('.icon').textContent = '✔️';
        upperLowerRequirement.querySelector('.icon').style.color = 'green';
    } else if (passwordSettings.requireUpperLower) {
        upperLowerRequirement.querySelector('.icon').textContent = '❌';
        upperLowerRequirement.querySelector('.icon').style.color = 'red';
        valid = false;
    }

    return valid;
}
// Funkcja do sprawdzania, czy hasło zawiera unikalne znaki
function checkUniqueCharacters(password) {
    const uniqueChars = new Set(password);
    return uniqueChars.size >= password.length * 0.7; // Przykład: wymaga, aby co najmniej 70% znaków było unikalnych
}

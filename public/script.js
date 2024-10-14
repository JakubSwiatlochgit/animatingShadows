const minLength = 8; 
let requireSpecialCharacters = false;
let requireUpperLower = false;

// Backend
function login(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('user-password').value;

    fetch('/login', {
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
            showError('Login lub hasło niepoprawne');
        }
    })
    .catch(err => {
        console.error('Błąd:', err);
        showError('Wystąpił błąd. Spróbuj ponownie później.');
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

function updateSettingsView(settings) {
    if (settings) {
        const passwordLengthInput = document.getElementById('password-length');
        if (passwordLengthInput) {
            passwordLengthInput.value = settings.minLength || 8;
            document.getElementById('min-length-value').innerText = settings.minLength || 8;
        }

        const specialCharsCheckbox = document.getElementById('special-characters');
        if (specialCharsCheckbox) {
            specialCharsCheckbox.checked = settings.requireSpecialCharacters || false;
            document.getElementById('special-char-requirement').innerText = settings.requireSpecialCharacters ? '✔️' : '❌';
        }

        const upperLowerCheckbox = document.getElementById('upper-lower-letters');
        if (upperLowerCheckbox) {
            upperLowerCheckbox.checked = settings.requireUpperLower || false;
            document.getElementById('upper-lower-requirement').innerText = settings.requireUpperLower ? '✔️' : '❌';
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

// Walidacja hasła użytkownika
function validatePassword() {
    const password = document.getElementById('user-password').value;

    const minLengthRequirement = document.getElementById('min-length-requirement');
    const uniqueCharactersRequirement = document.getElementById('unique-characters-requirement');
    const specialCharRequirement = document.getElementById('special-char-requirement');
    const upperLowerRequirement = document.getElementById('upper-lower-requirement');

    if (password.length >= minLength) {
        minLengthRequirement.querySelector('.icon').textContent = '✔️';
        minLengthRequirement.querySelector('.icon').style.color = 'green';
    } else {
        minLengthRequirement.querySelector('.icon').textContent = '❌';
        minLengthRequirement.querySelector('.icon').style.color = 'red';
    }

    // Unikalne znaki
    if (checkUniqueCharacters(password)) {
        uniqueCharactersRequirement.querySelector('.icon').textContent = '✔️';
        uniqueCharactersRequirement.querySelector('.icon').style.color = 'green';
    } else {
        uniqueCharactersRequirement.querySelector('.icon').textContent = '❌';
        uniqueCharactersRequirement.querySelector('.icon').style.color = 'red';
    }

    // Znaki specjalne i cyfry
    if (requireSpecialCharacters && /[\W\d]/.test(password)) {
        specialCharRequirement.querySelector('.icon').textContent = '✔️';
        specialCharRequirement.querySelector('.icon').style.color = 'green';
    } else {
        specialCharRequirement.querySelector('.icon').textContent = '❌';
        specialCharRequirement.querySelector('.icon').style.color = 'red';
    }

    // Duże i małe litery
    if (requireUpperLower && /[a-z]/.test(password) && /[A-Z]/.test(password)) {
        upperLowerRequirement.querySelector('.icon').textContent = '✔️';
        upperLowerRequirement.querySelector('.icon').style.color = 'green';
    } else {
        upperLowerRequirement.querySelector('.icon').textContent = '❌';
        upperLowerRequirement.querySelector('.icon').style.color = 'red';
    }
}

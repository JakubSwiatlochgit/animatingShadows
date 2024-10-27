// Dodaj event listener do formularza logowania
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Wysłanie żądania logowania
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        if (data.token) {
            token = data.token;
            document.getElementById('login').style.display = 'none';

            // Użytkownik musi zmienić hasło
            if (data.mustChangePassword) {
                document.getElementById('userPanel').style.display = 'block';
                document.getElementById('changePasswordSection').style.display = 'block';
            } else {
                console.log('Logowanie pomyślne, rola:', data.role);
                if (data.role === 'admin') {
                    document.getElementById('adminPanel').style.display = 'block';
                    document.getElementById('userPanel').style.display = 'none';

                    fetchUsers();
                }
                alert('Zalogowano pomyślnie jako ' + data.role);
            }

            // Inicjalizacja przycisków wylogowania
            initializeLogoutButtons(); // Przenieś tutaj
        } else {
            document.getElementById('error-message').style.display = 'block';
        }
    })
    .catch(err => console.error(err));
});

// Funkcja do inicjalizacji przycisków wylogowania
function initializeLogoutButtons() {
    console.log("dupa");
    console.log('Sprawdzanie przycisków wylogowania');
    const logoutButtons = document.querySelectorAll('.logoutButton');
    console.log('Znalezione przyciski wylogowania:', logoutButtons);

    logoutButtons.forEach(logoutButton => {
        // Wyczyść poprzednie event listenery
        logoutButton.removeEventListener('click', handleLogout);
        logoutButton.addEventListener('click', handleLogout);
    });
}

function handleLogout() {
    console.log("Wylogowano"); // Dodaj ten log
    fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Błąd wylogowania');
        }
        return res.json();
    })
    .then(data => {
        console.log(data.message);
        token = '';  
        document.getElementById('userPanel').style.display = 'none'; 
        document.getElementById('adminPanel').style.display = 'none'; 
        document.getElementById('login').style.display = 'block'; // Pokazanie sekcji logowania
        alert(data.message);
    })
    .catch(err => console.error('Błąd:', err));
}




userChangePasswordButton.addEventListener('click', () => {
    const oldPassword = document.getElementById('userOldPassword').value;
    const newPassword = document.getElementById('userNewPassword').value;
    console.log(userChangePasswordButton)
    console.log('Old Password:', oldPassword);
    console.log('New Password:', newPassword);

    const validationResult = validatePassword(newPassword);
    if (!validationResult.valid) {
        alert(validationResult.message);
        return; // Zatrzymaj, jeśli hasło nie jest poprawne
    }

    fetch('http://localhost:3000/user/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data.message === 'Hasło zmienione pomyślnie') {
            document.getElementById('passwordChangeMessage').textContent = data.message;
            document.getElementById('passwordChangeMessage').style.display = 'block';
        } else {
            alert(data.message);
        }
    })
    .catch(err => console.error('Błąd:', err));
});


// Walidacja hasła
const validatePassword = (password) => {
    const minLength = 8; // Minimalna długość hasła
    if (password.length < minLength) {
        return { valid: false, message: `Hasło musi mieć co najmniej ${minLength} znaków` };
    }
    const uniqueChars = new Set(password); // Użycie Set do unikalnych znaków
    if (uniqueChars.size < password.length) {
        return { valid: false, message: 'Hasło nie może zawierać powtarzających się znaków' };
    }
    return { valid: true };
};

//lista userów
// Po pomyślnym zalogowaniu i zwróceniu roli admina
if (data.role === 'admin') {
    document.getElementById('adminPanel').style.display = 'block';
    console.log("Żądanie do serwera o użytkoników")
    fetchUsers(); // Wywołaj funkcję pobierającą użytkowników
}

function fetchUsers() {
    fetch('http://localhost:3000/admin/users', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(users => {
        const userList = document.getElementById('userList');
        userList.innerHTML = ''; // Wyczyść wcześniejsze dane

        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.username} - Rola: ${user.role}`;
            console.log(user)
            userList.appendChild(li);
        });
    })
    .catch(err => console.error('Błąd podczas pobierania użytkowników:', err));
}



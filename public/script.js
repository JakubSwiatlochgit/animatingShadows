loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // żadanie logowania
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

            // inicjalizacja przyciskow wylogowania
            initializeLogoutButtons();
            initializeChangePasswordButtons();
            
        } else {
            document.getElementById('error-message').style.display = 'block';
        }
    })
    .catch(err => console.error(err));
});

// inicjalizacja wylogowań
function initializeLogoutButtons() {
    console.log('pobranie przyciskow');
    const logoutButtons = document.querySelectorAll('.logoutButton');
    logoutButtons.forEach(logoutButton => {
        // czyszczenie starych eventów
        logoutButton.removeEventListener('click', handleLogout);
        logoutButton.addEventListener('click', handleLogout);
    });
}

function handleLogout() {
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
        document.getElementById('login').style.display = 'block';
        alert(data.message);
    })
    .catch(err => console.error('Błąd:', err));
}

//zmiana hasła na userze
userChangePasswordButton.addEventListener('click', () => {
    const oldPassword = document.getElementById('userOldPassword').value;
    const newPassword = document.getElementById('userNewPassword').value;
    console.log(userChangePasswordButton)
    console.log('Old Password:', oldPassword);
    console.log('New Password:', newPassword);

    const validationResult = validatePassword(newPassword);
    if (!validationResult.valid) {
        alert(validationResult.message);
        return;
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


//lista userów
// tylko gdy rola to amdin
if (data.role === 'admin') {
    document.getElementById('adminPanel').style.display = 'block';
    console.log("Żądanie do serwera o użytkoników")
    fetchUsers();
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
        console.log("Pobrani użytkownicy:", users);
        const userList = document.getElementById('userList');
        userList.innerHTML = ''; // Wyczyść wcześniejsze dane
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.username} - Rola: ${user.role}`;
            userList.appendChild(li);
        });
        populateUserSelect(users); // Ustaw listę użytkowników do edycji
    })
    .catch(err => console.error('Błąd podczas pobierania użytkowników:', err));
}

//walidacja hasła
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


// Wypełnienie listy użytkowników w polu wyboru
function populateUserSelect(users) {
    const currentUsernameSelect = document.getElementById('currentUsernameSelect');
    currentUsernameSelect.innerHTML = '<option value="" disabled selected>Wybierz użytkownika</option>';
    users.forEach(user => {
        if (user.role === 'user') {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            currentUsernameSelect.appendChild(option);
            console.log(user.role)
        }
    });
}


function initializeChangePasswordButtons() {
    console.log('Inicjalizacja przycisku zmiany hasła');
    const changeUserPasswordButtons = document.querySelectorAll('.changeUserPasswordAdmin');
    changeUserPasswordButtons.forEach(button => {
        // Czyszczenie starych eventów
        button.removeEventListener('click', handleChangeUserPassword);
        button.addEventListener('click', handleChangeUserPassword);
    });
}
function handleChangeUserPassword() {
    const currentUsername = document.getElementById('currentUsernameSelect').value;
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    console.log("Próba aktualizacji użytkownika:", { currentUsername, newUsername, newPassword });

    // Wysyłanie zapytania do serwera
    fetch('http://localhost:3000/admin/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentUsername, newUsername, newPassword })
    })
    .then(res => {
        if (!res.ok) {
            console.log("Błąd odpowiedzi:", res.status);
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("Odpowiedź serwera na aktualizację użytkownika:", data);
        document.getElementById('updateMessage').textContent = data.message;
        document.getElementById('updateMessage').style.display = 'block';
        fetchUsers();  // Odśwież listę użytkowników
    })
    .catch(err => console.error('Błąd:', err));
}



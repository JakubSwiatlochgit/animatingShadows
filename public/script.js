// Backend
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
        console.log(data); // Sprawdź, co zwraca serwer
        if (data.token) {
            token = data.token;
            document.getElementById('login').style.display = 'none'; // Ukryj sekcję logowania

            // Użytkownik musi zmienić hasło
            if (data.mustChangePassword) {
                console.log('Musisz zmienić hasło.');
                document.getElementById('userPanel').style.display = 'block'; // Pokaż panel użytkownika
                document.getElementById('changePasswordSection').style.display = 'block'; // Pokaż sekcję zmiany hasła
            } else {
                console.log('Logowanie pomyślne, rola:', data.role);
                document.getElementById('userPanel').style.display = 'block'; // Pokaż panel użytkownika lub admina
                if (data.role === 'admin') {
                    document.getElementById('adminPanel').style.display = 'block';
                }
                alert('Zalogowano pomyślnie jako ' + data.role);
            }
        } else {
            document.getElementById('error-message').style.display = 'block';
        }
    })
    .catch(err => console.error(err));
});

// Obsługa zmiany hasła dla użytkownika
userChangePasswordButton.addEventListener('click', () => {
    const oldPassword = document.getElementById('userOldPassword').value;
    const newPassword = document.getElementById('userNewPassword').value;

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


// Obsługa wylogowania (zakończenia pracy)
logoutButton.addEventListener('click', () => {
    token = '';  // Czyścimy token po wylogowaniu
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    alert('Zostałeś wylogowany.');
});

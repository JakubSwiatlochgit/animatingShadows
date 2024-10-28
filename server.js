const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const JWT_SECRET = 'supersecretkey';  // Sekretny klucz do JWT

app.use(bodyParser.json());
app.use(cors());

let users = [
    {
        username: 'ADMIN',
        passwordHash: bcrypt.hashSync('admin123', 10),  // Hasło zakodowane bcryptem
        role: "admin",
        mustChangePassword: false
    },
    {
        username: 'USER',
        passwordHash: bcrypt.hashSync('user123', 10),
        role: "user",
        mustChangePassword: true  
    }
];
// start serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    console.log(user);

    if (user && bcrypt.compareSync(password, user.passwordHash)) {
        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        if (user.mustChangePassword) {
            console.log("musisz zmienic haslo");
            return res.json({ message: 'Musisz zmienić hasło', mustChangePassword: true, token });
        } else {
            console.log("nie musisz zmieniac hasla");
            if (user.role === 'admin') {
                console.log(users)
                return res.json({ token, role: user.role, users: users });
            }

            return res.json({ token, role: user.role });
        }
    } else {
        return res.status(401).json({ message: 'Login lub hasło niepoprawne' });
    }
});

app.post('/user/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const { oldPassword, newPassword } = req.body;

  console.log({ oldPassword, newPassword }); // Sprawdź dane

  if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Stare i nowe hasło są wymagane' });
  }

  if (!token) {
      return res.status(401).json({ message: 'Brak tokenu' });
  }

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(u => u.username === decoded.username && decoded.role === 'user');

      if (user) {
          console.log(user.passwordHash); // Sprawdź, czy hash hasła jest poprawny
          if (bcrypt.compareSync(oldPassword, user.passwordHash)) {
              const passwordValidation = validatePassword(newPassword);
              if (!passwordValidation.valid) {
                  return res.status(400).json({ message: passwordValidation.message });
              }
              user.passwordHash = bcrypt.hashSync(newPassword, 10);
              return res.json({ message: 'Hasło zmienione pomyślnie' });
          } else {
              return res.status(400).json({ message: 'Stare hasło jest niepoprawne' });
          }
      } else {
          return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
      }
  } catch (error) {
      console.error('Błąd JWT:', error);
      return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
});

//lista userów
app.get('/admin/users', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Brak tokenu' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin') {
            // Filtruj użytkowników z rolą 'user'
            const filteredUsers = users.filter(user => user.role === 'user');
            console.log("Filtered users: ", filteredUsers);
            return res.json(filteredUsers); 
        } else {
            return res.status(403).json({ message: 'Brak dostępu' });
        }
    } catch (error) {
        console.error('Błąd JWT:', error);
        return res.status(401).json({ message: 'Nieprawidłowy token' });
    }
});


app.post('/logout', (req, res) => {
    let revokedTokens = [];

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Header:', authHeader);
    console.log('Token:', token);
    
    if (token) {
        console.log("Zgłoszenie wylogowania tokenu:", token);
        
        // Dodaj logowanie do tablicy revokacji
        try {
            revokedTokens.push(token);
            console.log("Token wylogowany:", token);
            return res.json({ message: 'Wylogowano pomyślnie' });
        } catch (err) {
            console.error("Błąd przy próbie wylogowania:", err);
            return res.status(500).json({ message: 'Błąd serwera' });
        }
    } else {
        console.log("Brak tokenu w nagłówku");
        return res.status(401).json({ message: 'Brak tokenu' });
    }
});






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



// Aktualizacja danych użytkownika (dla admina)
app.post('/admin/update-user', (req, res) => {
    const { currentUsername, newUsername, newPassword } = req.body;
    console.log(currentUsername, newUsername, newPassword)
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === 'admin') {
        const user = users.find(u => u.username === currentUsername);
        if (user) {
            user.username = newUsername || user.username;
            if (newPassword) user.passwordHash = bcrypt.hashSync(newPassword, 10);
            return res.json({ message: 'Użytkownik zaktualizowany' });
        } else {
            return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
        }
    } else {
        return res.status(403).json({ message: 'Brak uprawnień' });
    }
});



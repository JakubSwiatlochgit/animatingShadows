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
        passwordHash: bcrypt.hashSync('user123', 10),  // Przykładowy użytkownik
        role: "user",
        mustChangePassword: true  
    }
];

// Walidacja hasła
const validatePassword = (password) => password.length >= 8;

// Endpoint logowania
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
  console.log(user)
    if (user && bcrypt.compareSync(password, user.passwordHash)) {
        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        if (user.mustChangePassword) {
          console.log("musisz zmienic haslo")
            return res.json({ message: 'Musisz zmienić hasło', mustChangePassword: true, token });
        } else {
          console.log("nie musisz zmienic haslo")
            return res.json({ token, role: user.role });
        }
    } else {
        return res.status(401).json({ message: 'Login lub hasło niepoprawne' });
    }
});

// Endpoint zmiany hasła
app.post('/admin/change-password', (req, res) => {
   

    console.log('Token:', token);
    const { token, oldPassword, newPassword } = req.body;
  
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.username === decoded.username);
        console.log(decoded)
        console.log(user)
        if (user && bcrypt.compareSync(oldPassword, user.passwordHash)) {
            if (validatePassword(newPassword)) {
                user.passwordHash = bcrypt.hashSync(newPassword, 10);
                user.mustChangePassword = false;
                return res.json({ message: 'Hasło zmienione pomyślnie' });
            } else {
                return res.status(400).json({ message: 'Hasło musi mieć co najmniej 8 znaków' });
            }
        } else {
            return res.status(400).json({ message: 'Stare hasło jest niepoprawne' });
        }
    } catch (error) {
      console.error('Błąd JWT:', error);
        return res.status(401).json({ message: 'Nieprawidłowy token' });
    }
});

// Uruchomienie serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});




// Endpoint zmiany hasła dla użytkownika
app.post('/user/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log('Nagłówki:', req.headers); // Logowanie nagłówków
  const token = authHeader && authHeader.split(' ')[1];  // Bezpieczne rozdzielenie nagłówka
  const { oldPassword, newPassword } = req.body;

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
          if (bcrypt.compareSync(oldPassword, user.passwordHash)) {
              if (validatePassword(newPassword)) {
                  user.passwordHash = bcrypt.hashSync(newPassword, 10);
                  return res.json({ message: 'Hasło zmienione pomyślnie' });
              } else {
                  return res.status(400).json({ message: 'Hasło musi mieć co najmniej 8 znaków' });
              }
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


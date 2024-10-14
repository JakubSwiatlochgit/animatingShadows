const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const JWT_SECRET = 'supersecretkey';

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let passwordSettings = {
  minLength: 8,
  requireSpecialCharacters: false,
  requireUpperLower: false
};



const users = [
    {
        username: 'ADMIN',
        passwordHash: bcrypt.hashSync('admin123', 10)
    }
];

const validatePassword = (password) => {
    const minLength = 8; 
    const requireSpecialCharacters = false;
    const requireUpperLower = false; 

    if (password.length < minLength) return false;
    if (requireSpecialCharacters && !/[\W\d]/.test(password)) return false;
    if (requireUpperLower && !( /[a-z]/.test(password) && /[A-Z]/.test(password))) return false;
    if (!checkUniqueCharacters(password)) return false; //walidacja unikalnosci

    return true;
};

const checkUniqueCharacters = (password) => {
    const charSet = new Set(password);
    return charSet.size === password.length;
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.passwordHash)) {
        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });

    } else {
        res.status(401).json({ message: 'Login lub hasło niepoprawne' });
    }
});

app.post('/admin/change-password', (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.username === decoded.username);

        if (user) {
            if (validatePassword(newPassword)) {
                user.passwordHash = bcrypt.hashSync(newPassword, 10);
                res.json({ message: 'Hasło zmienione pomyślnie' });
            } else {
                res.status(400).json({ message: 'Hasło nie spełnia wymagań' });
            }
        } else {
            res.status(404).json({ message: 'Użytkownik nie znaleziony' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Token nieprawidłowy' });
    }
});



app.post('/admin/save-settings', (req, res) => {
  const { token, settings } = req.body;

  console.log('Otrzymane dane:', settings);

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(u => u.username === decoded.username);

      if (user) {
          passwordSettings = { ...passwordSettings, ...settings }; //aktualizacja ustawien
          console.log('Nowe ustawienia:', passwordSettings); 
          res.json({ message: 'Ustawienia zapisane pomyślnie', settings: passwordSettings }); 
      } else {
          res.status(404).json({ message: 'Użytkownik nie znaleziony' });
      }
  } catch (error) {
      console.error('Błąd przy weryfikacji tokena:', error);
      res.status(401).json({ message: 'Token nieprawidłowy' });
  }
});


// Endpoint do pobierania ustawień
app.get('/admin/get-settings', (req, res) => {
  res.json(passwordSettings); //zwaraca aktualne ustawienia
});





// Endpoint do root (domyślny)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Uruchomienie serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

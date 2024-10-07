function validatePassword() {
  const password = document.getElementById('user-password').value;

  const minLengthRequirement = document.getElementById('min-length-requirement');
  const uniqueCharactersRequirement = document.getElementById('unique-characters-requirement');

  if (password.length >= 8) {
      minLengthRequirement.querySelector('.icon').textContent = '✔️';
      minLengthRequirement.querySelector('.icon').style.color = 'green';
  } else {
      minLengthRequirement.querySelector('.icon').textContent = '❌';
      minLengthRequirement.querySelector('.icon').style.color = 'red';
  }

  if (checkUniqueCharacters(password)) {
      uniqueCharactersRequirement.querySelector('.icon').textContent = '✔️';
      uniqueCharactersRequirement.querySelector('.icon').style.color = 'green';
  } else {
      uniqueCharactersRequirement.querySelector('.icon').textContent = '❌';
      uniqueCharactersRequirement.querySelector('.icon').style.color = 'red';
  }
}

function checkUniqueCharacters(password) {
  const charSet = new Set(password);
  return charSet.size === password.length;
}

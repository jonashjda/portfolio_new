const toggleButton = document.getElementById('menu-toggle');
const navLinks     = document.getElementById('navbar-links');

toggleButton.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

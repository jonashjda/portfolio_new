const toggleButton = document.getElementById('menu-toggle');
const navLinks = document.getElementById('navbar-links');

if (toggleButton && navLinks) {
  toggleButton.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
}

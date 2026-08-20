// ==========================================================================
// Mechanic Calculator - Common UI Controller (common.js)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
});

function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenuDropdown');

  if (!hamburgerBtn || !navMenu) return;

  // Toggle menu on button click
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      hamburgerBtn.focus();
    }
  });
}

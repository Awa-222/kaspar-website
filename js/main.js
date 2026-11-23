// Kaspar website — shared front-end behaviour
document.addEventListener('DOMContentLoaded', function () {
  var links = document.querySelectorAll('.nav-links a');
  var menu = document.querySelector('.nav-links');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
      }
    });
  });
});

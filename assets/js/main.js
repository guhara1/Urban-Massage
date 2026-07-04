// 모바일 내비 토글
(function () {
  var t = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (t && links) {
    t.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }
})();

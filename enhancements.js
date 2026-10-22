(function () {
  'use strict';
  var header = document.querySelector('header');
  if (!header) return;

  var source = document.createElement('div');
  source.className = 'source-provided';
  source.innerHTML = '<strong>Source note:</strong> This plan was supplied with a research snapshot dated 22 October 2026. It is published as a planning brief, not a live booking or legal verification. Recheck visas, flight schedules, hotel terms, ticket calendars, and customs rules before payment.';
  header.appendChild(source);

  var boxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
  if (boxes.length) {
    var progress = document.createElement('div');
    progress.className = 'trip-progress';
    progress.innerHTML = '<b>Departure checklist</b><span class="progress-status"></span><progress value="0" max="' + boxes.length + '"></progress><button type="button">Reset checklist</button>';
    header.appendChild(progress);
    var status = progress.querySelector('.progress-status');
    var meter = progress.querySelector('progress');
    function update() {
      var done = boxes.filter(function (box) { return box.checked; }).length;
      status.textContent = done + ' of ' + boxes.length + ' complete';
      meter.value = done;
    }
    boxes.forEach(function (box) { box.addEventListener('change', update); });
    progress.querySelector('button').addEventListener('click', function () {
      boxes.forEach(function (box, index) {
        box.checked = false;
        try { localStorage.removeItem('japan2027check' + index); } catch (_) {}
      });
      update();
    });
    update();
  }

  var links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  var sections = links.map(function (link) { return document.querySelector(link.getAttribute('href')); }).filter(Boolean);
  function setActive() {
    var y = window.scrollY + 105;
    var active = sections[0];
    sections.forEach(function (section) { if (section.offsetTop <= y) active = section; });
    links.forEach(function (link) { link.classList.toggle('active', active && link.getAttribute('href') === '#' + active.id); });
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

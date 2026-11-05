// Onboarding. Three steps, then it closes itself.
//
// The close logic below is carried verbatim from the premium template
// (2-onboarding), because ship-gate G16 greps the built JS for the
// tabs.getCurrent / tabs.remove pair. The rest is written for this extension:
// the template's own copy and demo are about filling web forms, and shipping
// that here would have put "Start filling forms" in front of someone who
// installed a QR reader.
(function () {
  var TOTAL = 3, i = 0;
  var steps = [].slice.call(document.querySelectorAll('.step'));
  var rail = document.getElementById('rail');
  var back = document.getElementById('back');
  var next = document.getElementById('next');
  var stepno = document.getElementById('stepno');

  for (var d = 0; d < TOTAL; d++) {
    var e = document.createElement('span');
    e.className = 'dot';
    rail.appendChild(e);
  }
  var dots = [].slice.call(rail.children);

  function render() {
    steps.forEach(function (s, n) { s.classList.toggle('on', n === i); });
    dots.forEach(function (dt, n) { dt.className = 'dot' + (n < i ? ' done' : n === i ? ' now' : ''); });
    back.style.visibility = i === 0 ? 'hidden' : 'visible';
    stepno.textContent = (i + 1) + ' of ' + TOTAL;
    next.textContent = i === TOTAL - 1 ? 'Start reading codes' : 'Next';
  }

  function go(n) {
    i = Math.max(0, Math.min(TOTAL - 1, n));
    render();
    try { chrome.storage && chrome.storage.local && chrome.storage.local.set({ qrr_onboard_step: i }); } catch (e) {}
  }

  next.addEventListener('click', function () { if (i === TOTAL - 1) { finish(); } else go(i + 1); });
  back.addEventListener('click', function () { go(i - 1); });
  document.getElementById('skip').addEventListener('click', finish);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (document.activeElement.tagName !== 'A') next.click();
    }
    if (e.key === 'ArrowLeft') back.click();
  });

  function finish() {
    try { chrome.storage && chrome.storage.local && chrome.storage.local.set({ qrr_onboardingComplete: true }); } catch (e) {}
    try {
      if (chrome.tabs && chrome.tabs.getCurrent) {
        chrome.tabs.getCurrent(function (t) { t && t.id != null ? chrome.tabs.remove(t.id) : window.close(); });
      } else window.close();
    } catch (e) { window.close(); }
  }

  render();
})();

// ─── Term Switcher ───
// English / English (US) toggle in the nav bar.
// US mode swaps football→soccer and diving→flopping client-side.
(function () {
  var LANGS = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'en-us', label: 'English (US)', flag: '🇺🇸' }
  ];

  var isUSMode = localStorage.getItem('lang-us') === '1';
  var currentLang = isUSMode ? 'en-us' : 'en';

  var nav = document.getElementById('navbar');
  if (!nav) return;

  var switcher = document.createElement('div');
  switcher.className = 'lang-switcher';

  var btn = document.createElement('button');
  btn.className = 'lang-btn';
  btn.setAttribute('aria-label', 'Select language');

  function buttonHTML(code) {
    var obj = code === 'en-us' ? LANGS[1] : LANGS[0];
    var dc = code === 'en-us' ? 'US' : 'EN';
    return '<span class="lang-flag">' + obj.flag + '</span><span class="lang-code">' + dc + '</span><span class="lang-arrow">▾</span>';
  }
  btn.innerHTML = buttonHTML(currentLang);

  var dropdown = document.createElement('div');
  dropdown.className = 'lang-dropdown';

  for (var i = 0; i < LANGS.length; i++) {
    (function (lang) {
      var a = document.createElement('a');
      a.href = '#';
      a.className = 'lang-option' + (lang.code === currentLang ? ' active' : '');
      a.innerHTML = '<span class="lang-flag">' + lang.flag + '</span>' + lang.label;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (lang.code === 'en-us') {
          localStorage.setItem('lang-us', '1');
          applyUSEnglish();
        } else {
          localStorage.removeItem('lang-us');
          revertUSEnglish();
        }
        btn.innerHTML = buttonHTML(lang.code);
        var options = dropdown.querySelectorAll('.lang-option');
        for (var j = 0; j < options.length; j++) options[j].classList.remove('active');
        a.classList.add('active');
        switcher.classList.remove('open');
      });
      dropdown.appendChild(a);
    })(LANGS[i]);
  }

  switcher.appendChild(btn);
  switcher.appendChild(dropdown);
  nav.appendChild(switcher);

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    switcher.classList.toggle('open');
  });

  document.addEventListener('click', function () {
    switcher.classList.remove('open');
  });

  // ─── UK → US replacement ───
  var REPLACEMENTS = [
    [/\bFootball\b/g, 'Soccer'],
    [/\bfootball\b/g, 'soccer'],
    [/\bFOOTBALL\b/g, 'SOCCER'],
    [/\bDiving\b/g, 'Flopping'],
    [/\bdiving\b/g, 'flopping'],
    [/\bDIVING\b/g, 'FLOPPING'],
    [/\bDives\b/g, 'Flops'],
    [/\bdives\b/g, 'flops'],
    [/\bDived\b/g, 'Flopped'],
    [/\bdived\b/g, 'flopped'],
    [/\bDive\b/g, 'Flop'],
    [/\bdive\b/g, 'flop']
  ];

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, A: 1 };

  function walkText(node, fn) {
    if (node.nodeType === 3) {
      fn(node);
    } else if (node.nodeType === 1 && !SKIP_TAGS[node.tagName]) {
      if (node.tagName === 'META' || node.tagName === 'LINK' || node.tagName === 'TITLE') return;
      // Elements marked data-no-swap keep their original wording (quotes, proper names)
      if (node.getAttribute && node.getAttribute('data-no-swap') !== null) return;
      for (var c = node.firstChild; c; c = c.nextSibling) {
        walkText(c, fn);
      }
    }
  }

  function applyUSEnglish() {
    walkText(document.body, function (textNode) {
      var text = textNode.nodeValue;
      var newText = text;
      for (var i = 0; i < REPLACEMENTS.length; i++) {
        newText = newText.replace(REPLACEMENTS[i][0], REPLACEMENTS[i][1]);
      }
      if (newText !== text) {
        textNode._originalText = text;
        textNode.nodeValue = newText;
      }
    });
    document.body.setAttribute('data-lang-us', '1');
  }

  function revertUSEnglish() {
    walkText(document.body, function (textNode) {
      if (textNode._originalText) {
        textNode.nodeValue = textNode._originalText;
        delete textNode._originalText;
      }
    });
    document.body.removeAttribute('data-lang-us');
  }

  if (isUSMode) {
    applyUSEnglish();
  }
})();

/** rename-raml.js — رمل امام علی → قرعه موکلین در کل UI */
(function () {
  'use strict';
  if (window.__KAFE_RENAME_RAML_V1__) return;
  window.__KAFE_RENAME_RAML_V1__ = true;

  function replaceInString(s) {
    if (!s || typeof s !== 'string') return s;
    var out = s;
    if (out.indexOf('رمل امام علی') !== -1) out = out.split('رمل امام علی').join('قرعه موکلین');
    if (out.indexOf('قرعه رمل امام علی') !== -1) out = out.split('قرعه رمل امام علی').join('قرعه موکلین');
    return out;
  }

  function walkText(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (t && t.indexOf('رمل') !== -1) {
        var n = replaceInString(t);
        if (n !== t) node.nodeValue = n;
      }
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = (node.tagName || '').toLowerCase();
    if (tag === 'script' || tag === 'style') return;
    if (node.childNodes) {
      for (var i = 0; i < node.childNodes.length; i++) walkText(node.childNodes[i]);
    }
  }

  function patchObjects() {
    try {
      if (typeof modalList !== 'undefined' && Array.isArray(modalList)) {
        modalList.forEach(function (m) {
          if (!m) return;
          if (m.id === 'ramlModal' || (m.title && String(m.title).indexOf('رمل') !== -1)) {
            m.title = 'قرعه موکلین';
          }
        });
      }
    } catch (e) {}
    try {
      var t = document.querySelector('#ramlModal .modal-glass-title');
      if (t) t.textContent = '🎲 قرعه موکلین';
    } catch (e) {}
    try {
      var btn = document.querySelector('#ramlModal button.btn, #ramlModal .btn');
      if (btn && btn.textContent && btn.textContent.indexOf('رمل') !== -1) {
        btn.textContent = btn.textContent.replace(/رمل/g, 'قرعه');
      }
    } catch (e) {}
  }

  function run() {
    patchObjects();
    try { walkText(document.body); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 800);
      setTimeout(run, 2000);
    });
  } else {
    run();
    setTimeout(run, 800);
    setTimeout(run, 2000);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 400);
    setTimeout(run, 1500);
  });
  setInterval(function () {
    try {
      document.querySelectorAll('#modalsHomeGrid .mh-label').forEach(function (el) {
        if (el.textContent && el.textContent.indexOf('رمل') !== -1) {
          el.textContent = replaceInString(el.textContent);
        }
      });
      var t = document.querySelector('#ramlModal .modal-glass-title');
      if (t && t.textContent.indexOf('رمل امام علی') !== -1) t.textContent = '🎲 قرعه موکلین';
    } catch (e) {}
  }, 2500);
})();

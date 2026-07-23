// js/timeline.js — 时间线页渲染逻辑（折叠式竹简展开）
// 功能：10 朝代默认折叠，点击朝代标签展开/收起该朝代条目
// 交互：点击 header 切换 .is-expanded class，CSS 控制展开动画

(function () {
  "use strict";

  if (!window.FACTS || !Array.isArray(window.FACTS)) {
    console.error("FACTS 数据未加载");
    return;
  }

  var FACTS = window.FACTS;
  var container = document.getElementById("timelineContainer");

  // 10 朝代固定顺序
  var DYNASTIES = [
    { name: "先秦",       range: "前 2070 — 前 221" },
    { name: "秦",         range: "前 221 — 前 206" },
    { name: "汉",         range: "前 202 — 220" },
    { name: "魏晋南北朝", range: "220 — 589" },
    { name: "隋唐",       range: "581 — 907" },
    { name: "五代十国",   range: "907 — 979" },
    { name: "宋",         range: "960 — 1279" },
    { name: "元",         range: "1271 — 1368" },
    { name: "明",         range: "1368 — 1644" },
    { name: "清",         range: "1636 — 1912" }
  ];

  var DYNASTY_NOTES = {};

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function chineseOrdinal(n) {
    var digits = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
    if (n === 10) return '拾';
    if (n < 10) return digits[n];
    if (n < 20) return '拾' + digits[n - 10];
    if (n < 100) return digits[Math.floor(n / 10)] + '拾' + (n % 10 ? digits[n % 10] : '');
    return digits[Math.floor(n / 100)] + '佰' + (n % 100 ? chineseOrdinal(n % 100) : '');
  }

  var idToIdx = {};
  FACTS.forEach(function (f, i) { idToIdx[f.id] = i + 1; });

  var grouped = {};
  FACTS.forEach(function (f) {
    if (!grouped[f.dynasty]) grouped[f.dynasty] = [];
    grouped[f.dynasty].push(f);
  });

  var html = '<div class="timeline-container">' + DYNASTIES.map(function (dyn) {
    var items = grouped[dyn.name] || [];
    var itemsHtml;
    if (items.length === 0) {
      itemsHtml = '<div class="timeline-empty">' + esc(DYNASTY_NOTES[dyn.name] || "本朝代暂未收录条目。") + '</div>';
    } else {
      itemsHtml = '<div class="timeline-list">'
        + items.map(function (f) {
          var idx = idToIdx[f.id] || 0;
          var ordinal = idx ? '第' + chineseOrdinal(idx) + '桩' : '';
          return ''
            + '<div class="timeline-item">'
            + '  <div class="timeline-item__body">'
            + '    <div class="timeline-item__ordinal">' + esc(ordinal) + '</div>'
            + '    <h3 class="timeline-item__title">'
            + '      <a href="fact.html?id=' + encodeURIComponent(f.id) + '">' + esc(f.title) + '</a>'
            + '    </h3>'
            + '    <p class="timeline-item__summary">' + esc(f.summary) + '</p>'
            + '    <span class="timeline-item__cat">' + esc(f.category) + '</span>'
            + '  </div>'
            + '</div>';
        }).join("")
        + '</div>';
    }
    // 朝代标签 — 竹简片 + 信息条
    return ''
      + '<section class="timeline-dynasty' + (items.length === 0 ? ' is-empty' : '') + '">'
      + '  <button class="timeline-dynasty__header" type="button" '
      + '    aria-expanded="false" aria-controls="dyn-' + esc(dyn.name) + '">'
      + '    <div class="timeline-dynasty__slip" aria-hidden="true"></div>'
      + '    <div class="timeline-dynasty__info">'
      + '      <h2 class="timeline-dynasty__name">' + esc(dyn.name) + '</h2>'
      + '      <span class="timeline-dynasty__count">' + esc(dyn.range) + ' · 共 ' + items.length + ' 条</span>'
      + '      <span class="timeline-dynasty__toggle" aria-hidden="true">展开</span>'
      + '    </div>'
      + '  </button>'
      + '  <div class="timeline-dynasty__content" id="dyn-' + esc(dyn.name) + '" role="region">'
      + '    <div class="timeline-dynasty__inner">'
      +      itemsHtml
      + '    </div>'
      + '  </div>'
      + '</section>';
  }).join("") + '</div>';

  container.innerHTML = html;

  // === 折叠/展开交互 ===
  var headers = container.querySelectorAll('.timeline-dynasty__header');
  headers.forEach(function (header) {
    header.addEventListener('click', function () {
      var section = header.closest('.timeline-dynasty');
      var isExpanded = section.classList.contains('is-expanded');

      if (isExpanded) {
        // 折叠
        section.classList.remove('is-expanded');
        header.setAttribute('aria-expanded', 'false');
        header.querySelector('.timeline-dynasty__toggle').textContent = '展开';
      } else {
        // 展开
        section.classList.add('is-expanded');
        header.setAttribute('aria-expanded', 'true');
        header.querySelector('.timeline-dynasty__toggle').textContent = '收起';
      }
    });
  });

  // === 默认展开第一个有内容的朝代 ===
  var firstWithContent = container.querySelector('.timeline-dynasty:not(.is-empty)');
  if (firstWithContent) {
    firstWithContent.classList.add('is-expanded');
    var h = firstWithContent.querySelector('.timeline-dynasty__header');
    h.setAttribute('aria-expanded', 'true');
    h.querySelector('.timeline-dynasty__toggle').textContent = '收起';
  }
})();

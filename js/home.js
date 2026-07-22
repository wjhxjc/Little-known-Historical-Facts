// js/home.js — 首页渲染逻辑
// 依赖：window.FACTS（来自 facts.js）
// 功能：① 6 分类 tab ② 卡片网格 ③ tab 筛选 ④ 搜索框（实时模糊匹配 title/summary/tags/content，与 tab 叠加）

(function () {
  "use strict";

  if (!window.FACTS || !Array.isArray(window.FACTS)) {
    console.error("FACTS 数据未加载");
    return;
  }

  var FACTS = window.FACTS;
  var CATEGORIES = ["全部", "帝王将相", "风俗生活", "文人轶事", "战争军事", "文化典籍", "美食风物"];
  var currentFilter = "全部";
  var currentQuery = "";

  var tabContainer = document.getElementById("filterTabs");
  var gridContainer = document.getElementById("factGrid");
  var emptyState = document.getElementById("emptyState");
  var searchInput = document.getElementById("searchInput");
  var searchClear = document.getElementById("searchClear");
  var searchMeta = document.getElementById("searchMeta");

  // === 工具：转义 HTML ===
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // === 工具：阿拉伯数字 → 中文大写数字 ===
  function chineseOrdinal(n) {
    var digits = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
    if (n === 10) return '拾';
    if (n < 10) return digits[n];
    if (n < 20) return '拾' + digits[n - 10];
    return digits[Math.floor(n / 10)] + '拾' + (n % 10 ? digits[n % 10] : '');
  }

  // === 工具：高亮匹配子串（大小写不敏感）===
  function highlight(text, query) {
    if (!query) return esc(text);
    var escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var re = new RegExp(escapedQuery, "gi");
    var html = "";
    var lastIdx = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      html += esc(text.slice(lastIdx, m.index));
      html += '<mark class="search-highlight">' + esc(m[0]) + '</mark>';
      lastIdx = m.index + m[0].length;
      // 避免零长度匹配死循环
      if (m[0].length === 0) re.lastIndex++;
    }
    html += esc(text.slice(lastIdx));
    return html;
  }

  // === 1. 渲染 tabs ===
  function renderTabs() {
    var counts = {};
    FACTS.forEach(function (f) {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    counts["全部"] = FACTS.length;

    var html = CATEGORIES.map(function (cat) {
      var isActive = cat === currentFilter ? " is-active" : "";
      var count = counts[cat] || 0;
      return '<button class="tab-btn' + isActive + '" data-filter="' + esc(cat) + '" type="button">'
        + esc(cat) + '<span class="tab-count">' + count + '</span>'
        + '</button>';
    }).join("");
    tabContainer.innerHTML = html;

    Array.prototype.forEach.call(tabContainer.querySelectorAll(".tab-btn"), function (btn) {
      btn.addEventListener("click", function () {
        currentFilter = btn.getAttribute("data-filter");
        Array.prototype.forEach.call(tabContainer.querySelectorAll(".tab-btn"), function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        renderGrid();
      });
    });
  }

  // === 2. 筛选逻辑：tab + 搜索叠加 ===
  function getFiltered() {
    var q = currentQuery.trim().toLowerCase();
    return FACTS.filter(function (f) {
      // tab 筛选
      if (currentFilter !== "全部" && f.category !== currentFilter) return false;
      // 搜索筛选
      if (!q) return true;
      var haystack = (
        f.title + " " + f.summary + " " + f.content + " " +
        f.tags.join(" ") + " " + f.dynasty + " " + f.category + " " + f.source
      ).toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  // === 3. 渲染卡片网格 ===
  function renderGrid() {
    var list = getFiltered();

    // 显示匹配数（仅当有搜索词时）
    if (currentQuery.trim()) {
      searchMeta.classList.remove("is-hidden");
      searchMeta.innerHTML = '寻得 <strong>' + list.length + '</strong> 条与「<strong>' + esc(currentQuery.trim()) + '</strong>」相关';
      searchClear.classList.remove("is-hidden");
    } else {
      searchMeta.classList.add("is-hidden");
      searchClear.classList.add("is-hidden");
    }

    if (list.length === 0) {
      gridContainer.innerHTML = "";
      emptyState.classList.remove("is-hidden");
      emptyState.textContent = currentQuery.trim()
        ? '— 未寻得与「' + currentQuery.trim() + '」相关之条目 —'
        : '— 此门类暂无条目 —';
      return;
    }
    emptyState.classList.add("is-hidden");

    var html = list.map(function (f) {
      var tagsHtml = (f.tags || []).slice(0, 3).map(function (t) {
        return '<span class="tag">' + highlight(t, currentQuery.trim()) + '</span>';
      }).join("");
      // 计算 fact 在全集中的序号（1-based），用于中文编号
      var factIdx = FACTS.findIndex(function (x) { return x.id === f.id; }) + 1;
      var ordinal = factIdx ? '第' + chineseOrdinal(factIdx) + '桩' : '';
      return ''
        + '<a class="fact-card" href="fact.html?id=' + encodeURIComponent(f.id) + '">'
        + '  <div class="fact-card__fold"></div>'
        + '  <div class="fact-card__body">'
        + '    <div class="fact-card__ordinal">' + esc(ordinal) + '</div>'
        + '    <span class="fact-card__category">' + esc(f.category) + '</span>'
        + '    <h3 class="fact-card__title">' + highlight(f.title, currentQuery.trim()) + '</h3>'
        + '    <p class="fact-card__summary">' + highlight(f.summary, currentQuery.trim()) + '</p>'
        + '    <div class="fact-card__meta">'
        + '      <div class="fact-card__tags">' + tagsHtml + '</div>'
        + '      <span class="fact-card__dynasty">' + highlight(f.dynasty, currentQuery.trim()) + '</span>'
        + '    </div>'
        + '  </div>'
        + '</a>';
    }).join("");
    gridContainer.innerHTML = html;
  }

  // === 4. 搜索事件（防抖 200ms）===
  var debounceTimer = null;
  searchInput.addEventListener("input", function (e) {
    var value = e.target.value;  // 立刻取值，避免 closure 在 setTimeout 内被覆盖
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      currentQuery = value;
      renderGrid();
    }, 200);
  });

  // 清除按钮
  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    currentQuery = "";
    renderGrid();
    searchInput.focus();
  });

  // === 启动 ===
  renderTabs();
  renderGrid();
})();

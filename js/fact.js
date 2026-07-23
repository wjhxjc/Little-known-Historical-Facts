// js/fact.js — 详情页渲染逻辑
// 依赖：window.FACTS（来自 facts.js）
// 功能：① 读取 URL ?id=xxx 找到对应 fact ② 渲染详情（正文/出处/标签）③ 推荐相关条目（同分类优先 + 同 tag 加分）

(function () {
  "use strict";

  if (!window.FACTS || !Array.isArray(window.FACTS)) {
    console.error("FACTS 数据未加载");
    return;
  }

  var FACTS = window.FACTS;
  var detailContainer = document.getElementById("factDetail");
  var relatedSection = document.getElementById("relatedSection");

  // === 解析 URL ?id=xxx ===
  function getQueryParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }

  // === 工具：转义 HTML ===
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // === 工具：阿拉伯数字 → 中文大写数字（壹贰叁...拾贰拾）===
  function chineseOrdinal(n) {
    var digits = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
    if (n === 10) return '拾';
    if (n < 10) return digits[n];
    if (n < 20) return '拾' + digits[n - 10];
    return digits[Math.floor(n / 10)] + '拾' + (n % 10 ? digits[n % 10] : '');
  }

  // === 找到当前条目的序号（1-based）===
  function factIndex(fact) {
    for (var i = 0; i < FACTS.length; i++) {
      if (FACTS[i].id === fact.id) return i + 1;
    }
    return 0;
  }

  // === 找到当前条目 ===
  var id = getQueryParam("id");
  var fact = null;
  if (id) {
    for (var i = 0; i < FACTS.length; i++) {
      if (FACTS[i].id === id) { fact = FACTS[i]; break; }
    }
  }

  // === 404 处理 ===
  if (!fact) {
    document.title = "未找到该条目 · 历史冷知识";
    detailContainer.innerHTML = ''
      + '<div class="error-block">'
      + '  <div class="error-block__code">404</div>'
      + '  <div class="error-block__msg">未找到该条目，或链接已失效。</div>'
      + '  <a class="tab-btn is-active" href="index.html">返回首页</a>'
      + '</div>';
    relatedSection.innerHTML = "";
    return;
  }

  // === 更新页面标题 ===
  document.title = fact.title + " · 历史冷知识";

  // === 计算中文编号 ===
  var ordinal = factIndex(fact);
  var ordinalStr = ordinal ? '第' + chineseOrdinal(ordinal) + '桩 · ' : '';

  // === 渲染详情主体 ===
  var tagsHtml = (fact.tags || []).map(function (t) {
    return '<span class="tag">' + esc(t) + '</span>';
  }).join("");

  detailContainer.innerHTML = ''
    + '<article class="fact-detail">'
    + '  <a class="fact-detail__back" href="index.html">← 返回列表</a>'
    + '  <span class="fact-detail__category">' + esc(fact.category) + '</span>'
    + '  <h1 class="fact-detail__title">' + esc(ordinalStr) + esc(fact.title) + '</h1>'
    + '  <div class="fact-detail__meta">'
    + '    <span><strong>朝代</strong>' + esc(fact.dynasty) + '</span>'
    + '    <span><strong>分类</strong>' + esc(fact.category) + '</span>'
    + '  </div>'
    + '  <div class="fact-detail__content">' + esc(fact.content) + '</div>'
    + '  <div class="fact-detail__tags">' + tagsHtml + '</div>'
    + '  <div class="fact-detail__source">'
    + '    <h2>参考 · 史料出处</h2>'
    + '    <p>' + esc(fact.source) + '</p>'
    + '    <p class="fact-detail__disclaimer">本条内容为科普趣读，引用前请查阅原典核实，详见<a href="about.html#main">关于页免责声明</a>。</p>'
    + '  </div>'
    + '</article>';

  // === 计算相关推荐：同分类优先，同 tag 加分，排除自己，最多 3 条 ===
  function relatedTo(f) {
    var myTags = {};
    (f.tags || []).forEach(function (t) { myTags[t] = 1; });
    var scored = FACTS
      .filter(function (x) { return x.id !== f.id; })
      .map(function (x) {
        var score = 0;
        if (x.category === f.category) score += 10;
        if (x.dynasty === f.dynasty) score += 4;
        (x.tags || []).forEach(function (t) { if (myTags[t]) score += 3; });
        return { fact: x, score: score };
      })
      .filter(function (s) { return s.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });

    // 若有得分项，取前 3；否则回退到任意 3 条
    var picks = scored.slice(0, 3).map(function (s) { return s.fact; });
    if (picks.length < 3) {
      var used = {};
      picks.forEach(function (p) { used[p.id] = 1; });
      used[f.id] = 1;
      for (var j = 0; j < FACTS.length && picks.length < 3; j++) {
        if (!used[FACTS[j].id]) { picks.push(FACTS[j]); used[FACTS[j].id] = 1; }
      }
    }
    return picks;
  }

  var related = relatedTo(fact);
  if (related.length === 0) {
    relatedSection.innerHTML = "";
  } else {
    var cardsHtml = related.map(function (f) {
      return ''
        + '<a class="related__item" data-cat="' + esc(f.category) + '" href="fact.html?id=' + encodeURIComponent(f.id) + '">'
        + '  <span class="related__item-cat">' + esc(f.category) + '</span>'
        + '  <h3 class="related__item-title">' + esc(f.title) + '</h3>'
        + '  <div class="related__item-meta">'
        + '    <span>' + esc(f.dynasty) + '</span>'
        + '  </div>'
        + '</a>';
    }).join("");
    relatedSection.innerHTML = ''
      + '<h2 class="related__title">相关考辨</h2>'
      + '<div class="related__list">' + cardsHtml + '</div>';
  }
})();

// js/transitions.js — 页面切换淡入淡出增强
// 作用：
//   1. 现代浏览器（Chrome 111+）已通过 CSS `@view-transition { navigation: auto }` 自动启用同源导航过渡
//   2. 本脚本作为增强：拦截内部链接点击，用 document.startViewTransition 包装跳转
//   3. 旧浏览器（不支持 startViewTransition）直接跳转，无动画降级
//   4. 尊重 prefers-reduced-motion：用户设置减弱动效时，跳过过渡直接跳转
(function () {
  "use strict";

  // 不支持 startViewTransition 的浏览器直接退出
  if (!document.startViewTransition) return;

  // 检查用户是否设置了减弱动效
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // 拦截同源链接点击
  document.addEventListener('click', function (e) {
    // 仅左键点击（中键/右键不拦截，保留新标签打开）
    if (e.button !== 0) return;
    // 已被修饰键（Ctrl/Cmd/Shift）触发的点击不拦截（新标签/新窗口）
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    // 跳过外部链接、mailto、tel、纯 hash、target=_blank
    if (link.target === '_blank') return;
    if (href.startsWith('mailto:')) return;
    if (href.startsWith('tel:')) return;
    if (href.startsWith('#')) return;
    // 跳过 javascript: 链接
    if (href.startsWith('javascript:')) return;

    // 解析为绝对 URL，判断是否同源
    var url;
    try {
      url = new URL(href, location.href);
    } catch (_) {
      return;
    }
    if (url.origin !== location.origin) return;

    // 如果仅 hash 变化（同页锚点），不拦截
    if (url.pathname === location.pathname && url.search === location.search) return;

    // 阻止默认跳转，用 view transition 包装
    e.preventDefault();

    document.startViewTransition(function () {
      // 在新视图里跳转 — 浏览器会自动捕获新旧 DOM 状态做过渡
      location.href = href;
    });
  });

  // 监听 reduced-motion 变化（用户在运行时改了设置）
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
    if (e.matches) {
      // 用户开启减弱动效 — 移除 @view-transition（通过加 body class）
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  });
})();

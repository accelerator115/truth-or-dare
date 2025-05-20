/* 修复在某些平台上点击事件无效的问题 */

// 在触摸开始时设置标记
document.addEventListener('touchstart', () => {
  window.__touchStarted = true;
}, { passive: true });

// 修复点击事件在某些情况下不触发的问题
document.addEventListener('click', (e) => {
  if (!window.__touchStarted) {
    // 如果没有先触发touchstart，则可能是模拟点击，增强兼容性
    e.__fixed = true;
  }
  window.__touchStarted = false;
}, { capture: true });

// 处理点击事件冒泡被阻止的情况
document.body.addEventListener('touchend', (e) => {
  window.__touchStarted = false;
  // 允许原生点击事件传播
  setTimeout(() => {
    window.__touchStarted = false;
  }, 100);
}, { passive: true });

// 修复表单输入问题
const fixInputFocus = () => {
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      setTimeout(() => {
        input.focus();
      }, 100);
    });
  });
};

// 等文档加载完成后执行修复
if (document.readyState === 'complete') {
  fixInputFocus();
} else {
  document.addEventListener('DOMContentLoaded', fixInputFocus);
}

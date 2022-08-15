
// 跨过CSP 执行自定义脚本
document.addEventListener('message', (event) => {
  eval(`(() => {${event.detail}})()`)
})
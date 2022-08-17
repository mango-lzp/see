// 跨过CSP 执行自定义脚本
document.addEventListener('message', (event) => {
  const { scripts, id } = event.detail
  try{
    eval(`(() => {${scripts}})()`)
  } catch (e) {
    window.postMessage({
      type: 'extension_error',
      log: JSON.stringify(e?.message),
      id
    })
  }
})
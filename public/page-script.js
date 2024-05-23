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

// // JS运行中的大部分异常（包括语法错误），都会触发window上的error事件执行注册的函数，不同于try catch，onerror既可以感知同步异常也可以感知异步任务的异常（除了promise异常），使用方法如下：

// // message：错误信息（字符串）。
// // source：发生错误的脚本URL（字符串）
// // lineno：发生错误的行号（数字）
// // colno：发生错误的列号（数字）
// // error：Error对象（对象）
// window.onerror = function(message, source, lineno, colno, error) {
//   logger.log('捕获到异常：',{ message, source, lineno, colno, error });
// }

// // 作为以上方案的补充版，promise异常的捕获依赖于全局注册unhandledrejection，使用方法如下
//  window.addEventListener('unhandledrejection', (e) => {
//    console.error('catch', e)
//  }, true)
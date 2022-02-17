const port = chrome.runtime.connect()

window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(event.data.text);
  }
}, false);


window.onload = async () => {
  
  // remove extra text
  document.addEventListener('copy', (event) => {
    chrome.storage.sync.get('clearTextFormat', (data) => {
      if(data.clearTextFormat) {
        event.clipboardData.setData('text', document.getSelection())
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        console.log('clear text format', event.clipboardData)
      }
      console.log(event.clipboardData.getData('text'))
    })
  }, true)
}

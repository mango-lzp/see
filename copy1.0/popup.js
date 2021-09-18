const doCopy = () => {
  const setUserSelect = (e) => {
    let current = e.target
    while(current.parentNode && current.nodeName !== 'DIV' && current !== document.body){
      current.style.userSelect = 'auto'
      current = current.parentNode
      console.log('set user select')
    }
    document.removeEventListener('click', setUserSelect)
  }

  const isChosen = window.getSelection ? window.getSelection().type === 'Range' : document.selection.createRange().text
  ;(window.getSelection && console.log(window.getSelection()))
  if(isChosen){
    document.execCommand('copy')
  } else {
   document.addEventListener('click', setUserSelect)
  }
}

window.onload = async () => {
  let copyButton = document.getElementById("copy-text")
  
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const doFnInPage = fn => chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: fn,
  })

  doFnInPage(() => {
    // remove extra text
    document.addEventListener('copy', (event) => {
      event.clipboardData.setData('text', document.getSelection())
      event.preventDefault()
    })
  })

  copyButton.addEventListener('click', () => {
    doFnInPage(doCopy)
  })
}

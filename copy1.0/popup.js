
window.onload = () => {
  let copyButton = document.getElementById("copy-text")
  
  copyButton.addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const doFnInPage = fn => chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: fn,
    })
    
    const doCopy = () => {
      const isChosen = window.getSelection ? window.getSelection().type === 'Range' : document.selection.createRange().text
      ;(window.getSelection && console.log(window.getSelection()))
      if(isChosen){
        document.execCommand('copy')
      } else {
        const setUserSelect = (e) => {
          let current = e.target
          while(current.parentNode && current.nodeName !== 'DIV' && current !== document.body){
            current.style.userSelect = 'auto'
            current = current.parentNode
            console.log('set user select')
          }
          document.removeEventListener('click', setUserSelect)
        }
       document.addEventListener('click', setUserSelect)
      }
    }

    doFnInPage(doCopy)
  })
}

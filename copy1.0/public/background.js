// chrome.runtime.onInstalled.addListener(() => {
  console.log('background loaded')
  chrome.storage.sync.get('extends', ({ extends: data }) => {
    getCurrentTab().then((tab) => {
      Object.values(data || {}).map(card => {
        if(card.enable) {
          console.log(`i m exec ${card.title}`, card.scripts.slice(0, 10))
          execEval(card.scripts, tab.id)
        }
      })

    })
  })
// })


/*
 * We can manage page DOM from this function, but cannot share variables directly
 * 
 * 'eval' call or injecting script tag with inline source in this context cause CSP error,
 *  but we can load script from web_accessible_resources and execute script string there 
 * 
 * document.dispatchEvent with custom event is used for transferring the payload to the page script
 */
function injectPageScript(scripts) {
  const script = document.createElement("script");

  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', chrome.runtime.getURL("page-script.js"));

  script.onload = () => {
    /*
      * Using document.dispatchEvent instead window.postMessage by security reason
      * https://github.com/w3c/webextensions/issues/78#issuecomment-915272953
      */
    document.dispatchEvent(new CustomEvent('message', {
      detail: scripts
    }))
    document.head.removeChild(script)
  }

  document.head.appendChild(script);
}

function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs
      .query({
        active: true,
        currentWindow: true,
      }, (tabs) => {
        const tab = tabs[0]
        if (tab) resolve(tab)
      })
  })
}

function execEval (scripts, tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: injectPageScript,
    args: [scripts],
  })
}

function RunAllCustomScripts() {
  chrome.storage.sync.get('extends', ({ extends: data }) => {
    getCurrentTab().then((tab) => {
      Object.values(data || {}).map(card => {
        if(card.enable) {
          console.log(`i m exec ${card.title}`, card.scripts.slice(0, 10))
          execEval(card.scripts, tab.id)
        }
      })

    })
  })
}

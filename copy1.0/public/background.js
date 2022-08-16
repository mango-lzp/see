// chrome.runtime.onInstalled.addListener(() => {
// })

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
  const executeScript = (id) => {
    console.log(`i m exec scripts: ${scripts.slice(0, 10)}...`)
    chrome.scripting.executeScript({
      target: { tabId: id },
      func: (_scr) => document.dispatchEvent(new CustomEvent('message', { detail: _scr })),
      args: [scripts],
    })
  }

  if(tabId !== undefined) {
    executeScript(tabId)
  } else {
    getCurrentTab().then(tab => executeScript(tab.id))
  }
}

// 页面load完成时需要触发
function RunAllEnableCustomScripts() {
  chrome.storage.sync.get((data) => {
    getCurrentTab().then((tab) => {
      Object.values(data || {})
      .filter(card => card.type === 'extends')
      .map(card => {
        if(card.enable) {
          execEval(card.scripts, tab.id)
        }
      })
    })
  })
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request === "runEnableScripts") {
      RunAllEnableCustomScripts()
    }
  }
)

// 用户更改状态时触发
chrome.storage.onChanged.addListener(function (changes) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if(newValue?.type === 'extends') {
      if(!oldValue?.enable && newValue?.enable) {
        execEval(newValue.scripts)
      }
      if(oldValue?.enable && !newValue?.enable) {
        // 关闭开关时触发
        if(newValue.destroy) {
          execEval(newValue.destroy)
        }
      }
    }
  }
})

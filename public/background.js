function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs
      .query({
        active: true,
        lastFocusedWindow: true,
      }, (tabs) => {
        const tab = tabs[0]
        if (tab) resolve(tab)
        else {
          console.log('active tab not found')
          resolve(null)
        }
      })
  })
}

function execEval ({ scripts, id: scriptId }, tabId) {
  const executeScript = (id) => {
    console.log(`i m exec scripts: ${scripts.slice(0, 20)}...`)
    chrome.scripting.executeScript({
      target: { tabId: id },
      func: (_scr, _srcId ) => document.dispatchEvent(
        new CustomEvent('message', {
          detail: {
            scripts: _scr,
            id: _srcId
          } 
        })
      ),
      args: [scripts, scriptId],
    })
  }

  if(tabId !== undefined) {
    executeScript(tabId)
  } else {
    getCurrentTab().then(tab => tab && executeScript(tab.id))
  }
}

function isPass (url, config) {
  let pass = false
  const ruleList = config?.ruleList || []
  const matchList = ruleList.filter(r => url.includes(r.name))
  let mostMatch = matchList[0]
  matchList.forEach(m => {
    if(m.name.length > mostMatch.name.length) {
      mostMatch = m
    }
  })
  if(mostMatch) {
    if(mostMatch.enable) {
      pass = true
    }
  } else if(config?.enable) {
    pass = true
  }
  console.log('mostMatch', mostMatch)
  return pass
}

// 页面load完成时需要触发
function RunAllEnableCustomScripts(tabId, url) {
  chrome.storage.sync.get((data) => {
    Object.values(data || {})
    .filter(card => card.type === 'extends')
    .map(card => {
      // 匹配规则列表，以规则为准。 没有则采用全局默认
      if(isPass(url, card)) {
        execEval({ scripts: card.scripts, id: card.id }, tabId)
      }
    })
  })
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request === "runEnableScripts") {
      RunAllEnableCustomScripts(sender.tab.id, sender.tab.url)
    }

    if(request?.type === 'extension_error') {
      const id = request.id
      let url = 'the extension'
      if(sender?.tab?.url) {
        url = new URL(sender.tab.url).origin
      }
      
      chrome.storage.sync.get(id, data => {
        const value = data[id]
        const logs = value?.logs || []
        logs.push(`from ${url}: ${request.log}`)
    
        chrome.storage.sync.set({ [id]: Object.assign({}, value, { logs })})
      })
    }
  }
)

// 用户更改状态时触发
chrome.storage.onChanged.addListener(async function (changes) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if(newValue?.type === 'extends') {
      const tab = await getCurrentTab()
      const isPassNew = isPass(tab?.url, newValue)
      const isPassOld = isPass(tab?.url, oldValue)

      // 开启触发
      if(( !isPassOld && isPassNew) ) {
        execEval(newValue)
      }
      // 打开的时候修改了脚本。
      if(newValue?.scripts !== oldValue?.scripts && isPassNew) {
        execEval(newValue)
      }

      if(isPassOld && !isPassNew) {
        // 关闭开关时触发
        if(newValue.destroy) {
          execEval({ scripts: newValue.destroy, id: newValue.id })
        }
      }
    }
  }
})

import { v4 } from 'uuid'

interface PlainObject {
  [key: string]: any
}

function storageGet<T extends PlainObject> (key: string): Promise<T>
function storageGet<T extends PlainObject> (key: string[]): Promise<T[]>
function storageGet<T extends PlainObject> (key: T): Promise<T>
function storageGet<T extends PlainObject> (): Promise<T>
function storageGet<T extends PlainObject> (key?: string | string[] | PlainObject) { return null as any }

class ChromeStorage {
  get: typeof storageGet = (key?: string | string[] | PlainObject) => new Promise(
    (resolve: (arg: any) => void) => {
      if(key) {
        if(typeof key === 'string') {
          chrome.storage.sync.get(key, data => resolve(data[key]))
        }
        else if(Array.isArray(key)) {
          chrome.storage.sync.get(key, data => resolve(key.map(k => data[k])))
        } else {
          chrome.storage.sync.get(key, data => resolve(data))
        }
      } else {
        chrome.storage.sync.get(data => resolve(data))
      }
    }
  )
  
  getExtendList = () => this.get().then(data => {
    const extendsList = Object.values(data).filter((item: any) => item.type === 'extends');
    // 优先按照自定义排序字段排序，如果没有则按创建时间排序
    return extendsList.sort((a: any, b: any) => {
      // 如果两个项目都有 order 字段，按 order 排序
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // 如果只有 a 有 order 字段，a 排在前面
      if (a.order !== undefined) {
        return -1;
      }
      // 如果只有 b 有 order 字段，b 排在前面
      if (b.order !== undefined) {
        return 1;
      }
      // 都没有 order 字段，按创建时间排序
      return (b.createDate || 0) - (a.createDate || 0);
    });
  })
  
  set = <T extends PlainObject>(key: string, data: T) => new Promise<T>(resolve => {
    this.get(key).then(old => {
      const newValue = Object.assign({ createDate: Date.now() }, old, data, { lastModify: Date.now() })

      if(old?.logs?.length && (newValue.scripts !== old?.scripts || newValue.destroy !== old?.destroy)) {
        (newValue as PlainObject)['logs'] = []
      }

      chrome.storage.sync.set({
        [key]: newValue
      }, () => resolve(newValue))
    })
  })

  remove = (key: string) => chrome.storage.sync.remove(key)
}

const storage = new ChromeStorage()

const genUuid = () => v4().replace(/-/g, '')

const classnames = (...nameList: any[]) => {
  return nameList.map(name => {
    if(typeof name === 'string') {
      return name
    }
    if(typeof name === 'object') {
      return Object.entries(name).filter(([, value]) => !!value).map(([key]) => key).join(' ')
    }
  })
  .filter(name => name)
  .join(' ')
}

function getCurrentTab() {
  return new Promise<chrome.tabs.Tab | null>((resolve) => {
    chrome.tabs
      .query({
        active: true,
        lastFocusedWindow: true,
      }, (tabs) => {
        const tab = tabs[0]
        if (tab) resolve(tab)
        else {
          console.trace('active tab not found')
          resolve(null)
        }
      })
  })
}

class PageDataController {
  getPageDataById = (id: string) => {
    return new Promise<{ log?: string, loading?: boolean, [key: string]: any } | null>(resolve => {
      getCurrentTab().then(tab => {
        if(tab) {
          chrome.tabs.sendMessage(tab?.id!, { type: 'getPageData', id }, (response) => {
            resolve(response)
          })
        } else {
          resolve(null)
        }
      })
    })
  }

  setPageDataById = (id: string, data) => {
    return new Promise<{ log?: string, loading?: boolean } | null>(resolve => {
      getCurrentTab().then(tab => {
        if(tab) {
          chrome.tabs.sendMessage(tab?.id!, { type: 'setPageData', id, data }, (response) => {
            resolve(response)
          })
        } else {
          resolve(null)
        }
      })
    })
  }

  clearLog = (id: string) => {
    getCurrentTab().then(tab => {
      console.log('clear log', id)
      chrome.tabs.sendMessage(tab?.id!, { type: 'clearLog', id })
    })
  }
}

const page = new PageDataController()

function getMatchRule (url, ruleList) {
  const matchList = ruleList.filter(r => url?.includes(r.name))
  let mostMatch = matchList[0]
  matchList.forEach(m => {
    if(m.name.length > mostMatch.name.length) {
      mostMatch = m
    }
  })
  return mostMatch
}

function isPass (url, config) {
  let pass = false
  const ruleList = config?.ruleList || []
  const mostMatch = getMatchRule(url, ruleList)
  if(mostMatch) {
    if(mostMatch.enable) {
      pass = true
    }
  } else if(config?.enable) {
    pass = true
  }
  return pass
}

export {
  storage,
  genUuid,
  classnames,
  page,
  isPass,
  getMatchRule
}

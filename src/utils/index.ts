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

  getExtendList = () => this.get().then(data => Object.values(data).filter((item: any) => item.type === 'extends'))

  set = <T extends PlainObject>(key: string, data: T) => new Promise<T>(resolve => {
    this.get(key).then(old => {
      const newValue = Object.assign({ createDate: new Date().getTime() }, old, data)

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
    return new Promise<{ log?: string, loading?: boolean } | null>(resolve => {
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

  clearLog = (id: string) => {
    getCurrentTab().then(tab => {
      console.log('clear log', id)
      chrome.tabs.sendMessage(tab?.id!, { type: 'clearLog', id })
    })
  }
}

const page = new PageDataController()

export {
  storage,
  genUuid,
  classnames,
  page
}

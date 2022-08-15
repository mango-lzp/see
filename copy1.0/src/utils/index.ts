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

  set = <T extends PlainObject>(key: string, data: T) => new Promise<T>(resolve => {
    this.get(key).then(_data => {
      const newValue = Object.assign({ createDate: new Date().getTime() }, _data, data)
      chrome.storage.sync.set({
        [key]: newValue
      }, () => resolve(newValue))
    })
  })

  remove = (key: string) => chrome.storage.sync.remove(key)
}

const storage = new ChromeStorage()

const genUuid = () => v4().replace(/-/g, '')


export {
  storage,
  genUuid
}

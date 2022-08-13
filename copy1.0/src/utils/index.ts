import { v4 } from 'uuid'

export const getChromeStorageSync = key => new Promise(
  resolve => chrome.storage.sync.get(key, data => resolve(data[key]))
)

const genUuid = () => v4().replace(/-/g, '')

const setStorage = (key, data) => new Promise(resolve => {
  if(!data.id) throw new Error('set storage data should has id')
  const id = data.id
  getChromeStorageSync(key)
    .then((extendsObj: any) => {
      const obj = extendsObj || {}
      const old = obj[id] || { type: key, createDate: new Date() }
      chrome.storage.sync.set({
        [key]: {
          ...obj,
          [id]: Object.assign(old, data)
        }
      }, () => resolve(null))
    })
})

const deleteStorage = (key, id) => {
  getChromeStorageSync(key).then((obj: any) => {
    Reflect.deleteProperty(obj || {}, id)
    chrome.storage.sync.set({ [key]: obj })
  })
}

// const getExtendsStorage = id => getChromeStorageSync('extends').then(obj => (obj || {})[id] || {})

export {
  setStorage,
  deleteStorage,
  genUuid
}

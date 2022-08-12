import { v4 } from 'uuid'
// const Initialize = async (initial, keyList) => {
//   await Promise.all(
//     keyList.map(async key => {
//       return new Promise(resolve => {
//         chrome.storage.sync.get(key, (data) => {
//           Object.assign(initial, { [key]: data[key] })
//           resolve()
//         })
//       })
//     })
//   )
// }

/**
  <div class="block" id='read-all'>
    <div class="svg-wrap">
      <img src='minus-circle.svg' />
    </div>
    title
  </div>
 */
// const addCustomItem = (title, scripts) => {
//   const dom = document.createElement('div')
//   dom.className = 'block'
//   const id = genUuid()
//   dom.id = id
//   dom.innerHTML = `
//     <div class="svg-wrap">
//       <img src='minus-circle.svg' />
//     </div>
//     ${title}
//   `

//   $('#item-container').appendChild(dom)

//   setExtendsStorage({
//     id,
//     title,
//     scripts,
//     enable: false,
//   })
// }

// const genUuid = () => v4().replace(/-/g, '')

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
      const old = obj[id] || {}
      chrome.storage.sync.set({
        [key]: {
          ...obj,
          [id]: Object.assign(old, data, { type: key })
        }
      }, () => resolve(null))
    })
})

// const getExtendsStorage = id => getChromeStorageSync('extends').then(obj => (obj || {})[id] || {})

export {
  setStorage,
  genUuid
}

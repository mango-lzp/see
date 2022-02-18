const Initialize = async (initial, keyList) => {
  await Promise.all(
    keyList.map(async key => {
      return new Promise(resolve => {
        chrome.storage.sync.get(key, (data) => {
          Object.assign(initial, { [key]: data[key] })
          resolve()
        })
      })
    })
  )
}

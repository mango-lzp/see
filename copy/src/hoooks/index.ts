import { useEffect, useRef } from "react"

type ICallback = () => any
export const useMount = (cb: ICallback) => useEffect(() => {
  const destroy = cb()
  if(typeof destroy === 'function') {
    return destroy
  }
}, [])


export const useUpdateEffect = (cb: ICallback, deps: any[]) => {
  const first = useRef(true)
  useMount(() => { first.current = false })

  return useEffect(() => {
    if(!first.current) {
      cb()
    }
  }, deps)
}
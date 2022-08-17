import { useEffect, useRef } from "react"

type ICallback = () => any

// 允许使用async fn
export const useMount = (cb: ICallback) => useEffect(() => cb(), [])


export const useUpdateEffect = (cb: ICallback, deps: any[]) => {
  const first = useRef(true)
  useMount(() => { first.current = false })

  return useEffect(() => {
    if(!first.current) {
      cb()
    }
  }, deps)
}
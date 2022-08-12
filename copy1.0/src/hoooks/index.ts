import { useEffect } from "react"

type ICallback = () => any

// 允许使用async fn
export const useMount = (cb: ICallback) => useEffect(() => cb(), [])
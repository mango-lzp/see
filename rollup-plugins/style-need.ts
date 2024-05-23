// import { ConfigEnv, UserConfig, Plugin, ResolvedConfig } from "vite"
// import fs from 'fs'
// import { resolve } from 'path'



// export const StyleNeedMiddleware = () => {
//   let viteConfig: ResolvedConfig
//   let isSourcemap = false
//   // 组件库按需引用css样式
//   const libList = [
//     {
//       libName: "antd",
//       style: name => `antd/es/${name}/style`
//     }
//   ]
//   const codeIncludesLibraryName = (code: string) => {
//     return !libList.every(({ libName }) => !new RegExp(`('${libName}')|("${libName}")`).test(code))
//   }

//   const addImportToCode = (
//     code: string, 
//     command: ResolvedConfig['command']
//   ) => {
  
//     const { importMaps, codeRemoveOriginImport } = parseImportModule(code, libList, command)
  
//     let importStr = ''
  
//     libList.forEach(({ libName, style = () => false, camel2DashComponentName = true }) => {
//       if (importMaps[libName]) {
//         importMaps[libName].forEach(item => {
//           if (camel2DashComponentName) {
//             item = paramCase(item)
//           }
//           let stylePath = style(item)
//           const styleImportString = stylePathHandler(stylePath)
//           importStr += styleImportString
//         })
//       }
//     })
  
//     return `${importStr}${codeRemoveOriginImport}`
//   }
  
//   return {
//     name: 'style-need-plugin',
//     configResolved: (config) => {
//       isSourcemap = !!config.build?.sourcemap
//       viteConfig = config
//     },
//     transform (code, id) {
//       if(!/(node_modules)/.test(id) && codeIncludesLibraryName(code)) {
//         const sourcemap = this?.getCombinedSourcemap()
//         return {
//           code: code,
//           map: isSourcemap ? sourcemap : null
//         }
//       }
//     }
//   } as Plugin
// }
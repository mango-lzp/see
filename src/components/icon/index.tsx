import React from "react"
import InlineSVG from 'react-inlinesvg'
import { classnames } from "../../utils"
import { IconTypes } from "./type"
import './style.css'

interface IIconProp extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  type: IconTypes
  size?: number
  color?: string
}

export const Icon = ({ type, size = 16, className, style, ...res }: IIconProp) => {
  const svgUrl = new URL(`../../assets/${type}.svg`, import.meta.url).href

  return <span
    className={classnames(className, 'icon')}
    style={{ fontSize: size, ...style }}
    {...res}
  >
    <InlineSVG
      style={{ fill: 'currentColor' }}
      src={svgUrl}
      uniquifyIDs={true}
    />
  </span>
}
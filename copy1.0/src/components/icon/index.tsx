import React from "react"
import InlineSVG from 'react-inlinesvg'
import { classnames } from "../../utils"
import { IconTypes } from "./type"
import './style.css'

interface IIconProp {
  type: IconTypes
  size?: number
  style?: React.CSSProperties
  color?: string
  className?: string
}

export const Icon = ({ type, size = 16, className, style }: IIconProp) => {
  const svgUrl = new URL(`../../assets/${type}.svg`, import.meta.url).href

  return <span
    className={classnames(className, 'icon')}
    style={{ fontSize: size, ...style }}
  >
    <InlineSVG
      style={{ fill: 'currentColor' }}
      src={svgUrl}
      uniquifyIDs={true}
    />
  </span>
}
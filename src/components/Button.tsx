import React from 'react'

interface Props {
  className?: string
  id?: string
  children?: React.ReactNode | string
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const Button: React.FC<Props> = ({ id, className, children, onClick }) => {
  return (
    <button onClick={onClick} className={className} id={id}>
      {children}
    </button>
  )
}

export default Button

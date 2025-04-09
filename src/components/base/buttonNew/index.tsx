import React,  { type FC, MouseEventHandler } from 'react';
// import Spinner from '@/app/components/base/spinner';

export type IButtonProps = {
  type?: string
  className?: string
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: MouseEventHandler<HTMLDivElement>
}

const Button: FC<IButtonProps> = ({
  type,
  disabled,
  children,
  className,
  onClick,
  loading = false
}) => {
  let style = 'cursor-pointer';
  switch (type) {
    case 'primary':
      style = (disabled || loading) ? 'bg-primary-600/75 cursor-not-allowed text-white' : 'bg-primary-600 hover:bg-primary-600/75 hover:shadow-md cursor-pointer text-white hover:shadow-sm';
      break;
    default:
      style = disabled ? 'border-solid border border-gray-200 bg-gray-200 cursor-not-allowed text-gray-800' : 'border-solid border border-gray-200 cursor-pointer text-gray-500 hover:shadow-sm hover:border-gray-300';
      break;
  }

  return (
    <div
      className={`flex justify-center items-center content-center h-9 leading-5 rounded-lg px-4 py-2 text-base ${style} ${className && className}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );
};

export default React.memo(Button);

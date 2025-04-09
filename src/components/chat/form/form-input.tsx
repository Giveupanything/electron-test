import { Input } from 'antd';
import type { FC } from 'react';
import { memo } from 'react';

const { TextArea } = Input;

interface InputProps {
  form: any
  value: string
  onChange: (variable: string, value: string) => void
}
const FormInput: FC<InputProps> = ({
  form,
  value,
  onChange
}) => {
  const {
    type,
    label,
    required,
    max_length,
    variable
  } = form;

  if(type === 'paragraph') {
    return (
      <TextArea
        value={value}
        rows={3}
        className="resize-none !bg-gray-100 !border-none hover:bg-gray-100 focus:shadow-none"
        onChange={e => onChange(variable, e.target.value)}
        placeholder={`${label}${!required ? `(选填)` : ''}`}
      />
    );
  }

  return (
    <input
      className="grow h-9 rounded-lg bg-gray-100 px-2.5 outline-none appearance-none w-full"
      value={value || ''}
      maxLength={max_length}
      onChange={e => onChange(variable, e.target.value)}
      placeholder={`${label}${!required ? `(选填)` : ''}`}
    />
  );
};

export default memo(FormInput);

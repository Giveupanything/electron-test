import { useCallback } from 'react';
import Input from './form-input';
// import { FileUploaderInAttachmentWrapper } from '@/app/components/base/file-uploader';
// import { InputVarType } from '@/typings/app';
import { Select } from 'antd';
import './form.css';
import { useChatContext } from '@/context/chat-context';

const Form = () => {
  const {
    // appParams,
    inputsForms,
    newConversationInputs,
    newConversationInputsRef,
    handleNewConversationInputsChange
  } = useChatContext();

  const handleFormChange = useCallback((variable: string, value: any) => {
    handleNewConversationInputsChange({
      ...newConversationInputsRef.current,
      [variable]: value
    });
  }, [newConversationInputsRef, handleNewConversationInputsChange]);

  const renderField = (form: any) => {
    const {
      label,
      required,
      variable,
      options
    } = form;

    if(form.type === 'text-input' || form.type === 'paragraph') {
      return (
        <Input
          form={form}
          value={newConversationInputs[variable]}
          onChange={handleFormChange}
        />
      );
    }
    if(form.type === 'number') {
      return (
        <input
          className="grow h-9 rounded-lg bg-gray-100 px-2.5 outline-none appearance-none"
          type="number"
          value={newConversationInputs[variable] || ''}
          onChange={e => handleFormChange(variable, e.target.value)}
          placeholder={`${label}${!required ? `(选填)` : ''}`}
        />
      );
    }
    // if(form.type === InputVarType.singleFile) {
    //   return (
    //     <FileUploaderInAttachmentWrapper
    //       value={newConversationInputs[variable] ? [newConversationInputs[variable]] : []}
    //       onChange={files => handleFormChange(variable, files[0])}
    //       fileConfig={{
    //         allowed_file_types: form.allowed_file_types,
    //         allowed_file_extensions: form.allowed_file_extensions,
    //         allowed_file_upload_methods: form.allowed_file_upload_methods,
    //         number_limits: 1,
    //         fileUploadConfig: (appParams as any).system_parameters
    //       }}
    //     />
    //   );
    // }
    // if(form.type === InputVarType.multiFiles) {
    //   return (
    //     <FileUploaderInAttachmentWrapper
    //       value={newConversationInputs[variable]}
    //       onChange={files => handleFormChange(variable, files)}
    //       fileConfig={{
    //         allowed_file_types: form.allowed_file_types,
    //         allowed_file_extensions: form.allowed_file_extensions,
    //         allowed_file_upload_methods: form.allowed_file_upload_methods,
    //         number_limits: form.max_length,
    //         fileUploadConfig: (appParams as any).system_parameters
    //       }}
    //     />
    //   );
    // }

    return (
      <Select
        className="h-[36px] w-full bg-gray-100 custom-select rounded-lg"
        // popupClassName="bg-gray-100"
        value={newConversationInputs[variable]}
        options={options.map((option: string) => ({ value: option, name: option }))}
        onChange={item => {
          handleFormChange(variable, item as string);
        }}
        placeholder={`${label}${!required ? `(选填)` : ''}`}
      />
    );
  };

  if(!inputsForms.length) return null;

  return (
    <div className="mb-4 py-2">
      {
        inputsForms.map(form => (
          <div
            key={form.variable}
            className={`flex mb-3 last-of-type:mb-0 text-sm text-gray-900`}
          >
            <div className={`shrink-0 mr-2 py-2 w-[128px]`}>{form.label}</div>
            {renderField(form)}
          </div>
        ))
      }
    </div>
  );
};

export default Form;

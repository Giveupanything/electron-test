import { InputVarType, TransferMethod } from '@/typings/app';
import { InputForm } from '@/utils/utils';
import { message } from 'antd';
import { useCallback } from 'react';

export const useCheckInputsForms = () => {

  const checkInputsForm = useCallback((inputs: Record<string, any>, inputsForm: InputForm[]) => {
    let hasEmptyInput = '';
    let fileIsUploading = false;
    const requiredVars = inputsForm.filter(({ required }) => required);

    if(requiredVars?.length) {
      requiredVars.forEach(({ variable, label, type }) => {
        if(hasEmptyInput) return;

        if(fileIsUploading) return;

        if(!inputs[variable]) hasEmptyInput = label as string;

        if((type === InputVarType.singleFile || type === InputVarType.multiFiles) && inputs[variable]) {
          const files = inputs[variable];
          if(Array.isArray(files)) fileIsUploading = files.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId);
          else fileIsUploading = files.transferMethod === TransferMethod.local_file && !files.uploadedId;
        }
      });
    }

    if(hasEmptyInput) {
      message.warning(`${hasEmptyInput}不能为空`);
      return false;
    }

    if(fileIsUploading) {
      message.warning('请等待文件上传完成');
      return;
    }

    return true;
  }, []);

  return {
    checkInputsForm
  };
};

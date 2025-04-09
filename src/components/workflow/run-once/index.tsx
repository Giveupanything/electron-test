import React, { useCallback, type FC } from 'react';
import Select from '@/components/base/select';
import type { PromptConfig, VisionFile, VisionSettings, FileEntity } from '@/types/app';
import Button from '@/components/base/buttonNew';
import { PlayIcon } from '@heroicons/react/24/solid';
import { FileUploaderInAttachmentWrapper } from '@/components/base/file-uploader';
import { Input } from 'antd';
// import TextGenerationImageUploader from '@/components/base/image-uploader/text-generation-image-uploader';

const getProcessedFiles = (files: FileEntity[]) => {
  return files.filter(file => file.progress !== -1).map(fileItem => ({
    type: fileItem.supportFileType,
    transfer_method: fileItem.transferMethod,
    url: fileItem.url || '',
    upload_file_id: fileItem.uploadedId || ''
  }));
};

export type IRunOnceProps = {
  promptConfig: PromptConfig | null
  inputs: Record<string, any>
  inputsRef: React.MutableRefObject<Record<string, any>>
  onInputsChange: (inputs: Record<string, any>) => void
  onSend: () => void
  visionConfig: VisionSettings
  onVisionFilesChange: (files: VisionFile[]) => void
}
const RunOnce: FC<IRunOnceProps> = ({
  promptConfig,
  inputs,
  inputsRef,
  onInputsChange,
  onSend,
  visionConfig,
  onVisionFilesChange
}) => {

  const onClear = () => {
    const newInputs: Record<string, any> = {};
    promptConfig?.prompt_variables.forEach((item) => {
      newInputs[item.key] = '';
    });
    onInputsChange(newInputs);
  };

  const handleInputsChange = useCallback((newInputs: Record<string, any>) => {
    onInputsChange(newInputs);
    inputsRef.current = newInputs;
  }, [onInputsChange, inputsRef]);

  return (
    <div className="">
      <section>
        {/* input form */}
        <form>
          {promptConfig?.prompt_variables.map(item => (
            <div className="w-full mt-4" key={item.key}>
              <label className="text-gray-900 text-sm font-medium">{item.name}</label>
              <div className="mt-2">
                {item.type === 'select' && (
                  <Select
                    className="w-full"
                    defaultValue={inputs[item.key]}
                    onSelect={(i) => {
                      onInputsChange({ ...inputs, [item.key]: i.value });
                    }}
                    items={(item.options || []).map(i => ({ name: i, value: i }))}
                    allowSearch={false}
                    bgClassName="border bg-gray-50"
                  />
                )}
                {item.type === 'string' && (
                  <Input
                    type="text"
                    className="block w-full p-2 text-gray-900 border border-transparent hover:border hover:border-gray-300 rounded-lg bg-gray-50 sm:text-xs outline-none"
                    placeholder={`${item.name}${!item.required ? `可选` : ''}`}
                    value={inputs[item.key]}
                    onChange={(e) => {
                      onInputsChange({ ...inputs, [item.key]: e.target.value });
                    }}
                    maxLength={item.max_length || 48}
                  />
                )}
                {item.type === 'paragraph' && (
                  <textarea
                    className="block w-full h-[104px] p-2 text-gray-900 border border-transparent hover:border hover:border-gray-300 rounded-lg bg-gray-50 sm:text-xs outline-none"
                    placeholder={`${item.name}${!item.required ? `可选` : ''}`}
                    value={inputs[item.key]}
                    onChange={(e) => {
                      onInputsChange({ ...inputs, [item.key]: e.target.value });
                    }}
                  />
                )}
                {item.type === 'number' && (
                  <Input
                    type="number"
                    className="block w-full p-2 text-gray-900 border border-transparent hover:hover:border-gray-300 rounded-lg bg-gray-50 sm:text-xs outline-none"
                    placeholder={`${item.name}${!item.required ? `可选` : ''}`}
                    value={inputs[item.key]}
                    onChange={(e) => {
                      onInputsChange({ ...inputs, [item.key]: e.target.value });
                    }}
                  />
                )}
                {item.type === 'file' && (
                  <FileUploaderInAttachmentWrapper
                    onChange={(files) => {
                      handleInputsChange({ ...inputsRef.current, [item.key]: getProcessedFiles(files)[0] });
                    }}
                    fileConfig={{
                      ...item.config,
                      fileUploadConfig: (visionConfig as any).fileUploadConfig
                    }}
                  />
                )}
                {item.type === 'file-list' && (
                  <FileUploaderInAttachmentWrapper
                    onChange={(files) => {
                      handleInputsChange({ ...inputsRef.current, [item.key]: getProcessedFiles(files) });
                    }}
                    fileConfig={{
                      ...item.config,
                      fileUploadConfig: (visionConfig as any).fileUploadConfig
                    }}
                  />
                )}
              </div>
            </div>
          ))}
          {
            visionConfig?.enabled && (
              <div className="w-full mt-4">
                <div className="text-gray-900 text-sm font-medium">图片上传</div>
                <div className="mt-2">
                  {/* <TextGenerationImageUploader
                    settings={visionConfig}
                    onFilesChange={files => onVisionFilesChange(files.filter(file => file.progress !== -1).map(fileItem => ({
                      type: 'image',
                      transfer_method: fileItem.type,
                      url: fileItem.url,
                      upload_file_id: fileItem.fileId
                    })))}
                  /> */}
                </div>
              </div>
            )
          }
          {promptConfig?.prompt_variables?.length > 0 && (
            <div className="mt-4 h-[1px] bg-gray-100" />
          )}
          <div className="w-full mt-4">
            <div className="flex items-center justify-between">
              <Button
                className="!h-8 !p-3"
                onClick={onClear}
                disabled={false}
              >
                <span className="text-[13px]">清空</span>
              </Button>
              <Button
                // type="primary"
                className="!h-8 !pl-3 !pr-4 bg-[#2563eb]"
                onClick={onSend}
                disabled={false}
              >
                <PlayIcon className="shrink-0 w-4 h-4 mr-1 text-white" aria-hidden="true" />
                <span className="text-[13px] text-white">运行</span>
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};
export default React.memo(RunOnce);

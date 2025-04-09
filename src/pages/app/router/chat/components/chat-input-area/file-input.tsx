import { useCallback } from 'react';
import { FileUpload } from '../../types';
import { FILE_EXTS, SupportUploadFileTypes } from './constants';
import { useFile } from './useFile';
import { useChatContext } from '../../context/chat-context';
import { useStore } from '../../context/file-context';
import { useSelector } from '@turbotools/react';

type FileInputProps = {
  fileConfig: FileUpload
}
const FileInput = ({
  fileConfig
}: FileInputProps) => {

  const { handleLocalFileUpload } = useFile(fileConfig);
  const { apiKey } = useChatContext();
  const { files } = useStore(useSelector(['files']));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFiles = e.target.files;

    // console.log('targetFiles:>> ', targetFiles);

    if(targetFiles) {
      if(fileConfig.number_limits) {
        for(let i = 0; i < targetFiles.length; i++) {
          if(i + 1 + files.length <= fileConfig.number_limits) {
            handleLocalFileUpload(targetFiles[i], apiKey);
          }
        }
      } else {
        handleLocalFileUpload(targetFiles[0], apiKey);
      }
    }
  }, [apiKey, handleLocalFileUpload]);

  const allowedFileTypes = fileConfig.allowed_file_types;
  const isCustom = allowedFileTypes?.includes(SupportUploadFileTypes.custom);
  const exts = isCustom ? (fileConfig.allowed_file_extensions || []) : (allowedFileTypes?.map(type => FILE_EXTS[type]) || []).flat().map(item => `.${item}`);
  const accept = exts.join(',');

  return (
    <input
      className="absolute block inset-0 opacity-0 text-[0] w-full disabled:cursor-not-allowed cursor-pointer"
      onClick={e => ((e.target as HTMLInputElement).value = '')}
      type="file"
      onChange={handleChange}
      accept={accept}
      disabled={!!(fileConfig.number_limits && files.length >= fileConfig?.number_limits)}
      multiple={!!fileConfig.number_limits && fileConfig.number_limits > 1}
    />
  );
};

export default FileInput;

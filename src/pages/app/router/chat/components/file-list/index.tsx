import { useStore } from '../../context/file-context';
import { FileEntity, FileUpload } from '../../types';
import { SupportUploadFileTypes } from '../chat-input-area/constants';
import { useFile } from '../chat-input-area/useFile';
import cn from '@/utils/classnames';
import FileImageItem from './file-image-item';
import FileItem from './file-item';

type FileListProps = {
    className?: string
    files: FileEntity[]
    apiKey: string
    onRemove?: (fileId: string) => void
    onReUpload?: (fileId: string, apiKey: string) => void
    showDeleteAction?: boolean
    showDownloadAction?: boolean
    canPreview?: boolean
  }
export const FileList = ({
  className,
  files,
  apiKey,
  onReUpload,
  onRemove,
  showDeleteAction = true,
  showDownloadAction = false,
  canPreview = true
}: FileListProps) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {
        files.map((file) => {
          if(file.supportFileType === SupportUploadFileTypes.image) {
            return (
              <FileImageItem
                key={file.id}
                apiKey={apiKey}
                file={file}
                showDeleteAction={showDeleteAction}
                showDownloadAction={showDownloadAction}
                onRemove={onRemove}
                onReUpload={onReUpload}
                canPreview={canPreview}
              />
            );
          }

          return (
            <FileItem
              key={file.id}
              apiKey={apiKey}
              file={file}
              showDeleteAction={showDeleteAction}
              showDownloadAction={showDownloadAction}
              onRemove={onRemove}
              onReUpload={onReUpload}
              canPreview={canPreview}
            />
          );
        })
      }
    </div>
  );
};

type FileListInChatInputProps = {
    fileConfig: FileUpload
    apiKey: string
  }
export const FileListInChatInput = ({
  fileConfig,
  apiKey
}: FileListInChatInputProps) => {
  const files = useStore(s => s.files);
  const {
    handleRemoveFile,
    handleReUploadFile
  } = useFile(fileConfig);

  return (
    <FileList
      apiKey={apiKey}
      files={files}
      onReUpload={handleReUploadFile}
      onRemove={handleRemoveFile}
    />
  );
};
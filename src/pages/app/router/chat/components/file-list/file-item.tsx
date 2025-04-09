import {
  RiCloseLine,
  RiDownloadLine
} from '@remixicon/react';
import { useState } from 'react';
import cn from '@/utils/classnames';
import { FileEntity } from '../../types';
import { downloadFile, fileIsUploaded, getFileAppearanceType, getFileExtension } from '../chat-input-area/utils';
import { Button } from 'antd';
import FileTypeIcon from '@/components/base/file-type-icon';
import { formatFileSize } from '../chat-input-area/format';
import ProgressCircle from '@/components/base/progress-bar/progress-circle';
import ReplayLine from '@/components/base/icon/ReplayLine';
import AudioPreview from './audio-preview';
import VideoPreview from './video-preview';
import PdfPreview from './pdf-preview';

type FileItemProps = {
  file: FileEntity
  showDeleteAction?: boolean
  showDownloadAction?: boolean
  canPreview?: boolean
  apiKey: string
  onRemove?: (fileId: string) => void
  onReUpload?: (fileId: string, apiKey: string) => void
}
const FileItem = ({
  file,
  showDeleteAction,
  showDownloadAction = true,
  apiKey,
  onRemove,
  onReUpload,
  canPreview
}: FileItemProps) => {
  const { id, name, type, progress, url, base64Url, isRemote } = file;
  const [previewUrl, setPreviewUrl] = useState('');
  const ext = getFileExtension(name, type, isRemote);
  const uploadError = progress === -1;

  let tmp_preview_url = url || base64Url;
  if(!tmp_preview_url && file?.originalFile) tmp_preview_url = URL.createObjectURL(file.originalFile.slice()).toString();

  return (
    <>
      <div
        className={cn(
          'group/file-item relative p-2 w-[144px] h-[68px] rounded-lg border-[0.5px] border-[#10182814] bg-[#fcfcfd] shadow-xs',
          !uploadError && 'hover:bg-[#FFFFFF]',
          uploadError && 'border border-[#FDA29B] bg-[#FEF3F2]',
          uploadError && 'hover:border-[0.5px] hover:border-[#FDA29B] bg-[#FEE4E2]'
        )}
      >
        {
          showDeleteAction && (
            <Button
              className="hidden group-hover/file-item:flex absolute -right-1.5 -top-1.5 p-0 w-5 h-5 rounded-full z-[11]"
              onClick={() => onRemove?.(id)}
            >
              <RiCloseLine className="w-4 h-4 text-[#354052]" />
            </Button>
          )
        }
        <div
          className="mb-1 h-8 line-clamp-2 text-xs text-[#676f83] break-all cursor-pointer"
          title={name}
          onClick={() => canPreview && setPreviewUrl(tmp_preview_url || '')}
        >
          {name}
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center text-xs text-[#676f83]">
            <FileTypeIcon
              size="sm"
              type={getFileAppearanceType(name, type)}
              className="mr-1"
            />
            {
              ext && (
                <>
                  {ext}
                  <div className="mx-1">·</div>
                </>
              )
            }
            {
              !!file.size && formatFileSize(file.size)
            }
          </div>
          {
            showDownloadAction && tmp_preview_url && (
              <Button
                className="hidden group-hover/file-item:flex absolute -right-1 -top-1"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(tmp_preview_url || '', name);
                }}
              >
                <RiDownloadLine className="w-3.5 h-3.5 text-[#676f83]" />
              </Button>
            )
          }
          {
            progress >= 0 && !fileIsUploaded(file) && (
              <ProgressCircle
                percentage={progress}
                size={12}
                className="shrink-0"
              />
            )
          }
          {
            uploadError && (
              <ReplayLine
                className="w-4 h-4 text-text-tertiary"
                onClick={() => onReUpload?.(id, apiKey)}
              />
            )
          }
        </div>
      </div>
      {
        type.split('/')[0] === 'audio' && canPreview && previewUrl && (
          <AudioPreview
            title={name}
            url={previewUrl}
            onCancel={() => setPreviewUrl('')}
          />
        )
      }
      {
        type.split('/')[0] === 'video' && canPreview && previewUrl && (
          <VideoPreview
            title={name}
            url={previewUrl}
            onCancel={() => setPreviewUrl('')}
          />
        )
      }
      {
        type.split('/')[1] === 'pdf' && canPreview && previewUrl && (
          <PdfPreview
            url={previewUrl}
            onCancel={() => {
              setPreviewUrl('');
            }}
          />
        )
      }
    </>
  );
};

export default FileItem;

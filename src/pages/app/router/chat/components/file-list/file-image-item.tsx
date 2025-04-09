import {
  RiCloseLine,
  RiDownloadLine
} from '@remixicon/react';
import { FileEntity } from '../../types';
import { Button } from 'antd';
import FileImageRender from './file-image-render';
import ProgressCircle from '@/components/base/progress-bar/progress-circle';
import ReplayLine from '@/components/base/icon/ReplayLine';
import { downloadFile, fileIsUploaded } from '../chat-input-area/utils';

type FileImageItemProps = {
  file: FileEntity
  showDeleteAction?: boolean
  showDownloadAction?: boolean
  canPreview?: boolean
  apiKey: string
  onRemove?: (fileId: string) => void
  onReUpload?: (fileId: string, apiKey: string) => void
}
const FileImageItem = ({
  file,
  showDeleteAction,
  showDownloadAction,
  apiKey,
  canPreview,
  onRemove,
  onReUpload
}: FileImageItemProps) => {
  const { id, progress, base64Url, url, name } = file;

  return (
    <>
      <div className="group/file-image relative cursor-pointer">
        {
          showDeleteAction && (
            <Button
              className="hidden group-hover/file-image:flex absolute -right-1.5 -top-1.5 p-0 w-5 h-5 rounded-full z-[11]"
              onClick={() => onRemove?.(id)}
            >
              <RiCloseLine className="w-4 h-4 text-[#354052]" />
            </Button>
          )
        }
        <FileImageRender
          className="w-[68px] h-[68px] shadow-md"
          canPreview={canPreview}
          imageUrl={base64Url || url || ''}
          showDownloadAction={showDownloadAction}
        />
        {
          progress >= 0 && !fileIsUploaded(file) && (
            <div className="absolute inset-0 flex items-center justify-center border-[2px] border-[#fff] bg-[#10182866] z-10">
              <ProgressCircle
                percentage={progress}
                size={12}
                circleStrokeColor="stroke-components-progress-white-border"
                circleFillColor="fill-transparent"
                sectorFillColor="fill-components-progress-white-progress"
              />
            </div>
          )
        }
        {
          progress === -1 && (
            <div className="absolute inset-0 flex items-center justify-center border-[2px] border-[#FDA29B] bg-[#F044384D] z-10">
              <ReplayLine
                className="w-5 h-5"
                onClick={() => onReUpload?.(id, apiKey)}
              />
            </div>
          )
        }
        {
          showDownloadAction && (
            <div className="hidden group-hover/file-image:block absolute inset-0.5 bg-[#10182866] bg-opacity-[0.3] z-10">
              <div
                className="absolute bottom-0.5 right-0.5  flex items-center justify-center w-6 h-6 rounded-lg bg-[#FFFFFFF2] shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(url || base64Url || '', name);
                }}
              >
                <RiDownloadLine className="w-4 h-4 text-text-tertiary" />
              </div>
            </div>
          )
        }
      </div>
    </>
  );
};

export default FileImageItem;

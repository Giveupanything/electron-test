import cn from '@/utils/classnames';
import { Image } from 'antd';

type FileImageRenderProps = {
  imageUrl: string
  className?: string
  alt?: string
  canPreview?: boolean
  onLoad?: () => void
  onError?: () => void
  showDownloadAction?: boolean
}
const FileImageRender = ({
  imageUrl,
  className,
  alt,
  canPreview = true,
  onLoad,
  onError,
  showDownloadAction
}: FileImageRenderProps) => {
  return (
    <div className={cn('border-[2px] border-[#fff]', className)}>
      {/* <img
        className={cn('w-full h-full object-cover', showDownloadAction && 'cursor-pointer')}
        alt={alt || 'Preview'}
        onLoad={onLoad}
        onError={onError}
        src={imageUrl}
      /> */}

      <Image
        width="100%"
        className={cn('w-full h-full object-cover', showDownloadAction && 'cursor-pointer')}
        alt={alt || 'Preview'}
        onLoad={onLoad}
        onError={onError}
        src={imageUrl}
        preview={canPreview}
      />
    </div>
  );
};

export default FileImageRender;

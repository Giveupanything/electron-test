import { useState } from 'react';
import { FILE_URL_REGEX } from '../constants';
import cn from '@/utils/classnames';
import Button from '@/components/base/buttonNew/btn';
import { RiLink } from '@remixicon/react';
import { useFile } from './hooks';
import { Popover } from 'antd';

// type FileFromLinkOrLocalProps = {
// //   showFromLink?: boolean
// //   showFromLocal?: boolean
// //   trigger: (open: boolean) => React.ReactNode
// //   fileConfig: FileUpload
// }
// const FileLinkLocal = ({
// //   showFromLink = true,
// //   showFromLocal = true,
// //   trigger,
// //   fileConfig
// }): FileFromLinkOrLocalProps => {
//   const files = useStore(s => s.files);
//   const [open, setOpen] = useState(false);
//   const [url, setUrl] = useState('');
//   const [showError, setShowError] = useState(false);
//   const disabled = !!fileConfig.number_limits && files.length >= fileConfig.number_limits;
//   const handleSaveUrl = () => {
//     if(!url) return;

//     if(!FILE_URL_REGEX.test(url)) {
//       setShowError(true);
//       return;
//     }
//     // handleLoadFileFromLink(url);
//     setUrl('');
//   };

//   return ;
// };

export default function FileLinkLocal({ fileConfig }) {
  const [url, setUrl] = useState('');
  const { handleLoadFileFromLink } = useFile(fileConfig);
  const [showError, setShowError] = useState(false);
  const handleSaveUrl = () => {
    if(!url) return;

    if(!FILE_URL_REGEX.test(url)) {
      setShowError(true);
      return;
    }
    handleLoadFileFromLink(url);
    setUrl('');
  };

  const enterUrl = () => {
    return <>
      <div
        className={cn(
          'flex items-center p-1 h-8 bg-components-input-bg-active border border-components-input-border-active rounded-lg shadow-xs',
          showError && 'border-components-input-border-destructive'
        )}
      >
        <input
          className="grow block mr-0.5 px-1 bg-transparent system-sm-regular outline-none appearance-none"
          placeholder="输入文件链接"
          value={url}
          onChange={(e) => {
            setShowError(false);
            setUrl(e.target.value);
          }}
          //   disabled={!!url}
        />
        <button
          className="file-button"
          disabled={!url }
          onClick={handleSaveUrl}
        >
                  好的
        </button>
      </div>
      {
        showError && (
          <div className="mt-0.5 body-xs-regular text-text-destructive">
                    文件链接无效
          </div>
        )
      }
    </>;
  };
  return (
    <Popover content={enterUrl} trigger="click">
      <Button
        variant="tertiary"
        className={cn('hover:shadow-sm text-xs hover:border-gray-300 grow relative h-9 flex rounded-lg items-center justify-center cursor-pointer border text-gray-500 border-gray-200')}
        // disabled={!!(fileConfig.number_limits && files.length >= fileConfig.number_limits)}
      >
        <RiLink className="w-4 h-4" />
        <span className="ml-1">粘贴文件链接</span>
      </Button>
    </Popover>
  );
}
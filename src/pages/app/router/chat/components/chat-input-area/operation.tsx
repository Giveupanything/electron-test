import { SendOutlined } from '@ant-design/icons';
import { forwardRef, memo } from 'react';
import { FileUpload } from '../../types';
import { Button, Popover } from 'antd';
import { RiAttachmentLine, RiUploadCloud2Line } from '@remixicon/react';
import FileInput from './file-input';

type Props = {
  fileConfig: FileUpload;
  handleSend: () => void;
}

const Operation = ({
  fileConfig,
  handleSend
}: Props, ref: any) => {

  return (
    <div className="shrink-0 flex items-center justify-end">
      <div
        className="flex items-center pl-1 gap-3"
        ref={ref}
      >
        {
          fileConfig?.enabled && <Popover
            content={
              <Button className="w-[188px] font-bold !text-[#155aef] hover:border-[#155aef] !text-[14px]" icon={<RiUploadCloud2Line className="w-4 h-4 font-bold" />}>
              从本地上传
                <FileInput fileConfig={fileConfig} />
              </Button>
            }
            trigger="click"
            title="文件上传"
            arrow={false}
          >
            <div className="p-[6px] hover:bg-[#c8ceda33] rounded-md cursor-pointer">
              <RiAttachmentLine className="w-5 h-5" />
            </div>
          </Popover>
        }

        <div className="px-[7px] py-[2px] rounded-lg bg-[#2d60e7] flex-shrink-0 cursor-pointer" onClick={handleSend}>
          <SendOutlined className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default memo(forwardRef<HTMLDivElement, Props>(Operation));

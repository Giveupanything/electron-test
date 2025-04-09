/*
 * @Author: ming
 * @Date: 2025-03-17 14:19:16
 * @LastEditors: ming
 * @LastEditTime: 2025-03-17 15:15:38
 * @description: 心平气和
 */
'use client';
import React, { type FC } from 'react';
import {
  useCSVDownloader
} from 'react-papaparse';
import cn from 'classnames';
import Button from '@/components/base/button';
import { Download02 } from '@/components/icon/communication';
export type IResDownloadProps = {
  isMobile: boolean
  values: Record<string, string>[]
}

const ResDownload: FC<IResDownloadProps> = ({
  isMobile,
  values
}) => {
  const { CSVDownloader, Type } = useCSVDownloader();

  return (
    <CSVDownloader
      className="block cursor-pointer"
      type={Type.Link}
      filename={'result'}
      bom={true}
      config={{
        // delimiter: ';',
      }}
      data={values}
    >
      <Button className={cn('flex items-center !h-8 space-x-2 bg-white !text-[13px] font-medium', isMobile ? '!p-0 !w-8 justify-center' : '!px-3')}>
        <Download02 className="w-4 h-4 text-[#155EEF]" />
        {!isMobile && <span className="text-[#155EEF]">下载</span>}
      </Button>
    </CSVDownloader>
  );
};
export default React.memo(ResDownload);

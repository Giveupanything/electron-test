'use client';
import React, { useState, type FC } from 'react';
import { useCSVReader } from 'react-papaparse';
import cn from 'classnames';
import s from '../../style.module.css';
import { Csv } from '@/components/icon/communication';

export type Props = {
  onParsed: (data: string[][]) => void
}

const CSVReader: FC<Props> = ({
  onParsed
}) => {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  return (
    <CSVReader
      onUploadAccepted={(results: any) => {
        onParsed(results.data);
        setZoneHover(false);
      }}
      onDragOver={(event: DragEvent) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event: DragEvent) => {
        event.preventDefault();
        setZoneHover(false);
      }}
    >
      {({
        getRootProps,
        acceptedFile
      }: any) => (
        <>
          <div
            {...getRootProps()}
            className={cn(s.zone, zoneHover && s.zoneHover, acceptedFile ? 'px-6 flex items-center justify-center h-20 border border-dashed border-components-dropzone-border rounded-xl bg-slate-1' : 'justify-center border-dashed text-gray-500 ')}
          >
            {
              acceptedFile
                ? (
                  <div className="w-full flex items-center space-x-2 ">
                    <Csv className="shrink-0" />
                    <div className="flex w-0 grow">
                      <span className="max-w-[calc(100%_-_30px)] text-ellipsis whitespace-nowrap overflow-hidden text-gray-800">{acceptedFile.name.replace(/.csv$/, '')}</span>
                      <span className="shrink-0 text-gray-500">.csv</span>
                    </div>
                  </div>
                )
                : (
                  <div className="flex items-center justify-center space-x-2 h-20 border border-dashed border-components-dropzone-border rounded-xl bg-slate-100">
                    <Csv className="shrink-0" />
                    <div className="text-gray-500 text-[13px]">将您的 CSV 文件拖放到此处，或<span className="text-primary-400 cursor-pointer text-[#155EEF]">浏览</span></div>
                  </div>
                )}
          </div>
        </>
      )}
    </CSVReader>
  );
};

export default React.memo(CSVReader);

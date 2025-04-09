/*
 * @Author: ming
 * @Date: 2025-03-17 14:19:16
 * @LastEditors: ming
 * @LastEditTime: 2025-03-17 15:15:00
 * @description: 心平气和
 */
'use client';
import React, { type FC } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import cn from 'classnames';
import CSVReader from './csv-reader';
import CSVDownload from './csv-download';
import Button from '@/components/base/buttonNew';
import { Loading02 } from '@/components/icon/communication';
export type IRunBatchProps = {
  vars: { name: string }[]
  onSend: (data: string[][]) => void
  isAllFinished: boolean
}

const RunBatch: FC<IRunBatchProps> = ({
  vars,
  onSend,
  isAllFinished
}) => {

  const [csvData, setCsvData] = React.useState<string[][]>([]);
  const [isParsed, setIsParsed] = React.useState(false);
  const handleParsed = (data: string[][]) => {
    setCsvData(data);
    // console.log(data)
    setIsParsed(true);
  };

  const handleSend = () => {
    onSend(csvData);
  };
  const Icon = isAllFinished ? PlayIcon : Loading02;
  return (
    <div className="pt-4">
      <CSVReader onParsed={handleParsed} />
      <CSVDownload vars={vars} />
      <div className="mt-4 h-[1px] bg-gray-100" />
      <div className="flex justify-end">
        <Button
          type="primary"
          className="mt-4 !h-8 !pl-3 !pr-4 bg-[#2563eb]"
          onClick={handleSend}
          disabled={!isParsed || !isAllFinished}
        >
          <Icon className={cn(!isAllFinished && 'animate-spin', 'shrink-0 w-4 h-4 mr-1')} aria-hidden="true" />
          <span className="uppercase text-[13px]">运行</span>
        </Button>
      </div>
    </div>
  );
};
export default React.memo(RunBatch);

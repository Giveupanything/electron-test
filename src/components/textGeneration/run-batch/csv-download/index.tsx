/*
 * @Author: ming
 * @Date: 2025-03-17 14:19:16
 * @LastEditors: ming
 * @LastEditTime: 2025-03-17 15:15:22
 * @description: 心平气和
 */
'use client';
import React, { type FC } from 'react';
import { useCSVDownloader } from 'react-papaparse';
import { Download02 } from '@/components/icon/communication';

export type ICSVDownloadProps = {
  vars: { name: string }[]
}

const CSVDownload: FC<ICSVDownloadProps> = ({
  vars
}) => {
  const { CSVDownloader, Type } = useCSVDownloader();
  const addQueryContentVars = [...vars];
  const template = (() => {
    const res: Record<string, string> = {};
    addQueryContentVars.forEach((item) => {
      res[item.name] = '';
    });
    return res;
  })();

  return (
    <div className="mt-6">
      <div className="text-[13px] text-gray-900 font-medium">CSV 文件必须符合以下结构：</div>
      <div className="mt-2 max-h-[500px] overflow-auto">
        <table className="w-full border-separate border-spacing-0 border border-gray-200 rounded-lg text-xs">
          <thead className="text-gray-500">
            <tr>
              {addQueryContentVars.map((item, i) => (
                <td key={i} className="h-9 pl-4 border-b border-gray-200">{item.name}</td>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr>
              {addQueryContentVars.map((item, i) => (
                <td key={i} className="h-9 pl-4">{item.name} </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <CSVDownloader
        className="block mt-2 cursor-pointer"
        type={Type.Link}
        filename={'template'}
        bom={true}
        config={{
          // delimiter: ';',
        }}
        data={[
          template
        ]}
      >
        <div className="flex items-center h-[18px] space-x-1 text-[#155EEF] text-xs font-medium">
          <Download02 className="w-3 h-3" />
          <span>下载模板</span>
        </div>
      </CSVDownloader>
    </div>

  );
};
export default React.memo(CSVDownload);

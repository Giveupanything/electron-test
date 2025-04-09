import { Popover } from 'antd';
import { Resources } from '.';
import { Fragment } from 'react/jsx-runtime';

import './index.css';
import FileIcon from './file-icon';

export default function CitationPopup({
  data
}: {
data: Resources
}) {
  const fileType = data.dataSourceType !== 'notion'
    ? (/\.([^.]*)$/g.exec(data.documentName)?.[1] || '')
    : 'notion';

  return (
    <Popover
      content={
        <div className="max-w-[360px] bg-gray-50 rounded-xl">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center h-[18px]">
              <FileIcon type={fileType} className="shrink-0 mr-1 w-4 h-4" />
              <div className="text-xs font-medium text-gray-600 truncate">{data.documentName}</div>
            </div>
          </div>

          <div className="px-4 py-0.5 max-h-[450px] bg-white rounded-lg overflow-y-auto">
            <div className="w-full">
              {
                data.sources.map((source, index) => (
                  <Fragment key={index}>
                    <div className="group py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center px-1.5 h-5 border border-gray-200 rounded-md">
                        #
                          <div className="text-[11px] font-medium text-gray-500">
                            {source.segment_position || index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="text-[13px] text-gray-800 break-words text-ellipsis">{source.content}</div>
                    </div>
                    {
                      index !== data.sources.length - 1 && (
                        <div className="my-1 h-[1px] bg-black/5" />
                      )
                    }
                  </Fragment>
                ))
              }
            </div>
          </div>
        </div>
      }
      trigger="click"
      placement="bottom"
      rootClassName="CitationPopup"
      arrow={false}
    >
      <div className="flex items-center px-2 max-w-[240px] h-7 bg-white rounded-lg">
        <FileIcon type={fileType} className="shrink-0 mr-1 w-4 h-4" />
        <div className="text-xs text-gray-600 truncate">{data.documentName}</div>
      </div>
    </Popover>
  );
}

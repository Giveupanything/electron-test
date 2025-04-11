import {
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, InputRef, message, Spin } from "antd";
import { Fragment, useRef, useState } from "react";
import classNames from "classnames";
import { useRequest } from "ahooks";
import { downloadKnowledgeFile, getKnowledgeList } from "@/api/search";
import { useSearchParams } from "react-router-dom";
import { generateChineseUpperCase, handleDownload } from "./utils";
import usePreview from "./usePreview";

export default function index() {
  const [activeId, setActiveId] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const inputRef = useRef<InputRef>(null);

  const [searchParams] = useSearchParams();

  const apiKey = searchParams.get("APIKEY");

  const { onPreview, previewContent } = usePreview({ apiKey: apiKey! });

  const { data, loading } = useRequest(() => getKnowledgeList({ apiKey }), {
    onSuccess: (res) => {
      for (const baseItem of res.data) {
        for (const item of baseItem.docson || []) {
          if (baseItem.id && item.file_id) {
            setActiveId(item.file_id);
            onPreview(baseItem, item);
            return;
          }
        }
      }
    },
  });

  const onSearch = () => {
    setSearchValue(inputRef.current?.input?.value || "");
  };

  const filterData = searchValue
    ? (data?.data || []).map((baseItem) => ({
        ...baseItem,
        docson: baseItem.docson.filter((item) =>
          item.name.includes(searchValue)
        ),
      }))
    : data?.data || [];
  const titleList = generateChineseUpperCase(filterData.length || 0);

  const onDownload = (
    baseItem: Search.GetKnowledgeList.Res["data"][number],
    item: (typeof baseItem)["docson"][number]
  ) => {
    message.loading({
      duration: 0,
      content: "下载中...",
      key: item.file_id,
    });
    downloadKnowledgeFile({
      apiKey: apiKey!,
      id: baseItem.id,
      file_id: item.file_id,
    })
      .then((blob) => {
        message.success({
          duration: 3,
          content: "下载成功",
          key: item.file_id,
        });
        handleDownload(blob, item.name);
      })
      .catch((e) => {
        message.error({
          duration: 3,
          content: `下载出错了!`,
          key: item.file_id,
        });
      });
  };

  return (
    <div className="w-[60vw]  m-auto mt-[20vh]">
      <h3 className="text-2xl font-semibold text-[#305547]">知识库查询</h3>
      <div className="flex my-3">
        <Input
          ref={inputRef}
          style={{ boxShadow: "0 0px 6px rgba(0,0,0,.2)" }}
          className="underline w-[50vw] !bg-[#ecfbfb]"
          allowClear
          onPressEnter={onSearch}
        ></Input>
        <Button
          className="ml-2 !text-white !bg-[#305547]  hover:!border-[#305547] hover:opacity-70"
          onClick={onSearch}
        >
          <SearchOutlined /> 搜索
        </Button>
      </div>
      <div className="flex">
        <div className="rounded w-1/3 border border-[#d9d9d9] px-4 py-5">
          <h4 className="font-semibold text-base">文件目录</h4>

          <Spin spinning={loading}>
            <div className="h-[40vh] overflow-y-auto">
              {(filterData || []).map((baseItem, i) => (
                <Fragment key={baseItem.id}>
                  <div className="mt-2" key={baseItem.id}>
                    {titleList[i]}、{baseItem.name}
                  </div>
                  {(baseItem.docson || []).map((item) => (
                    <div className={"text-[#666] mt-2"} key={item.file_id}>
                      <FileTextOutlined />
                      <span
                        className={classNames("ml-1", {
                          "text-[#1890ff]": activeId === item.file_id,
                        })}
                      >
                        {item.name}
                      </span>
                      <span className="float-right">
                        <EyeOutlined
                          title="预览"
                          className="ml-1 cursor-pointer hover:opacity-70"
                          onClick={() => {
                            setActiveId(item.file_id);
                            onPreview(baseItem, item);
                          }}
                        />
                        <DownloadOutlined
                          title="下载"
                          className="mx-1  cursor-pointer hover:opacity-70"
                          onClick={() => onDownload(baseItem, item)}
                        />
                      </span>
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </Spin>
        </div>
        <div className="ml-5 rounded flex-1 border border-[#d9d9d9] px-4 py-5">
          <h4 className="font-semibold text-base mb-2">文件内容</h4>

          {previewContent}

          {/* <div>
      <div
        id="panel-section"
        style={{ height: "800px", overflowY: "visible" }}
      ></div>
    </div> */}
        </div>
      </div>
    </div>
  );
}

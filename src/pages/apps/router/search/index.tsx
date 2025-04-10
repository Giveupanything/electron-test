import {
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Spin } from "antd";
import { useState } from "react";
import classNames from "classnames";
import PdfPreview from "@/pages/app/router/chat/components/file-list/pdf-preview";
import { useRequest } from "ahooks";
import { getKnowledgeList } from "@/api/search";

export default function index() {
  const [activeId, setActiveId] = useState(0);

  const { loading: listLoading } = useRequest(getKnowledgeList);

  return (
    <div className="w-[700px] m-auto mt-[30vh]">
      <h3 className="text-2xl font-semibold text-[#305547]">知识库查询</h3>
      <div className="flex my-3">
        <Input
          style={{ boxShadow: "0 0px 6px rgba(0,0,0,.2)" }}
          className="underline w-[560px] !bg-[#ecfbfb] "
        ></Input>
        <Button className="ml-2 !text-white !bg-[#305547]  hover:!border-[#305547] hover:opacity-70">
          <SearchOutlined /> 搜索
        </Button>
      </div>
      <Spin spinning={listLoading}>
        <div className="flex">
          <div className="rounded w-1/3 border border-[#d9d9d9] px-4 py-5">
            <h4 className="font-semibold text-base">文件目录</h4>
            <div className="mt-2">一、只读文件和管理规范</div>
            {[1].map((item) => (
              <div key={item} className={"text-[#666] mt-2"}>
                <FileTextOutlined />
                <span
                  className={classNames("ml-1", {
                    "text-[#1890ff]": activeId === item,
                  })}
                >
                  {"国家电网有限公司"}
                </span>
                <span className="float-right">
                  <EyeOutlined
                    title="预览"
                    className="ml-1 cursor-pointer hover:opacity-70"
                    onClick={() => setActiveId(item)}
                  />
                  <DownloadOutlined
                    title="下载"
                    className="ml-1 cursor-pointer hover:opacity-70"
                  />
                </span>
              </div>
            ))}
            <div className="mt-2">二、系统操作手册</div>
          </div>
          <div className="ml-5 rounded flex-1 border border-[#d9d9d9] px-4 py-5">
            <h4 className="font-semibold text-base mb-2">文件内容</h4>

            <div>{activeId}</div>
            {/* <iframe
            src="/智线笔试题结果.pdf"
            frameborder="0"
            frameBorder="0"
          ></iframe> */}
          </div>
        </div>
      </Spin>
    </div>
  );
}

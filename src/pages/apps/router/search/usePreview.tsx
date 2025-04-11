import { downloadKnowledgeFile } from "@/api/search";
import { useRequest } from "ahooks";
import { Spin } from "antd";
import { useEffect, useState } from "react";
import * as docx from "docx-preview";

export default function usePreview({ apiKey }: { apiKey: string }) {
  const [type, setType] = useState("");

  const {
    data: previewData,
    loading: previewLoading,
    run: runPreview,
  } = useRequest(downloadKnowledgeFile, { manual: true });

  const onPreview = (
    baseItem: Search.GetKnowledgeList.Res["data"][number],
    item: (typeof baseItem)["docson"][number]
  ) => {
    const type = (item.name.split(".").pop() || "").toLocaleLowerCase();
    runPreview({ apiKey: apiKey!, id: baseItem.id, file_id: item.file_id });
    setType(type);
  };

  useEffect(() => {
    if (type === "docx" && previewData) {
      docx
        .renderAsync(previewData, document.getElementById("panel-section")!)
        .catch((e) => console.error("渲染失败：", e));
    }
  }, []);

  const getPreviewContent = () => {
    if (type === "docx") {
      return (
        <div>
          <div id="panel-section" className="h-[40vh] overflow-y-auto"></div>
        </div>
      );
    }
    const pdfPreviewUrl = previewData ? URL.createObjectURL(previewData) : "";
    switch (type) {
      case "pdf":
        return (
          pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              frameBorder="0"
              width="100%"
              className="h-[40vh]"
            ></iframe>
          )
        );
      case "jpg":
      case "jpeg":
      case "png":
        return <img src={pdfPreviewUrl} alt="" />;
      case "mp3":
      case "wav":
      case "m4a":
        return <audio controls src={pdfPreviewUrl}></audio>;
      case "mp4":
      case "mov":
        return <video controls src={pdfPreviewUrl}></video>;
    }
  };

  const previewContent = (
    <Spin spinning={previewLoading}>{getPreviewContent()}</Spin>
  );

  return {
    onPreview,
    previewContent,
  };
}

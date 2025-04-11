import { get } from "@/axios";

/** 获取会话列表 */
export const getKnowledgeList = (params: Search.GetKnowledgeList.Req) =>
  get<Search.GetKnowledgeList.Res>("doc_list", {
    ...params,
  });

export const downloadKnowledgeFile = ({
  id,
  file_id,
  apiKey,
}: Search.DownloadKnowledgeFileReq) =>
  get<Blob>(
    `doc_list/${id}/documents/${file_id}`,
    { apiKey: apiKey },
    { responseType: "blob" }
  );

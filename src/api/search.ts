import { get } from "@/axios";
import { AppConversationData } from "@/typings/app";

/** 获取会话列表 */
export const getKnowledgeList = (params: object) =>
  get("conversations", {
    limit: 100,
    sort_by: "-created_at",
    ...params,
  }) as unknown as Promise<AppConversationData>;

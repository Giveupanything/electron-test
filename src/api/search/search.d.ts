namespace Search {
  interface ListRes {
    page: number;
    has_mores: false;
    limit: number;
    total: number;
  }

  namespace GetKnowledgeList {
    interface Req {}
    interface Res extends ListRes {
      data: {
        id: string;
        name: string;
        docson: { file_id: string; name: string }[];
      }[];
    }
  }

  interface DownloadKnowledgeFileReq {
    id: string;
    file_id: string;
    apiKey: string;
  }
}

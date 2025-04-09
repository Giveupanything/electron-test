
import { BlockEnum, FileResponse } from '@/types/app';
export const getProcessedFilesFromResponse = (files: FileResponse[]) => {
  return files.map((fileItem) => {
    return {
      id: fileItem.related_id,
      name: fileItem.filename,
      size: fileItem.size || 0,
      type: fileItem.mime_type,
      progress: 100,
      transferMethod: fileItem.transfer_method,
      supportFileType: fileItem.type,
      uploadedId: fileItem.related_id,
      url: fileItem.url
    };
  });
};

export const getFilesInLogs = (rawData: any) => {
  const result = Object.keys(rawData || {}).map((key) => {
    if(typeof rawData[key] === 'object' && rawData[key]?.dify_model_identity === '__dify__file__') {
      return {
        varName: key,
        list: getProcessedFilesFromResponse([rawData[key]])
      };
    }
    if(Array.isArray(rawData[key]) && rawData[key].some(item => item?.dify_model_identity === '__dify__file__')) {
      return {
        varName: key,
        list: getProcessedFilesFromResponse(rawData[key])
      };
    }
    return undefined;
  }).filter(Boolean);
  return result;
};

export const hasRetryNode = (nodeType?: BlockEnum) => {
  return nodeType === BlockEnum.LLM || nodeType === BlockEnum.Tool || nodeType === BlockEnum.HttpRequest || nodeType === BlockEnum.Code;
};

import { TransferMethod, SupportUploadFileTypes, type FileUpload, FileEntity, FileUploadConfigResponse } from '@/types/app';
import { useCallback } from 'react';
import produce from 'immer';
import { useFileStore } from '../store';
import { v4 as uuid4 } from 'uuid';
import { useToastContext } from '@/components/base/toast';
import { getSupportFileType, isAllowedFileExtension } from '../utils';
import {
  AUDIO_SIZE_LIMIT,
  FILE_SIZE_LIMIT,
  IMG_SIZE_LIMIT,
  MAX_FILE_UPLOAD_LIMIT,
  VIDEO_SIZE_LIMIT
} from '../constants';
import { uploadRemoteFileInfo } from '@/api/text';
import { formatFileSize } from '@/utils/format';

export const useFileSizeLimit = (fileUploadConfig?: FileUploadConfigResponse) => {
  const imgSizeLimit = Number(fileUploadConfig?.image_file_size_limit) * 1024 * 1024 || IMG_SIZE_LIMIT;
  const docSizeLimit = Number(fileUploadConfig?.file_size_limit) * 1024 * 1024 || FILE_SIZE_LIMIT;
  const audioSizeLimit = Number(fileUploadConfig?.audio_file_size_limit) * 1024 * 1024 || AUDIO_SIZE_LIMIT;
  const videoSizeLimit = Number(fileUploadConfig?.video_file_size_limit) * 1024 * 1024 || VIDEO_SIZE_LIMIT;
  const maxFileUploadLimit = Number(fileUploadConfig?.workflow_file_upload_limit) || MAX_FILE_UPLOAD_LIMIT;

  return {
    imgSizeLimit,
    docSizeLimit,
    audioSizeLimit,
    videoSizeLimit,
    maxFileUploadLimit
  };
};

export const useFile = (fileConfig: FileUpload) => {
  const fileStore = useFileStore();
  const { notify } = useToastContext();
  const { imgSizeLimit, docSizeLimit, audioSizeLimit, videoSizeLimit } = useFileSizeLimit(fileConfig.fileUploadConfig);

  const handleAddFile = useCallback((newFile: FileEntity) => {
    const {
      files,
      setFiles
    } = fileStore.getState();

    const newFiles = produce(files, (draft) => {
      draft.push(newFile);
    });
    setFiles(newFiles);
  }, [fileStore]);

  const handleUpdateFile = useCallback((newFile: FileEntity) => {
    const {
      files,
      setFiles
    } = fileStore.getState();

    const newFiles = produce(files, (draft) => {
      const index = draft.findIndex(file => file.id === newFile.id);

      if(index > -1) {
        draft[index] = newFile;
      }
    });
    setFiles(newFiles);
  }, [fileStore]);

  const startProgressTimer = useCallback((fileId: string) => {
    const timer = setInterval(() => {
      const files = fileStore.getState().files;
      const file = files.find(file => file.id === fileId);

      if(file && file.progress < 80 && file.progress >= 0) handleUpdateFile({ ...file, progress: file.progress + 20 });
      else clearTimeout(timer);
    }, 200);
  }, [fileStore, handleUpdateFile]);

  const handleRemoveFile = useCallback((fileId: string) => {
    const {
      files,
      setFiles
    } = fileStore.getState();

    const newFiles = files.filter(file => file.id !== fileId);
    setFiles(newFiles);
  }, [fileStore]);

  const checkSizeLimit = useCallback((fileType: string, fileSize: number) => {
    switch (fileType) {
      case SupportUploadFileTypes.image: {
        if(fileSize > imgSizeLimit) {
          notify({
            type: 'error',
            message: `上传 ${SupportUploadFileTypes.image} 不能超过 ${formatFileSize(imgSizeLimit)}`
          });
          return false;
        }
        return true;
      }
      case SupportUploadFileTypes.document: {
        if(fileSize > docSizeLimit) {
          notify({
            type: 'error',
            message: `上传 ${SupportUploadFileTypes.document} 不能超过 ${formatFileSize(docSizeLimit)}`
          });
          return false;
        }
        return true;
      }
      case SupportUploadFileTypes.audio: {
        if(fileSize > audioSizeLimit) {
          notify({
            type: 'error',
            message: `上传 ${SupportUploadFileTypes.audio} 不能超过 ${formatFileSize(audioSizeLimit)}`
          });
          return false;
        }
        return true;
      }
      case SupportUploadFileTypes.video: {
        if(fileSize > videoSizeLimit) {
          notify({
            type: 'error',
            message: `上传 ${SupportUploadFileTypes.video} 不能超过 ${formatFileSize(videoSizeLimit)}`
          });
          return false;
        }
        return true;
      }
      case SupportUploadFileTypes.custom: {
        if(fileSize > docSizeLimit) {
          notify({
            type: 'error',
            message: `上传 ${SupportUploadFileTypes.video} 不能超过 ${formatFileSize(docSizeLimit)}`
          });
          return false;
        }
        return true;
      }
      default: {
        return true;
      }
    }
  }, [audioSizeLimit, docSizeLimit, imgSizeLimit, notify, videoSizeLimit]);

  const handleLoadFileFromLink = useCallback((url: string) => {
    const allowedFileTypes = fileConfig.allowed_file_types;

    const uploadingFile = {
      id: uuid4(),
      name: url,
      type: '',
      size: 0,
      progress: 0,
      transferMethod: TransferMethod.remote_url,
      supportFileType: '',
      url,
      isRemote: true
    };
    handleAddFile(uploadingFile);
    startProgressTimer(uploadingFile.id);
    uploadRemoteFileInfo(url).then((res) => {
      const newFile = {
        ...uploadingFile,
        type: res.mime_type,
        size: res.size,
        progress: 100,
        supportFileType: getSupportFileType(res.name, res.mime_type, allowedFileTypes?.includes(SupportUploadFileTypes.custom)),
        uploadedId: res.id,
        url: res.url
      };
      if(!isAllowedFileExtension(res.name, res.mime_type, fileConfig.allowed_file_types || [], fileConfig.allowed_file_extensions || [])) {
        notify({ type: 'error', message: '文件类型不支持' });
        handleRemoveFile(uploadingFile.id);
      }
      if(!checkSizeLimit(newFile.supportFileType, newFile.size)) handleRemoveFile(uploadingFile.id);
      else handleUpdateFile(newFile);
    }).catch(() => {
      notify({ type: 'error', message: '文件链接无效' });
      handleRemoveFile(uploadingFile.id);
    });
  }, [checkSizeLimit, handleAddFile, handleUpdateFile, notify, handleRemoveFile, fileConfig?.allowed_file_types, fileConfig.allowed_file_extensions, startProgressTimer]);

  return {
    handleLoadFileFromLink
  };
};
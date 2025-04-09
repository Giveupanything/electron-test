import { useCallback } from 'react';
import { FileEntity, FileUpload, FileUploadConfigResponse } from '../../types';
import { fileUpload, getSupportFileType, isAllowedFileExtension } from './utils';
import { message } from 'antd';
import { AUDIO_SIZE_LIMIT, FILE_SIZE_LIMIT, IMG_SIZE_LIMIT, MAX_FILE_UPLOAD_LIMIT, SupportUploadFileTypes, VIDEO_SIZE_LIMIT } from './constants';
import { formatFileSize } from './format';
import { TransferMethod } from '@/typings/app';
import produce from 'immer';
import { v4 as uuid4 } from 'uuid';
import { useFileStore } from '../../context/file-context';

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

  const { imgSizeLimit, docSizeLimit, audioSizeLimit, videoSizeLimit } = useFileSizeLimit(fileConfig.fileUploadConfig);

  const checkSizeLimit = useCallback((fileType: string, fileSize: number) => {
    switch (fileType) {
      case SupportUploadFileTypes.image: {
        if(fileSize > imgSizeLimit) {
          message.warning(`上传 ${SupportUploadFileTypes.image} 不能超过 ${formatFileSize(imgSizeLimit)}`);
          return false;
        }
        return true;
      }
      case SupportUploadFileTypes.document: {
        if(fileSize > docSizeLimit) {
          message.warning(`上传 ${SupportUploadFileTypes.document} 不能超过 ${formatFileSize(docSizeLimit)}`);
          return false;
        }
        return true;
      }
      case SupportUploadFileTypes.audio: {
        if(fileSize > audioSizeLimit) {
          message.warning(`上传 ${SupportUploadFileTypes.audio} 不能超过 ${formatFileSize(audioSizeLimit)}`);
          return false;
        }
        return true;
      }
      case SupportUploadFileTypes.video: {
        if(fileSize > videoSizeLimit) {
          message.warning(`上传 ${SupportUploadFileTypes.video} 不能超过 ${formatFileSize(videoSizeLimit)}`);
          return false;
        }
        return true;
      }
      case SupportUploadFileTypes.custom: {
        if(fileSize > docSizeLimit) {
          message.warning(`上传 ${SupportUploadFileTypes.document} 不能超过 ${formatFileSize(docSizeLimit)}`);
          return false;
        }
        return true;
      }
      default: {
        return true;
      }
    }
  }, [audioSizeLimit, docSizeLimit, imgSizeLimit, videoSizeLimit]);

  const handleSetFile = useCallback((newFile: FileEntity, type: 'add' | 'update') => {
    const { files, setFiles } = fileStore.getState();
    let newFiles: FileEntity[] = [];

    if(type === 'add') {
      newFiles = produce(files, (draft) => {
        draft.push(newFile);
      });
    } else {
      newFiles = produce(files, (draft) => {
        const index = draft.findIndex(file => file.id === newFile.id);
        if(index > -1) draft[index] = newFile;
      });
    }

    setFiles(newFiles);
  }, [fileStore]);

  const handleLocalFileUpload = useCallback((file: File, apiKey: string) => {
    if(!isAllowedFileExtension(file.name, file.type, fileConfig.allowed_file_types || [], fileConfig.allowed_file_extensions || [])) {
      message.warning('文件类型不支持');
      return;
    }

    const allowedFileTypes = fileConfig.allowed_file_types;
    const fileType = getSupportFileType(file.name, file.type, allowedFileTypes?.includes(SupportUploadFileTypes.custom));

    if(!checkSizeLimit(fileType, file.size)) return;

    const reader = new FileReader();
    const isImage = file.type.startsWith('image');

    reader.addEventListener(
      'load',
      () => {
        const uploadingFile = {
          id: uuid4(),
          name: file.name,
          type: file.type,
          size: file.size,
          progress: 0,
          transferMethod: TransferMethod.local_file,
          supportFileType: getSupportFileType(file.name, file.type, allowedFileTypes?.includes(SupportUploadFileTypes.custom)),
          originalFile: file,
          base64Url: isImage ? reader.result as string : ''
        };
        handleSetFile(uploadingFile, 'add');
        fileUpload({
          file: uploadingFile.originalFile,
          onProgressCallback: (progress) => {
            handleSetFile({ ...uploadingFile, progress }, 'update');
          },
          onSuccessCallback: (res) => {
            handleSetFile({ ...uploadingFile, uploadedId: res.id, progress: 100 }, 'update');
          },
          onErrorCallback: () => {
            message.warning('文件上传失败，请重新上传。');
            handleSetFile({ ...uploadingFile, progress: -1 }, 'update');
          }
        }, apiKey);
      },
      false
    );

    reader.addEventListener(
      'error',
      () => {
        message.warning('文件读取失败，请重新选择。');
      },
      false
    );

    reader.readAsDataURL(file);

  }, [checkSizeLimit, handleSetFile, fileConfig?.allowed_file_types, fileConfig?.allowed_file_extensions]);

  const handleRemoveFile = useCallback((fileId: string) => {
    const {
      files,
      setFiles
    } = fileStore.getState();

    const newFiles = files.filter(file => file.id !== fileId);
    setFiles(newFiles);
  }, [fileStore]);

  const handleReUploadFile = useCallback((fileId: string, apiKey: string) => {
    const {
      files,
      setFiles
    } = fileStore.getState();
    const index = files.findIndex(file => file.id === fileId);

    if(index > -1) {
      const uploadingFile = files[index];
      const newFiles = produce(files, (draft) => {
        draft[index].progress = 0;
      });
      setFiles(newFiles);
      fileUpload({
        file: uploadingFile.originalFile!,
        onProgressCallback: (progress) => {
          handleSetFile({ ...uploadingFile, progress }, 'update');
        },
        onSuccessCallback: (res) => {
          handleSetFile({ ...uploadingFile, uploadedId: res.id, progress: 100 }, 'update');
        },
        onErrorCallback: () => {
          message.warning('文件上传失败，请重新上传。');
          handleSetFile({ ...uploadingFile, progress: -1 }, 'update');
        }
      }, apiKey);
    }
  }, [fileStore, handleSetFile]);

  return {
    handleLocalFileUpload,
    handleRemoveFile,
    handleReUploadFile
  };
};

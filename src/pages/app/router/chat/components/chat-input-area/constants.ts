import { TransferMethod } from '@/typings/app';

export enum SupportUploadFileTypes {
    image = 'image',
    document = 'document',
    audio = 'audio',
    video = 'video',
    custom = 'custom',
  }

export const FILE_EXTS: Record<string, string[]> = {
  [SupportUploadFileTypes.image]: ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'],
  [SupportUploadFileTypes.document]: ['TXT', 'MD', 'MDX', 'MARKDOWN', 'PDF', 'HTML', 'XLSX', 'XLS', 'DOC', 'DOCX', 'CSV', 'EML', 'MSG', 'PPTX', 'PPT', 'XML', 'EPUB'],
  [SupportUploadFileTypes.audio]: ['MP3', 'M4A', 'WAV', 'WEBM', 'AMR', 'MPGA'],
  [SupportUploadFileTypes.video]: ['MP4', 'MOV', 'MPEG', 'MPGA']
};

export type UploadFileSetting = {
    allowed_file_upload_methods: TransferMethod[]
    allowed_file_types: SupportUploadFileTypes[]
    allowed_file_extensions?: string[]
    max_length: number
    number_limits?: number
  }

// fallback for file size limit of dify_config
export const IMG_SIZE_LIMIT = 10 * 1024 * 1024;
export const FILE_SIZE_LIMIT = 15 * 1024 * 1024;
export const AUDIO_SIZE_LIMIT = 50 * 1024 * 1024;
export const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;
export const MAX_FILE_UPLOAD_LIMIT = 10;

export const FILE_URL_REGEX = /^(https?|ftp):\/\//;
/*
 * @Author: dushuai
 * @Date: 2025-03-10 18:36:53
 * @LastEditors: ming
 * @LastEditTime: 2025-03-17 16:29:38
 * @description: config
 */
export const APP_BULID_TYPE: Common.BULID_TYPE = `${import.meta.env.VITE_APP_BUILD_ENV}` as Common.BULID_TYPE;

export const APP_KEY = 'next-site-turbo';

/** 语言key */
export const LOCALE_COOKIE_NAME = 'next-chat-locale';

/** 默认语言 */
export const LOCAL_DEFAULT = 'zh-CN';

/** token */
export const TOKEN_KEY = 'token';

/** dify api url */
export const DIFY_API_URL = `${APP_BULID_TYPE === 'desktop' ? import.meta.env.VITE_APP_DESKTOP_API_URL : import.meta.env.VITE_APP_DIFY_API_URL}`;

/** 本地api url */
export const API_URL = `${import.meta.env.VITE_APP_BASE_URL}`;

/** 项目名称 */
export const APP_TITLE = `${import.meta.env.VITE_APP_TITLE}`;

export const ANNOTATION_DEFAULT = {
  score_threshold: 0.9
};

export const DEFAULT_VALUE_MAX_LEN = 48;

export const DEFAULT_USER_ID = 'xiaoshu-testuser-03-26';

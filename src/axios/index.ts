/*
 * @Author: dushuai
 * @Date: 2023-03-14 17:53:45
 * @LastEditors: dushuais 1137896420@qq.com
 * @LastEditTime: 2024-08-08 21:17:06
 * @description: axios
 */
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';
import { message } from 'antd';

import { cancelRequest } from './requestCancel';
// import ErrorCodeHandle from './requestCode';
// import { useAppStore } from '@/store';
import { API_URL, DIFY_API_URL } from '@/config';
import { isString } from 'turboutils';

/** 不需要处理异常白名单 */
const whiteList: string[] = ['/qiniu/upload/uptoken'];

// axios基础配置
const service = axios.create({
  timeout: 20000,
  baseURL: API_URL
});

// 请求拦截
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig<any>) => {
    // 添加token
    // const token = useAppStore.getState().token;

    // if(token) {
    //   config.headers['token'] = token;
    // }
    // console.log('请求拦截 config:>> ', config);

    const isData = ['delete', 'post'].includes(config.method || '');

    if(config.params?.isDify !== false) config.baseURL = DIFY_API_URL;

    const paramsobj = isData ? config.data : config.params;
    const { apiKey, ...params } = isString(paramsobj) ? qs.parse(paramsobj) : paramsobj;

    // console.log('请求拦截 params:>> ', paramsobj, params, apiKey);

    Object.assign(config.headers, getDifyHeader(apiKey));

    isData ? config.data = params : config.params = params;

    cancelRequest.addPending(config); // 添加当前请求至请求列表

    // console.log('请求拦截 config:>> ', config);
    return config;
  },
  (err: AxiosError) => {
    return Promise.reject(err);
  }
);

// 响应拦截
service.interceptors.response.use(
  (response: AxiosResponse<any, any>) => {
    const url = response.config.url as string;

    cancelRequest.removePending(response.config); // 删除重复请求

    /**
     * 处理错误响应
     */
    if(whiteList.some(e => e.match(url))) {
      console.log('接口通过白名单，不需要异常处理url:>> ', url);
    } else {
      // ErrorCodeHandle(response);
    }

    return response;
    // console.log('响应拦截 response:>> ', response)
    // if(response.data.code === 200) {
    //   return response;
    // } else {
    //   console.error('响应异常:>> ', response);
    //   return Promise.reject(response);
    // }
  },
  (err: AxiosError) => {
    /**
     * 将取消请求的错误捕获
     * 根据需要设置 因为需要对每个请求单独处理catch 所以隐藏取消请求的错误返回
     */
    console.error('响应异常:>> ', err);

    if(err.code === 'ERR_CANCELED') {
      console.log('请求取消url:>> ', err.config?.url);
    } else if(err.code === 'ECONNABORTED' && err.message.includes('timeout')) {
      message.error('请求超时,请检查服务器状态');
      return Promise.reject(err);
    } else {
      // message.error(err.message);
      return Promise.reject(err);
    }
  }
);

/**
 * 基础的请求
*/
/** POST表单格式 */
export function postForm<T = any>(url: string, params?: object): Promise<Res.ResponseRes<T>> {
  return new Promise<Res.ResponseRes<T>>((resolve, reject) => {
    service
      .post(url, qs.stringify(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      })
      .then(
        (response: AxiosResponse<Res.ResponseRes<T>>) => {
          response && resolve(response.data);
        },
        (err: AxiosError) => {
          reject(err);
        }
      )
      .catch((err: AxiosError) => {
        reject(err);
      });
  });
}

/** POST JSON格式 */
export function post<T = any>(url: string, params?: object): Promise<Res.ResponseRes<T>> {
  return new Promise<Res.ResponseRes<T>>((resolve, reject) => {
    service
      .post(url, params)
      .then(
        (response: AxiosResponse<Res.ResponseRes<T>>) => {
          response && resolve(response.data);
        },
        (err: AxiosError) => {
          reject(err);
        }
      )
      .catch((error: AxiosError) => {
        reject(error);
      });
  });
}

/** GET请求 */
export function get<T = any>(url: string, params?: object): Promise<Res.ResponseRes<T>> {
  return new Promise<Res.ResponseRes<T>>((resolve, reject) => {
    service
      .get(url, { params })
      .then(
        (response: AxiosResponse<Res.ResponseRes<T>>) => {
          response && resolve(response.data);
        },
        (err: AxiosError) => {
          reject(err);
        }
      )
      .catch((error: AxiosError) => {
        reject(error);
      });
  });
}

/**
 * PUT请求
 */
export function put<T = any>(url: string, params?: object): Promise<Res.ResponseRes<T>> {
  return new Promise<Res.ResponseRes<T>>((resolve, reject) => {
    service
      .put(url, params)
      .then(
        (response: AxiosResponse<Res.ResponseRes<T>>) => {
          response && resolve(response.data);
        },
        (err: AxiosError) => {
          reject(err);
        }
      )
      .catch((error: AxiosError) => {
        reject(error);
      });
  });
}

/**
 * DELETE请求
 */
export function del<T = any>(url: string, params: object = {}, headers: object = {}): Promise<Res.ResponseRes<T>> {
  return new Promise<Res.ResponseRes<T>>((resolve, reject) => {
    service
      .delete(url, {
        data: params,
        headers: {
          ...headers
        }
      })
      .then(
        (response: AxiosResponse<Res.ResponseRes<T>>) => {
          response && resolve(response.data);
        },
        (err: AxiosError) => {
          reject(err);
        }
      )
      .catch((error: AxiosError) => {
        reject(error);
      });
  });
}

function getDifyHeader(apiKey: string) {
  if(!apiKey) return {};

  return {
    'Authorization': `Bearer ${apiKey}`
  };
}

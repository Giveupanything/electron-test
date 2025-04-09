import { DIFY_API_URL } from '@/config';

export const upload = (options: any, apiKey: string, searchParams?: string): Promise<any> => {

  const urlPrefix = DIFY_API_URL;
  const defaultOptions = {
    method: 'POST',
    url: `${urlPrefix}files/upload` + (searchParams || ''),
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    data: {}
  };
  options = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers }
  };

  return new Promise((resolve, reject) => {
    const xhr = options.xhr;
    xhr.open(options.method, options.url);
    for(const key in options.headers) {
      xhr.setRequestHeader(key, options.headers[key]);
    }

    // xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        if(xhr.status === 201) {
          resolve(xhr.response);
        } else {
          reject(xhr);
        }
      }
    };
    xhr.upload.onprogress = options.onprogress;
    xhr.send(options.data);
  });
};

import Axios from 'axios';
import { config } from '../config';

import { history } from 'App';
const axiosBase = Axios.create({
  baseURL: config.BASE_URL,
  timeout: 30000,
  maxContentLength: 1000000,
  maxBodyLength: 1000000,
});

// For GET requests
axiosBase.interceptors.request.use(
  // tslint:disable-next-line: no-shadowed-variable
  (configs: any) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    if (token && configs.headers) {
      configs.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }
    return configs;
  },
  (err) => {
    return Promise.reject(err);
  },
);

const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  history.push('/login');
};

axiosBase.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response.status === 401) {
      logout();
    }
    return Promise.reject(err);
  },
);

// For POST requests
// axiosBase.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err.status || err.response.status;
//     // const configHttp = err.config;
//     // // Case refreshToken
//     // const refreshToken = Cookies.get('refreshToken');
//     // if (!refreshToken) {
//     //   logout();

//     //   return Promise.reject(err);
//     // }

//     // if (status !== 401) {
//     //   return Promise.reject(err);
//     // }
//     // Gọi API để lấy token
//     // if (config.BASE_URL) {
//     //   return Axios.post(config.BASE_URL, { refreshToken })
//     //     .then((response) => {
//     //       if (response.status === 200) {
//     //         Cookies.set('token', response.data.token);
//     //         configHttp.headers.Authorization = `Bearer ${response.data.token}`;

//     //         return Axios(configHttp);
//     //       } else {
//     //         logout();

//     //         return Promise.reject(err);
//     //       }
//     //     })
//     //     .catch(() => {
//     //       logout();
//     //       return Promise.reject(err);
//     //     });
//     // }
//   }
// );

export const getAPI = (url: string, params?: any) =>
  axiosBase.get(url, { params }).then((res) => res.data);
export const postAPI = (url: string, data: any) =>
  axiosBase.post(url, data).then((res) => res.data);
export const putAPI = (url: string, data: any) => axiosBase.put(url, data).then((res) => res.data);
export const deleteAPI = (url: string, params?: any) =>
  axiosBase.delete(url, params && { data: params }).then((res) => res.data);

import axios from 'axios';
import { getUserTokens, saveUserTokens } from '../utils/storage';
import { API_BASE_URL } from '../contants';
const instance = axios.create({
  baseURL: API_BASE_URL,
});

instance.interceptors.request.use(
  async config => {
    const tokens = await getUserTokens();

    if (tokens) {
      config.headers.Authorization = `Bearer ${tokens.access.token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const tokens = await getUserTokens();

      if (!tokens) {
        console.log('No tokens found');
        return Promise.reject(
          new Error('Session expired. Please log in again.'),
        );
      }

      try {
        const res = await instance.post('/auth/refresh-tokens', {
          refreshToken: tokens.refresh.token,
        });

        if (res.status === 200) {
          const {access, refresh} = res.data.result;
          const accessToken = access.token;

          instance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          await saveUserTokens({accessToken, refreshToken: refresh.token});
          console.log('Token refreshed');
          console.log(accessToken);

          return instance(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
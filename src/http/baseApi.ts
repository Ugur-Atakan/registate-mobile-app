import axios from 'axios';
import { API_BASE_URL } from '../contants';
const baseAPI = axios.create({
  baseURL: API_BASE_URL
});
export default baseAPI;
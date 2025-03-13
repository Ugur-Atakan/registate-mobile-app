import {UserInterface} from '../../types/User';
import instance from '../instance';

const getUserData = async (): Promise<UserInterface> => {
  try {
    const repsonse = await instance.post('/user/me');
    return repsonse.data;
  } catch (error: any) {
    throw error;
  }
};


export {getUserData}
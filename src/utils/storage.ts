import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tokens } from "../types/User";

const TOKEN_KEY = 'tokens';

export const getUserTokens = async () => {
  const tokens = await AsyncStorage.getItem(TOKEN_KEY);
  console.log('tokens', tokens);
  return tokens ? JSON.parse(tokens) : null;
};

export const saveUserTokens = async(tokens: Tokens) => {
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const removeTokens = async() => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const clearStorage = async() => {
  await AsyncStorage.clear();
};

export const setActiveCompanyId = async(companyId: string) => {
 await  AsyncStorage.setItem('activeCompany', companyId);
};

export const getActiveCompanyId = async() => {
  return await AsyncStorage.getItem('activeCompany');
};
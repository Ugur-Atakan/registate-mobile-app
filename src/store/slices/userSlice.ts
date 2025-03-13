import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import { Tokens, User, UserInterface } from '../../types/User';

interface UserState {
  isLoggedIn: boolean;
  userData: User;
  tokens:Tokens
}

const initialState: UserState = {
  isLoggedIn: false,
  userData: {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    telephone: null,
    profileImage: null,
    notifications: false,
    roles: [],
    createdAt: '',
    companies: [],
    emailConfirmed: false,
    telephoneConfirmed: false,
    customerStripeID: null,
    enableToken: '',
    deletedAt: null,
    isActive: false,
    loginProvider: '',
    tickets: []
  },
  tokens: {
    accessToken: '',
    refreshToken: '',
  },
  
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserInterface>) => {
      state.userData = action.payload.user;
      state.isLoggedIn = true;
    },
    logOut: state => {
      state.userData = initialState.userData;
      state.isLoggedIn = false;
    },
    setUserData: (state, action: PayloadAction<User>) => {
      state.userData = action.payload;
    },
    updateUser: (state, action: PayloadAction<UserInterface>) => {
      state.userData = action.payload.user;
    },
  },
});
export const {login, logOut, updateUser,setUserData} = userSlice.actions;
export const userActions = userSlice.actions;
export default userSlice.reducer;
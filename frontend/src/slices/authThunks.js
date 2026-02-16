import { logout } from './authSlice';
import { apiSlice } from './apiSlice';

export const forceLogout = () => (dispatch) => {
  dispatch(logout());
  dispatch(apiSlice.util.resetApiState());
};

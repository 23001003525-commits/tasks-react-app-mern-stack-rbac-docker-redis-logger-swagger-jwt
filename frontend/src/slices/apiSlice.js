import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { forceLogout } from './authThunks';

const baseQuery = fetchBaseQuery({ 
  baseUrl: import.meta.env.VITE_API_URL || '',  //VITE_ prefix is required for env vars on vercel hosting
  credentials: 'include',
});


//takes care of expired cookie/invalid cookie when checked at server side
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(forceLogout());
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Task', 'Stats', 'Audit'],
  endpoints: (builder) => ({}),
});

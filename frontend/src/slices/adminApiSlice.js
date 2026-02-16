import { apiSlice } from './apiSlice';
const ADMIN_URL = '/api/v1/admin';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* =========================================
       SYSTEM MANAGEMENT
    ========================================== */

    getSystemStats: builder.query({
      query: () => ({
        url: `${ADMIN_URL}/stats`,
      }),
      providesTags: ['Stats'],
      keepUnusedDataFor: 60, // cache for 60 seconds
    }),

    getAuditLogs: builder.query({
      query: (page = 1) => ({
        url: `${ADMIN_URL}/logs?page=${page}`,
      }),
      providesTags: ['Audit'],
      keepUnusedDataFor: 30,
    }),

    /* =========================================
       USER MANAGEMENT
    ========================================== */

    getAllUsers: builder.query({
      query: ({ page = 1, keyword = '', role = '', suspended } = {}) => {
        const params = new URLSearchParams();

        params.append('page', page);

        if (keyword) params.append('keyword', keyword);
        if (role) params.append('role', role);
        if (suspended !== undefined)
          params.append('suspended', suspended);

        return {
          url: `${ADMIN_URL}/users?${params.toString()}`,
        };
      },
      providesTags: (result) =>
        result?.data?.users
          ? [
              ...result.data.users.map(({ _id }) => ({
                type: 'User',
                id: _id,
              })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
      keepUnusedDataFor: 30,
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${ADMIN_URL}/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'User', id: 'LIST' },
        'Stats',
        'Audit',
      ],
    }),

    updateUserRole: builder.mutation({
      query: ({ id: userId, role }) => {
        //console.log("id ", userId, "role ", role, "url ",`${ADMIN_URL}/users/${userId}/role`);    
      return {
        url: `${ADMIN_URL}/users/${userId}/role`,
        method: 'PUT',
        body: { role },
      } },
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: arg.id },
        { type: 'User', id: 'LIST' },
        'Stats',
        'Audit',
      ],
    }),

    toggleSuspendUser: builder.mutation({
      query: (userId) => ({
        url:  `${ADMIN_URL}/users/${userId}/suspend`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: arg },
        { type: 'User', id: 'LIST' },
        'Stats',
        'Audit',
      ],
    }),

    /* =========================================
       TASK MODERATION
    ========================================== */

    getAllTasks: builder.query({
      query: (page = 1) => ({
        url: `${ADMIN_URL}/tasks?page=${page}`,
      }),
      providesTags: (result) =>
        result?.data?.tasks
          ? [
              ...(result.data.tasks).map(({ _id }) => ({
                type: 'Task',
                id: _id,
              })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
      keepUnusedDataFor: 30,
    }),

    deleteAnyTask: builder.mutation({
      query: (taskId) => ({
        url: `${ADMIN_URL}/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Task', id: 'LIST' },
        'Audit',
        'Stats',
      ],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetSystemStatsQuery,
  useGetAllUsersQuery,
  useGetAllTasksQuery,
  useGetAuditLogsQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  useToggleSuspendUserMutation,
  useDeleteAnyTaskMutation,
} = adminApiSlice;

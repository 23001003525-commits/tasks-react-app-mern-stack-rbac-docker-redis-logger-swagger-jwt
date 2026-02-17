import { apiSlice } from './apiSlice';

const TASKS_URL = '/api/v1/tasks';

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => ({
        url: TASKS_URL,
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'Task',
                id: _id,
              })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    createTask: builder.mutation({
      query: (data) => ({
        url: TASKS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }, 'Stats' ],
    }),

    updateTask: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${TASKS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id } ) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `${TASKS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApiSlice;


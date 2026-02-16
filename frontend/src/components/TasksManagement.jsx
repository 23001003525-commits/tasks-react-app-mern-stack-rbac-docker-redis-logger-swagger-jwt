import { useState } from 'react';
import { Table, Button, Spinner, Pagination } from 'react-bootstrap';
import {
  useGetAllTasksQuery,
  useDeleteAnyTaskMutation,
} from '../slices/adminApiSlice';
import { useSelector } from 'react-redux';

const TasksManagement = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetAllTasksQuery(page);
  const [deleteTask] = useDeleteAnyTaskMutation();
  const { userInfo: currentUser } = useSelector((state) => state.auth);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };
  const isSelf = (user) => currentUser?._id === user._id;
  const canDeleteTask = (task) => {
    if (!currentUser) return false;
    if (isSelf(task.user)) return true;

    if (currentUser.role === 'admin') {
      return task.user.role === 'user';
    }

    if (currentUser.role === 'superadmin') {
      return true;
    }

    return false;
  };

  if (isLoading) return <Spinner animation="border" />;

  const tasks = data?.data?.tasks || [];
  const pages = data?.data?.pages || 1;

  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>User</th>
            <th>Created</th>
            <th width="120">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.user?.name || 'Deleted User'}</td>
              <td>{new Date(task.createdAt).toLocaleDateString()}</td>
              <td>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleDelete(task._id)}
                  disabled={isFetching || !canDeleteTask(task)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      {pages > 1 && (
        <Pagination>
          {[...Array(pages).keys()].map((x) => (
            <Pagination.Item
              key={x + 1}
              active={x + 1 === page}
              onClick={() => setPage(x + 1)}
            >
              {x + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </>
  );
};

export default TasksManagement;

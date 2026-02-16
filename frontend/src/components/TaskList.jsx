import { useState } from 'react';
import {
  Card,
  Form,
  Button,
  ListGroup,
  Row,
  Col,
  Badge,
  Spinner,
} from 'react-bootstrap';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '../slices/tasksApiSlice';
import { toast } from 'react-toastify';

const TaskList = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
// all | completed | pending

  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const { data, isLoading } = useGetTasksQuery();
  const tasks = data?.data ?? [];

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) { toast.error("Please enter a non empty task"); return;}

    await createTask({ title: newTitle });
    setNewTitle('');
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditingTitle(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveEdit = async (id) => {
    if (!editingTitle.trim()) return;

    await updateTask({ id, title: editingTitle });
    cancelEdit();
  };

  if (isLoading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? task.completed
        : !task.completed;

    return matchesSearch && matchesStatus;
  });


  return (
    <Card className="mt-4 shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">📝 Your Tasks</Card.Title>

        {/* Add Task */}
        <Form onSubmit={submitHandler} className="mb-4">
          <Row className="g-2">
            <Col xs={9}>
              <Form.Control
                type="text"
                placeholder="Add a new task..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </Col>
            <Col xs={3}>
              <Button
                type="submit"
                className="w-100"
                disabled={creating}
              >
                {creating ? 'Adding…' : 'Add'}
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Search & Filter */}
        <Row className="mb-3">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>

          <Col md={4}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </Form.Select>
          </Col>
        </Row>


        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <p className="text-muted text-center">
            No tasks match your search.
          </p>
        ) : (
          <ListGroup variant="flush">
            {filteredTasks.map((task) => (
              <ListGroup.Item key={task._id}>
                <Row className="align-items-center">
                  <Col xs={1}>
                    <Form.Check
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        updateTask({
                          id: task._id,
                          completed: !task.completed,
                        })
                      }
                    />
                  </Col>

                  <Col xs={7}>
                    {editingId === task._id ? (
                      <Form.Control
                        size="sm"
                        value={editingTitle}
                        onChange={(e) =>
                          setEditingTitle(e.target.value)
                        }
                      />
                    ) : (
                      <span
                        style={{
                          textDecoration: task.completed
                            ? 'line-through'
                            : 'none',
                          opacity: task.completed ? 0.6 : 1,
                        }}
                      >
                        {task.title}
                      </span>
                    )}
                  </Col>

                  <Col xs={2}>
                    {task.completed && (
                      <Badge bg="success">Done</Badge>
                    )}
                  </Col>

                  <Col xs={2} className="text-end">
                    {editingId === task._id ? (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          className="me-1"
                          onClick={() => saveEdit(task._id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-1"
                          onClick={() => startEdit(task)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => deleteTask(task._id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default TaskList;


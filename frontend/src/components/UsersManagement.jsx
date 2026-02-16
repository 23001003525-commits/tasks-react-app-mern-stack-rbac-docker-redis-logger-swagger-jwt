import { useState } from 'react';
import {
  Table,
  Badge,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  Pagination,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  useToggleSuspendUserMutation,
} from '../slices/adminApiSlice';

const UsersManagement = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('');
  const [suspended, setSuspended] = useState('');

  const { userInfo: currentUser } = useSelector((state) => state.auth);
  const isSelf = (user) => currentUser?._id === user._id;
  const canDoIt = (user) => {
    if (!currentUser) return false;
    if (isSelf(user)) return false;

    if (currentUser.role === 'admin') {
      return user.role === 'user';
    }

    if (currentUser.role === 'superadmin') {
      return true;
    }

    return false;
  };

  const { data, isLoading, refetch } = useGetAllUsersQuery({
    page,
    keyword,
    role,
    suspended,
  });

  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [updateRole] = useUpdateUserRoleMutation();
  const [toggleSuspend] = useToggleSuspendUserMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
//      refetch();
    }
  };

  const handlePromote = async (user) => {
    
    const newRole = user.role === 'admin' ? 'user' : 'admin'; //* Superadmin → admin transitions is not needed, we can demote to user , then promote to admin...manually. cause superadmin should never be given to someone who needs demoting in future....and if demoting needed, it would better be either straight up suspend or to user
//console.log("handlePromote does: ", { id: user._id, role: newRole });
    await updateRole({ id: user._id, role: newRole });
//    refetch();
  };

  const handleSuspend = async (id) => {
    await toggleSuspend(id);
//    refetch();
  };

  return (
    <>
      {/* ===== FILTERS ===== */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="Search name or email"
            value={keyword}
            onChange={(e) => {setKeyword(e.target.value); setPage(1);}}
          />
        </Col>

        <Col md={3}>
          <Form.Select value={role} onChange={(e) => {setRole(e.target.value); setPage(1);}}>
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Select
            value={suspended}
            onChange={(e) => {setSuspended(e.target.value); setPage(1);}}
          >
            <option value="">All Status</option>
            <option value="true">Suspended</option>
            <option value="false">Active</option>
          </Form.Select>
        </Col>

        <Col md={2}>
          <Button onClick={() => refetch()} className="w-100">
            Apply
          </Button>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      {isLoading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <div className="table-wrapper">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th width="250">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.users?.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={user.role === 'admin' || user.role === 'superadmin'? 'danger' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={user.isSuspended ? 'warning' : 'success'}>
                        {user.isSuspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>
                    <td className="actions-cell">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        disabled={!canDoIt(user)}
                        onClick={() => handlePromote(user)}
                      >
                        {user.role === 'admin' ? 'Demote' : 'Promote'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-warning"
                        className="me-2"
                        disabled={!canDoIt(user)}
                        onClick={() => handleSuspend(user._id)}
                      >
                        {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={
                          deleting ||
                          !canDoIt(user)
                        }
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* ===== PAGINATION ===== */}
          <Pagination>
            {[...Array(data?.data?.pages).keys()].map((x) => (
              <Pagination.Item
                key={x + 1}
                active={x + 1 === page}
                onClick={() => setPage(x + 1)}
              >
                {x + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </>
  );
};

export default UsersManagement;

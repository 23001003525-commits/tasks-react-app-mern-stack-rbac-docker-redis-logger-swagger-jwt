import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Nav,
  Tab,
} from 'react-bootstrap';

import {
  useGetSystemStatsQuery,
  useGetAllUsersQuery,
  useGetAllTasksQuery,
  useGetAuditLogsQuery,
} from '../slices/adminApiSlice';

import UsersManagement  from '../components/UsersManagement.jsx';
import TasksManagement from '../components/TasksManagement.jsx';
import AuditLogsManagement from '../components/AuditLogsManagement.jsx';

const AdminDashboard = () => {
  const [activeKey, setActiveKey] = useState('overview');

  const { data: stats, isLoading: statsLoading } =
    useGetSystemStatsQuery();

//  const { data: usersData, isLoading: usersLoading } =
//    useGetAllUsersQuery({ page: 1 });
//
//  const { data: tasks, isLoading: tasksLoading } =
//    useGetAllTasksQuery();

  const { data: logs, isLoading: logsLoading } =
    useGetAuditLogsQuery();

  return (
    <Container className="mt-4">
      <h2 className="mb-4 fw-bold">Admin Control Panel</h2>

      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
        <Row>
          <Col md={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="overview">Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="users">Users</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tasks">Tasks</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="logs">Audit Logs</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col md={9}>
            <Tab.Content>

              {/* ================= OVERVIEW ================= */}
              <Tab.Pane eventKey="overview">
                {statsLoading ? (
                  <Spinner animation="border" />
                ) : (
                  <Row>
                    <Col md={6}>
                      <Card className="mb-3 shadow-sm">
                        <Card.Body>
                          <h5>Total Users</h5>
                          <h3>{stats?.data?.totalUsers}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-3 shadow-sm">
                        <Card.Body>
                          <h5>Total Tasks</h5>
                          <h3>{stats?.data?.totalTasks}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-3 shadow-sm">
                        <Card.Body>
                          <h5>Admins</h5>
                          <h3>{stats?.data?.admins}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mb-3 shadow-sm">
                        <Card.Body>
                          <h5>Suspended Users</h5>
                          <h3>{stats?.data?.suspendedUsers}</h3>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}
              </Tab.Pane>

              {/* ================= USERS ================= */}
              <Tab.Pane eventKey="users">
                <UsersManagement />
              </Tab.Pane>

              {/* ================= TASKS ================= */}
              <Tab.Pane eventKey="tasks">
                <TasksManagement />
              </Tab.Pane>

              {/* ================= AUDIT LOGS ================= */}
              <Tab.Pane eventKey="logs">
                <AuditLogsManagement />
              </Tab.Pane>

            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default AdminDashboard;

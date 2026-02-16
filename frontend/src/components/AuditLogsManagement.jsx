import { Table, Spinner, Pagination } from 'react-bootstrap';
import { useState } from 'react';
import { useGetAuditLogsQuery } from '../slices/adminApiSlice';

const AuditLogsManagement = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAuditLogsQuery( page );

  const logs = data?.data?.logs || [];
  const pages = data?.data?.pages || 1;

  return (
    <>
      {isLoading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Action</th>
                <th>Performed By</th>
                <th>Performed On</th>
                <th>Date</th>
                <th>IP</th>
                <th>Task Info</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.action}</td>
                  <td>{log.performedBySnapshot? log.performedBySnapshot.userEmail : "null"}</td>
                  <td>{log.targetUserSnapshot ? log.targetUserSnapshot.targetUserEmail : log.targetTaskSnapshot ? log.targetTaskSnapshot.targetUserEmail : "null" }</td>
                  <td>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>{log.ip}</td>
                  <td>{ log.targetTaskSnapshot ? log.targetTaskSnapshot.targetTaskTitle : "" }</td>
                </tr>
              ))}
            </tbody>
          </Table>

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
        </>
      )}
    </>
  );
};

export default AuditLogsManagement;

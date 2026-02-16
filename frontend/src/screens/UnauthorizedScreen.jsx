import { Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UnauthorizedScreen = () => {
  return (
    <Container className="d-flex justify-content-center mt-5">
      <Card className="p-4 text-center shadow" style={{ maxWidth: '500px' }}>
        <h2 className="text-danger">403 - Unauthorized</h2>
        <p className="mt-3">
          You do not have permission to access this page.
        </p>
        <Link to="/" className="btn btn-primary mt-3">
          Go Back Home
        </Link>
      </Card>
    </Container>
  );
};


export default UnauthorizedScreen

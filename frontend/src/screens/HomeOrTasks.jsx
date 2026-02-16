import { useSelector } from 'react-redux';
import HomeScreen from './HomeScreen';
import TaskList from '../components/TaskList';

const HomeOrTasks = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // If NOT logged in → landing page
  if (!userInfo) {
    return <HomeScreen />;
  }

  // If logged in → tasks dashboard
  return <TaskList />;
};

export default HomeOrTasks;


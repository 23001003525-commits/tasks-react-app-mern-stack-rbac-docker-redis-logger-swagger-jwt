import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import store from './store';
import { forceLogout } from './slices/authThunks';
//handles logout in case of multi-tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'userInfo' && !event.newValue) {
    store.dispatch(forceLogout());
  }
});

import { Provider } from 'react-redux';
import HomeOrTasks from './screens/HomeOrTasks.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import TaskList from './components/TaskList.jsx';

import AdminRoute from './components/AdminRoute';
import AdminDashboard from './screens/AdminDashboard';
import UnauthorizedScreen from './screens/UnauthorizedScreen';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      {/* Public Routes */}
      <Route index element={<HomeOrTasks />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='/unauthorized' element={<UnauthorizedScreen />} />

      {/* Logged-in Users */}
      <Route element={<PrivateRoute />}>
        <Route path='/profile' element={<ProfileScreen />} />
        <Route path='/tasks' element={<TaskList />} />
      </Route>

      {/* Admin Only */}
      <Route element={<AdminRoute />}>
        <Route path='/admin' element={<AdminDashboard />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);

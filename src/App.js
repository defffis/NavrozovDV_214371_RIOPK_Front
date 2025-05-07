import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Products from './pages/Products';
import '../src/index.css';
import Login from './pages/Login';
import CreateProduct from './pages/CreateProduct';
import CreateCategory from './pages/CreateCategory';
import Shipping from './pages/Shipping';
import Reports from './pages/Reports';
import Packages from './pages/Packages';
import Signup from './pages/Signup';
import CreateLocation from './pages/CreateLocation';
import CreateSupplier from './pages/CreateSupplier';
import UpdateProduct from './pages/UpdateProduct';
import BatchInfo from './pages/BatchInfo';
import About from './pages/About';
import Parties from './pages/Parties';
import CreatePackage from './pages/CreatePackage';

function App() {
  const { user } = useContext(AuthContext);

  // Определение текстового описания роли на основе числового значения
  const getRoleName = (role) => {
    switch (role) {
      case 0:
        return "Сотрудник";
      case 1:
        return "Администратор";
      case 2:
        return "Контролёр";
      case 3:
        return "Секретарь";
      default:
        return "Вы не вошли";
    }
  };

  // Получение роли пользователя
  const userRole = user?.role;
  const roleName = getRoleName(userRole);

  const RoleBasedRoute = ({ requiredRole, children }) => {
    return roleName === requiredRole ? children : <Navigate to="/" />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <div className='pages'>
          <Routes>
            <Route
              path='/'
              element={user ? <Products /> : <Navigate to="/login" />}
            />
            <Route
              path='/login'
              element={!user ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path='/signup'
              element={!user ? <Signup /> : <Navigate to="/" />}
            />
            <Route path="/product/create-category" element={<CreateCategory />} />
            <Route path="/product/update" element={<UpdateProduct />} />
            <Route path="/product/create-supplier" element={<CreateSupplier />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/parties" element={<Parties />} />
            <Route path="/about" element={<About />} />
            <Route path="/batch-info" element={<BatchInfo />} />
            <Route path="/location/create" element={<CreateLocation />} />

            <Route path="/manager" element={<RoleBasedRoute requiredRole="Администратор"><Outlet /></RoleBasedRoute>}>
              <Route path="reports" element={<Reports />} />
              <Route path="product/update" element={<UpdateProduct />} />
            </Route>

            <Route path="/logistician" element={<RoleBasedRoute requiredRole="Секретарь"><Outlet /></RoleBasedRoute>}>
              <Route path="batch" element={<Shipping />} />
              <Route path="package" element={<CreatePackage />} />
            </Route>

            <Route path="/worker" element={<RoleBasedRoute requiredRole="Сотрудник"><Outlet /></RoleBasedRoute>}>
              <Route path="product/create" element={<CreateProduct />} />
            </Route>

            <Route path="/supervisor" element={<RoleBasedRoute requiredRole="Контролёр"><Outlet /></RoleBasedRoute>}>
              <Route path="product/update" element={<UpdateProduct />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;

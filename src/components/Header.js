import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useLogout } from '../hooks/useLogout';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import "./../styles/HeaderStyles.css";

const Header = () => {
  const { logout } = useLogout();
  const { user } = useContext(AuthContext);
  const userRole = user?.role;


  const handleLogout = () => {
    logout();
  };

  return (
    <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 border-bottom">
      <Link to="/" className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-white text-decoration-none">
        <img src="/..\images\logo.png" alt="Logo" className="logo-img me-2" />
        <span className="header-title">Склад для приемки товаров</span>
      </Link>
      <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">

        {!user ? (
          <>
            <li><NavLink to="/about" className="nav-link px-2">О нас</NavLink></li>
            <li>
              <NavLink to="/login" className="nav-link px-2 ">Войти</NavLink>
            </li>
            <li>
              <NavLink to="/signup" className="nav-link px-2 link-dark">Регистрация</NavLink>
            </li>
          </>
        ) : userRole === 0 ? (
          <>
            <li><NavLink to="/" className="nav-link px-2 link-secondary">Товары</NavLink></li>
            <li><NavLink to="/worker/product/create" className="nav-link px-2 link-dark">Регистрация товара</NavLink></li>
            <li><NavLink to="/product/create-supplier" className="nav-link px-2 link-dark">Создание поставщика</NavLink></li>
            <li><NavLink to="/product/create-category" className="nav-link px-2 link-dark">Создание категории</NavLink></li>
            <li><NavLink to="/location/create" className="nav-link px-2 link-dark">Создание места нахождения</NavLink></li>
            <li><NavLink onClick={handleLogout} to="/login" className="nav-link px-2 link-dark">Выйти</NavLink></li>
          </>
        ) : userRole === 1 ? (
          <>
            <li><NavLink to="/" className="nav-link px-2 link-secondary">Товары</NavLink></li>
            <li><NavLink to="/parties" className="nav-link px-2 link-dark">Партии</NavLink></li>
            <li><NavLink to="/packages" className="nav-link px-2 link-dark">Упаковки</NavLink></li>
            <li><NavLink to="/manager/reports" className="nav-link px-2 link-dark">Отчеты</NavLink></li>
            <li><NavLink onClick={handleLogout} to="/login" className="nav-link px-2 link-dark">Выйти</NavLink></li>
          </>
        ) : userRole === 2 ? (
          <>
            <li><NavLink to="/" className="nav-link px-2 link-secondary">Товары</NavLink></li>
            <li><NavLink to="/parties" className="nav-link px-2 link-dark">Партии</NavLink></li>
            <li><NavLink to="/packages" className="nav-link px-2 link-dark">Упаковки</NavLink></li>
            <li><NavLink onClick={handleLogout} to="/login" className="nav-link px-2 link-dark">Выйти</NavLink></li>
          </>
        ) : (
          <>
            <li><NavLink to="/" className="nav-link px-2 link-secondary">Товары</NavLink></li>
            <li><NavLink to="/parties" className="nav-link px-2 link-dark">Партии</NavLink></li>
            <li><NavLink to="/packages" className="nav-link px-2 link-dark">Упаковки</NavLink></li>
            <li><NavLink to="/location/create" className="nav-link px-2 link-dark">Создание места нахождения</NavLink></li>
            <li><NavLink onClick={handleLogout} to="/login" className="nav-link px-2 link-dark">Выйти</NavLink></li>
          </>
        )}
      </ul>
    </header>
  );
};

export default Header;


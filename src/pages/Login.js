import React, { useState } from 'react'
import { useLogin } from "../hooks/useLogin"
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./../styles/AuthStyles.css";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useLogin()


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login(email, password)


      if (!res.token) {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  const handleNavigate = () => {
    navigate('/signup')
  }

  return (
    <Layout title="Вход">
      <div className="form-container " style={{ minHeight: "90vh" }}>
        <form onSubmit={handleSubmit}>
          <h4 className="title">Вход</h4>

          <div className="mb-3">
            <input
              type="text"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              id="exampleInputName"
              placeholder="Введите ваш email"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              id="exampleInputPassword1"
              placeholder="Введите ваш пароль"
              required
            />
          </div>

          <div className="button-container">
            <button type="submit" className="btn btn-primary">Войти</button>
            <button type="button" className="noacc-btn" onClick={handleNavigate}>Нет аккаунта?</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default Login
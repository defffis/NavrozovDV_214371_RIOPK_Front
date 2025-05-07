import React, { useState } from 'react'
import { useSignup } from "../hooks/useSignup"
import Layout from "../components/Layout";

const Signup = () => {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { signup, error } = useSignup()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return;
    }
    await signup(name, email, password)
  }

  return (
    <Layout title="Регистрация">
      <div className="form-container" style={{ minHeight: "90vh" }}>
        <form onSubmit={handleSubmit}>
          <h4 className="title">Регистрация</h4>
          <div className="mb-3">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Почта"
              required
              autoFocus
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Имя"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Пароль"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              placeholder="Повторите пароль"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" >
            Зарегистрироваться
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </Layout>
  )
}

export default Signup
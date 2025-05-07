import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import axios from 'axios'

export const useSignup = () => {
  const [error, setError] = useState(null)
  const { dispatch } = useAuthContext()

  const signup = async (name, email, password) => {
    setError(null)

    const response = await fetch('/api/user/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const json = await response.json()
    const { user, token } = json;

    if (!response.ok) {
      setError(json.error)
      return json
    }
    if (response.ok) {
      localStorage.setItem('user', JSON.stringify({ user, token }))
      // update the auth context
      dispatch({ type: 'LOGIN', payload: { user, token } })
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return json
    }
  }

  return { signup, error }
}
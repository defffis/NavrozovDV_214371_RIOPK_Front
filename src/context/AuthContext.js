import { createContext, useReducer, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload.user, token: action.payload.token }
    case 'LOGOUT':
      return { user: null, token: null }
    default:
      return state
  }
}

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      dispatch({ type: 'LOGIN', payload: user })
    }
    
    axios.interceptors.request.use((config) => {

      const token = user.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }, [state.token]);


  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )

}
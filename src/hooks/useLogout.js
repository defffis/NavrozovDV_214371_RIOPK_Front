import { useAuthContext } from './useAuthContext'
import axios from 'axios'

export const useLogout = () => {
  const { dispatch } = useAuthContext()

  const logout = () => {
    // remove user from storage
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })

    // Очистка заголовка Authorization в axios
    delete axios.defaults.headers.common['Authorization'];
  }

  return { logout }
}
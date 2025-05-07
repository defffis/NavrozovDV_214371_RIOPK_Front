import { createContext, useReducer, useEffect } from 'react';

export const SupplierContext = createContext();

export const suppliersReducer = (state, action) => {
	switch (action.type) {
		case 'SET_SUPPLIER':
			return { suppliers: action.payload }

		case 'CREATE_SUPPLIER':
			return { suppliers: [action.payload, ...state.suppliers] }

		case 'DELETE_SUPPLIER':
			return { suppliers: state.suppliers.filter(supplier => supplier._id !== action.payload) }

		case 'UPDATE_SUPPLIER':
			return {
				suppliers: state.suppliers.map(supplier =>
					supplier._id === action.payload._id ? { ...supplier, ...action.payload } : supplier
				)
			}

		default:
			return state;
	}
}

export const SupplierContextProvider = ({ children }) => {
	// Инициализация состояния из localStorage, если данные существуют
	const initialState = {
		suppliers: JSON.parse(localStorage.getItem('suppliers')) || []
	};

	const [state, dispatch] = useReducer(suppliersReducer, initialState);

	// Сохранение данных в localStorage при каждом изменении suppliers
	useEffect(() => {
		localStorage.setItem('suppliers', JSON.stringify(state.suppliers));
	}, [state.suppliers]);

	return (
		<SupplierContext.Provider value={{ ...state, dispatch }}>
			{children}
		</SupplierContext.Provider>
	)
}
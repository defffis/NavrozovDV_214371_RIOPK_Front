import { createContext, useReducer, useEffect } from 'react';

export const CategoryContext = createContext();

export const categoriesReducer = (state, action) => {
	switch (action.type) {
		case 'SET_CATEGORY':
			return { categories: action.payload };

		case 'CREATE_CATEGORY':
			return { categories: [action.payload, ...state.categories] };

		case 'DELETE_CATEGORY':
			return { categories: state.categories.filter(category => category._id !== action.payload) };

		case 'UPDATE_CATEGORY':
			return {
				categories: state.categories.map(category =>
					category._id === action.payload._id ? { ...category, ...action.payload } : category
				)
			};

		default:
			return state;
	}
};

export const CategoryContextProvider = ({ children }) => {
	// Инициализация состояния из localStorage, если данные существуют
	const initialState = {
		categories: JSON.parse(localStorage.getItem('categories')) || []
	};

	const [state, dispatch] = useReducer(categoriesReducer, initialState);

	// Сохранение данных в localStorage при каждом изменении categories
	useEffect(() => {
		localStorage.setItem('categories', JSON.stringify(state.categories));
	}, [state.categories]);

	return (
		<CategoryContext.Provider value={{ ...state, dispatch }}>
			{children}
		</CategoryContext.Provider>
	);
};

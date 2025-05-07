import { createContext, useReducer, useEffect } from 'react';

export const LocationContext = createContext();

export const locationsReducer = (state, action) => {
	switch (action.type) {
		case 'SET_LOCATION':
			return { locations: action.payload }

		case 'CREATE_LOCATION':
			return { locations: [action.payload, ...state.locations] }

		case 'DELETE_LOCATION':
			return { locations: state.locations.filter(location => location._id !== action.payload) }

		case 'UPDATE_LOCATION':
			return {
				locations: state.locations.map(location =>
					location._id === action.payload._id ? { ...location, ...action.payload } : location
				)
			}

		default:
			return state;
	}
}

export const LocationContextProvider = ({ children }) => {
	// Инициализация состояния из localStorage, если данные существуют
	const initialState = {
		locations: JSON.parse(localStorage.getItem('locations')) || []
	};

	const [state, dispatch] = useReducer(locationsReducer, initialState);

	// Сохранение данных в localStorage при каждом изменении locations
	useEffect(() => {
		localStorage.setItem('locations', JSON.stringify(state.locations));
	}, [state.locations]);

	return (
		<LocationContext.Provider value={{ ...state, dispatch }}>
			{children}
		</LocationContext.Provider>
	)
}
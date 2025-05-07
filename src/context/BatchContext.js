import { createContext, useReducer, useEffect } from 'react';

export const BatchContext = createContext();

export const batchesReducer = (state, action) => {
	switch (action.type) {
		case 'SET_BATCH':
			return { batches: action.payload };

		case 'CREATE_BATCH':
			return { batches: [action.payload, ...state.batches] };

		case 'DELETE_BATCH':
			return { batches: state.batches.filter(batch => batch._id !== action.payload) }

		case 'UPDATE_BATCH':
			return {
				batches: state.batches.map(batch =>
					batch._id === action.payload._id ? { ...batch, ...action.payload } : batch
				)
			}

		default:
			return state;
	}
}


export const BatchContextProvider = ({ children }) => {
	const initialState = {
		batches: (() => {
			try {
				const storedBatches = localStorage.getItem('batches');
				return storedBatches && storedBatches !== 'undefined' ? JSON.parse(storedBatches) : [];
			} catch (error) {
				console.error("Ошибка при парсинге batches из localStorage:", error);
				return [];
			}
		})()
	};

	const [state, dispatch] = useReducer(batchesReducer, initialState);

	useEffect(() => {
		localStorage.setItem('batches', JSON.stringify(state.batches));
	}, [state.batches]);

	return (
		<BatchContext.Provider value={{ ...state, dispatch }}>
			{children}
		</BatchContext.Provider>
	);
}
import { createContext, useReducer, useEffect } from 'react';

export const ProdPackageContext = createContext();

export const packagesReducer = (state, action) => {
	switch (action.type) {
		case 'SET_PACKAGE':
			return { packages: action.payload };

		case 'CREATE_PACKAGE':
			return { packages: [action.payload, ...state.packages] };

		case 'DELETE_PACKAGE':
			return { packages: state.packages.filter(prodPackage => prodPackage._id !== action.payload) };

		case 'UPDATE_PACKAGE':
			return {
				packages: state.packages.map(prodPackage =>
					prodPackage._id === action.payload._id ? { ...prodPackage, ...action.payload } : prodPackage
				)
			};

		default:
			return state;
	}
};


const loadPackagesFromLocalStorage = () => {
	try {
		const storedPackages = localStorage.getItem('packages');
		return storedPackages && storedPackages !== 'undefined' ? JSON.parse(storedPackages) : [];
	} catch (error) {
		console.error("Ошибка при парсинге packages из localStorage:", error);
		return [];
	}
};

export const ProdPackageContextProvider = ({ children }) => {
	const [state, dispatch] = useReducer(packagesReducer, {
		packages: loadPackagesFromLocalStorage()
	});

	useEffect(() => {
		localStorage.setItem('packages', JSON.stringify(state.packages));
	}, [state.packages]);

	return (
		<ProdPackageContext.Provider value={{ ...state, dispatch }}>
			{children}
		</ProdPackageContext.Provider>
	);
};

import { createContext, useReducer, useEffect } from 'react';

export const ProductContext = createContext();

export const productsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_PRODUCT':
            return { products: action.payload };

        case 'CREATE_PRODUCT':
            return { products: [action.payload, ...state.products] };

        case 'DELETE_PRODUCT':
            return { products: state.products.filter(product => product._id !== action.payload) }

        case 'UPDATE_PRODUCT':
            return {
                products: state.products.map(product =>
                    product._id === action.payload._id ? { ...product, ...action.payload } : product
                )
            }

        default:
            return state;
    }
}


export const ProductContextProvider = ({ children }) => {
    const initialState = {
        products: (() => {
            try {
                const storedProducts = localStorage.getItem('products');
                return storedProducts && storedProducts !== 'undefined' ? JSON.parse(storedProducts) : [];
            } catch (error) {
                console.error("Ошибка при парсинге products из localStorage:", error);
                return [];
            }
        })()
    };

    const [state, dispatch] = useReducer(productsReducer, initialState);

    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(state.products));
    }, [state.products]);

    return (
        <ProductContext.Provider value={{ ...state, dispatch }}>
            {children}
        </ProductContext.Provider>
    );
}
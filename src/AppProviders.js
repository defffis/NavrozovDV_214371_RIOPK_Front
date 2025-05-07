import React from 'react';
import { ProductContextProvider } from './context/ProductContext';
import { BatchContextProvider } from './context/BatchContext';
import { ProdPackageContextProvider } from './context/ProdPackageContext';
import { CategoryContextProvider } from './context/CategoryContext';
import { LocationContextProvider } from './context/LocationContext';
import { SupplierContextProvider } from './context/SupplierContext';
import { AuthContextProvider } from './context/AuthContext';

const AppProviders = ({ children }) => (
	<AuthContextProvider>
		<ProductContextProvider>
			<CategoryContextProvider>
				<LocationContextProvider>
					<SupplierContextProvider>
						<ProdPackageContextProvider>
							<BatchContextProvider>
								{children}
							</BatchContextProvider>
						</ProdPackageContextProvider>
					</SupplierContextProvider>
				</LocationContextProvider>
			</CategoryContextProvider>
		</ProductContextProvider>
	</AuthContextProvider>
);

export default AppProviders;

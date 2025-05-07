import { SupplierContext } from "../context/SupplierContext";
import { useContext } from "react";

export const useSupplierContext = () => {
	const context = useContext(SupplierContext)
	if (!context)
		throw Error('no context')
	return context
}
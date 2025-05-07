import { ProdPackageContext } from "../context/ProdPackageContext";
import { useContext } from "react";

export const usePackageContext = () => {
	const context = useContext(ProdPackageContext)
	if (!context)
		throw Error('no context')
	return context
}
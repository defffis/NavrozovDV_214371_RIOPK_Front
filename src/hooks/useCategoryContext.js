import { CategoryContext } from "../context/CategoryContext";
import { useContext } from "react";

export const useCategoryContext = () => {
	const context = useContext(CategoryContext)
	if (!context)
		throw Error('no context')
	return context
}
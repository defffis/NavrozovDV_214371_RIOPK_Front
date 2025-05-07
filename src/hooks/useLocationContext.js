import { LocationContext } from "../context/LocationContext";
import { useContext } from "react";

export const useLocationContext = () => {
	const context = useContext(LocationContext)
	if (!context)
		throw Error('no context')
	return context
}
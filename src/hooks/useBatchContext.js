import { BatchContext } from "../context/BatchContext";
import { useContext } from "react";

export const useBatchContext = () => {
	const context = useContext(BatchContext)
	if (!context)
		throw Error('no context')
	return context
}
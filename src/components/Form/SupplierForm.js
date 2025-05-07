import React from "react";

const SupplierForm = ({ name, setName, info, setInfo, handleSubmit, buttonLabel = "Добавить" }) => {
	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				className="form-control"
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Введите поставщика"
				required
			/>
			<input
				type="text"
				className="form-control"
				value={info}
				onChange={(e) => setInfo(e.target.value)}
				placeholder="Введите информацию"
				required
			/>
			<button type="submit" className="btn btn-primary mt-2">
				{buttonLabel}
			</button>
		</form>
	);
};


export default SupplierForm;

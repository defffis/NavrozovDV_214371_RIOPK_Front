import React from "react";

const LocationForm = ({ address, setAddress, type, setType, handleSubmit, buttonLabel = "Добавить" }) => {
	// Возможные варианты для выбора в select
	const typeOptions = ["Логистический центр", "Точка выдачи", "Склад", "Магазин"];

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				className="form-control"
				value={address}
				onChange={(e) => setAddress(e.target.value)}
				placeholder="Введите точку нахождения (адрес)"
				required
			/>
			<select
				className="form-control mt-2"
				value={type}
				onChange={(e) => setType(e.target.value)}
				required
			>
				<option value="">Выберите тип</option>
				{typeOptions.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			<button type="submit" className="btn btn-primary mt-2">
				{buttonLabel}
			</button>
		</form>
	);
};

export default LocationForm;

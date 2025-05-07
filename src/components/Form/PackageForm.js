import React from "react";
import { Select } from "antd";
import moment from 'moment';
const { Option } = Select;

const PackageForm = ({
	selectedProduct,
	setSelectedProduct,
	manufactureDate,
	setManufactureDate,
	expirationDate,
	setExpirationDate,
	handleSubmit,
	buttonLabel = "Упаковать товар",
	products

}) => {
	return (
		<form onSubmit={handleSubmit}>
			<Select
				bordered={false}
				placeholder="Выберите продукт"
				size="large"
				showSearch
				required
				className="form-select mb-3"
				labelInValue={selectedProduct.name}
				value={selectedProduct._id}
				onChange={(value) => setSelectedProduct(value)}
			>
				{products?.map((product) => (
					<Option key={product._id} value={product._id}>
						{product.name}
					</Option>
				))}
			</Select>
			<div className="mb-3">
				<input
					type="date"
					className="form-control"
					value={moment(manufactureDate).format('YYYY-MM-DD')}
					onChange={(e) => setManufactureDate(moment(e.target.value))}
					required
				/>
			</div>
			<div className="mb-3">
				<input
					type="date"
					className="form-control"
					value={moment(expirationDate).format('YYYY-MM-DD')}
					onChange={(e) => setExpirationDate(moment(e.target.value))}
					required
				/>
			</div>
			<button type="submit" className="btn btn-create">
				{buttonLabel}
			</button>
		</form>
	);
};

export default PackageForm;
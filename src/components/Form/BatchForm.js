import React from "react";
import { Select } from "antd";
const { Option } = Select;

const BatchForm = ({
	selectedPackage,
	setSelectedPackage,
	packages,
	selectedLocation,
	setSelectedLocation,
	locations,
	status,
	setStatus,
	handleSubmit

}) => {
	return (
		<div className="m-1 w-80">
			<Select
				bordered={false}
				placeholder="Выберите упакованный товар"
				size="large"
				showSearch
				required
				className="form-select mb-3"
				value={selectedPackage._id}
				labelInValue={`${selectedPackage.package_num} - ${selectedPackage.product.name}`}
				onChange={(value) => setSelectedPackage(value)}
			>
				{packages?.map((p) => (
					<Option key={p._id} value={p._id}>
						{`${p.package_num} - ${p.product.name}`}
					</Option>
				))}
			</Select>

			<Select
				bordered={false}
				placeholder="Выберите местоположение"
				size="large"
				showSearch
				required
				className="form-select mb-3"
				value={selectedLocation}
				onChange={(value) => setSelectedLocation(value)}
			>
				{locations?.map((l) => (
					<Option key={l._id} value={l._id}>
						{`${l.address} - ${l.type}`}
					</Option>
				))}
			</Select>

			<Select
				bordered={false}
				placeholder="Выберите статус"
				size="large"
				showSearch
				required
				className="form-select mb-3"
				value={status}
				onChange={(value) => setStatus(value)}
			>
				<Option value="На складе">На складе</Option>
				<Option value="Отправлено">Отправлено</Option>
				<Option value="Продано">Продано</Option>
				<Option value="Возврат">Возврат</Option>
			</Select>

			<div className="mb-3">
				<button className="btn btn-create" onClick={handleSubmit}>
					Отгрузить товар
				</button>
			</div>
		</div>
	);
};

export default BatchForm;

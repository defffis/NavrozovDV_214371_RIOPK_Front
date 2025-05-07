import React, { useState, useEffect, useContext } from "react";
import Layout from "./../components/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import "../../src/styles/CreateProductStyle.css"
import { useNavigate, useLocation } from "react-router-dom";
import { CategoryContext } from "../context/CategoryContext";
import { LocationContext } from "../context/LocationContext";
import { SupplierContext } from "../context/SupplierContext";
import { ProductContext } from "../context/ProductContext";
const { Option } = Select;

const UpdateProduct = () => {
	const navigate = useNavigate();
	const loc = useLocation();
	const { productId } = loc.state || {};
	const { dispatch } = useContext(ProductContext);
	const { categories } = useContext(CategoryContext);
	const { locations } = useContext(LocationContext);
	const { suppliers } = useContext(SupplierContext);
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [quantity, setQuantity] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [locationId, setLocationId] = useState("");
	const [supplierId, setSupplierId] = useState("");
	const [categoryName, setCategoryName] = useState("");
	const [locationName, setLocationName] = useState("");
	const [supplierName, setSupplierName] = useState("");



	useEffect(() => {
		const getCurrentData = async () => {
			try {
				const { data } = await axios.get(`/api/product/get-product/${productId}`);
				if (data?.success) {
					setName(data.product.name);
					setPrice(data.product.price);
					setQuantity(data.product.quantity);
					setCategoryId(data.product?.category?._id);
					setLocationId(data.product?.location?._id);
					setSupplierId(data.product?.supplier?._id);

					setCategoryName(data.product?.category?.name);
					setLocationName(data.product?.location?.address);
					setSupplierName(data.product?.supplier?.sup_name);

				}
			} catch (error) {
				console.log(error);
			}
		};

		getCurrentData();
	}, [productId]);

	const handleUpdate = async (e) => {
		e.preventDefault();

		if (!name || !price || !quantity || !categoryId || !locationId || !supplierId) {
			toast.error("Пожалуйста, заполните все поля");
			return;
		}

		try {
			const productData = new FormData();
			productData.append("name", name);
			productData.append("price", price);
			productData.append("category", categoryId);
			productData.append("location", locationId);
			productData.append("supplier", supplierId);
			productData.append("quantity", quantity);

			const { data } = await axios.put(`/api/product/update-product/${productId}`, productData, {
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (data?.success) {
				toast.success("Product Created Successfully");
				dispatch({ type: "UPDATE_PRODUCT", payload: data.product });
				navigate("/");
			} else {
				toast.error(data?.message);
			}
		} catch (error) {
			console.log(error);
			toast.error("something went wrong");
		}
	};

	return (
		<Layout title={"Редактирование товара"}>
			<div className="container-fluid m-3 p-3 dashboard">
				<div className="row">
					<div className="inventory-container">
						<h1 className="inventory-title">Редактирование товара</h1>
						<div className="m-1 w-80">
							<Select
								value={categoryId}
								bordered={false}
								placeholder={categoryName || "Выберите категорию"}
								size="large"
								showSearch
								required
								className="form-select mb-3"
								onChange={(value) => {
									setCategoryId(value);
								}}
							>
								{categories?.map((c) => (
									<Option key={c._id} value={c._id}>
										{c.name}
									</Option>
								))}
							</Select>
							<Select
								value={locationId}
								bordered={false}
								placeholder={locationName || "Выберите точку нахождения"}
								size="large"
								showSearch
								required
								className="form-select mb-3"
								onChange={(value) => {
									setLocationId(value);
								}}
							>
								{locations?.map((c) => (
									<Option key={c._id} value={c._id}>
										{c.address}
									</Option>
								))}
							</Select>
							<Select
								value={supplierId}
								bordered={false}
								placeholder={supplierName || "Выберите поставщика"}
								size="large"
								showSearch
								required
								className="form-select mb-3"
								onChange={(value) => {
									setSupplierId(value);
								}}
							>
								{suppliers?.map((c) => (
									<Option key={c._id} value={c._id}>
										{c.sup_name}
									</Option>
								))}
							</Select>
							<div className="mb-3">
								<input
									type="text"
									value={name}
									placeholder="Введите наименование"
									className="form-control"
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="mb-3">
								<input
									type="number"
									value={price}
									placeholder="Введите цену"
									className="form-control"
									onChange={(e) => setPrice(e.target.value)}
									required
								/>
							</div>
							<div className="mb-3">
								<input
									type="number"
									value={quantity}
									placeholder="Введите количество"
									className="form-control"
									onChange={(e) => setQuantity(e.target.value)}
									required
								/>
							</div>
							<div className="mb-3">
								<button className="btn btn-create" onClick={handleUpdate}>
									Сохранить изменения
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default UpdateProduct;

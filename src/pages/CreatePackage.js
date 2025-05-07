import React, { useState } from "react";
import Layout from "./../components/Layout";
import PackageForm from "../components/Form/PackageForm";
import toast from "react-hot-toast";
import axios from "axios";
import { useProductContext } from "../hooks/useProductContext";
import { useNavigate, useLocation } from "react-router-dom";
import moment from 'moment';

const CreatePackage = () => {
	const navigate = useNavigate();
	const { products, dispatch } = useProductContext();
	const loc = useLocation();
	const { product } = loc.state || {};
	const [selectedProduct, setSelectedProduct] = useState(product);
	const [manufactureDate, setManufactureDate] = useState(moment());
	const [expirationDate, setExpirationDate] = useState(moment());

	const handleCreate = async (e) => {
		e.preventDefault();

		if (!selectedProduct || !manufactureDate || !expirationDate) {
			toast.error("Пожалуйста, заполните все поля");
			return;
		}

		try {
			const packageData = new FormData();
			const productId = (typeof selectedProduct === 'object' && selectedProduct !== null) ? selectedProduct._id : selectedProduct;
			packageData.append("product", productId);
			packageData.append("manufacture_date", manufactureDate);
			packageData.append("expiration_date", expirationDate);

			const { data } = await axios.post('/api/package/create-package', packageData, {
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (data?.success) {
				toast.success("Package Created Successfully");
				dispatch({ type: "CREATE_PACKAGE", payload: data.package });
				navigate("/");
			} else {
				toast.error(data?.message);
			}
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		}
	};

	return (
		<Layout title={"Упаковка товара"}>
			<div className="container-fluid m-3 p-3 dashboard">
				<div className="row">
					<div className="inventory-container">
						<h1 className="inventory-title">Упаковка товара</h1>
						<PackageForm
							selectedProduct={selectedProduct}
							setSelectedProduct={setSelectedProduct}
							manufactureDate={manufactureDate}
							setManufactureDate={setManufactureDate}
							expirationDate={expirationDate}
							setExpirationDate={setExpirationDate}
							handleSubmit={handleCreate}
							buttonLabel="Упаковать товар"
							products={products}
						/>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default CreatePackage;

import React, { useState } from "react";
import Layout from "./../components/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { usePackageContext } from "../hooks/usePackageContext";
import { useLocationContext } from "../hooks/useLocationContext";
import BatchForm from "../components/Form/BatchForm";
import moment from "moment";

const Shipping = () => {
	const navigate = useNavigate();
	const loc = useLocation();
	const { prodPackage } = loc.state || {};
	const { packages } = usePackageContext();
	const { locations } = useLocationContext();


	const [selectedPackage, setSelectedPackage] = useState(prodPackage);
	const [selectedLocation, setSelectedLocation] = useState("");
	const [status, setStatus] = useState("На складе");

	const handleCreate = async () => {
		if (!selectedPackage || !selectedLocation || !status) {
			toast.error("Пожалуйста, заполните все поля");
			return;
		}

		try {
			const packageId = (typeof selectedPackage === 'object' && selectedPackage !== null) ? selectedPackage._id : selectedPackage;
			const response = await axios.post('/api/batch/create-batch', {
				prodPackage: packageId,
				location: selectedLocation,
				status: status
			});

			console.log(response.data.batch._id, prodPackage.product, selectedLocation)
			if (response.data.success) {
				toast.success("Отгрузка успешно создана");

				await axios.post('/api/movement/create-movement', {
					batch: response.data.batch,
					location_from: prodPackage.product.location,
					location_to: selectedLocation,
					movement_date: moment().format('YYYY-MM-DD')
				});

				navigate("/parties");
			} else {
				toast.error(response.data.message || "Ошибка при создании отгрузки");
			}
		} catch (error) {
			console.error("Error creating shipping:", error);
			toast.error("Ошибка при создании отгрузки");
		}
	};

	return (
		<Layout title={"Панель отгрузки товара"}>
			<div className="container-fluid m-3 p-3 dashboard">
				<div className="row">
					<div className="inventory-container">
						<h1 className="inventory-title">Создать партию на отгрузку</h1>
						<BatchForm
							selectedPackage={selectedPackage}
							setSelectedPackage={setSelectedPackage}
							packages={packages}
							selectedLocation={selectedLocation}
							setSelectedLocation={setSelectedLocation}
							locations={locations}
							status={status}
							setStatus={setStatus}
							handleSubmit={handleCreate}
						/>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Shipping;

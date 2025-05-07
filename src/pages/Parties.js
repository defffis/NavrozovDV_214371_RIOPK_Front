import { useEffect, useCallback, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import "./../styles/MainPage.css";
import { useAuthContext } from "../hooks/useAuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Modal } from "antd";
import moment from "moment";
import BatchForm from "../components/Form/BatchForm";
import { usePackageContext } from "../hooks/usePackageContext";
import { useLocationContext } from "../hooks/useLocationContext";
import { useBatchContext } from "../hooks/useBatchContext";

const Parties = () => {
	const navigate = useNavigate();
	const [visible, setVisible] = useState(false);
	const { packages } = usePackageContext();
	const { locations } = useLocationContext();
	const { batches, dispatch } = useBatchContext();
	const [batch, setBatch] = useState("");
	const [selectedPackage, setSelectedPackage] = useState("");
	const [selectedLocation, setSelectedLocation] = useState("");
	const [status, setStatus] = useState("На складе");
	const [searchTerm, setSearchTerm] = useState("");
	const { user } = useAuthContext();


	const getAllBatches = useCallback(async () => {
		try {
			const { data } = await axios.get("/api/batch/get-batch");
			if (data?.success) {
				dispatch({ type: 'SET_BATCH', payload: data.batches });
			}
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong in getting batch");
		}
	}, [dispatch]);

	useEffect(() => {
		getAllBatches();
	}, [getAllBatches]);


	const handleGetInfo = (batch) => {
		navigate('/batch-info', { state: { batch } });
	};


	const handleDelete = async (batchId) => {
		try {
			await axios.delete(`/api/movement/delete-movements/${batchId}`);
			const { data } = await axios.delete(`/api/batch/delete-batch/${batchId}`);
			if (data.success) {
				dispatch({ type: 'DELETE_BATCH', payload: batchId });
				toast.success("Партия успешно удалена");
			} else {
				toast.error(data.message || "Не удалось удалить товар");
			}
		} catch (error) {
			console.error("Ошибка при удалении товара:", error);
			toast.error("Ошибка при удалении товара");
		}
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		try {
			const { data } = await axios.put(
				`/api/batch/update-batch/${batch._id}`,
				{
					prodPackage: selectedPackage,
					location: selectedLocation,
					status: status,
				}
			);

			if (data?.success) {
				toast.success(`batch is updated`);
				dispatch({ type: "UPDATE_BATCH", payload: data.batch });

				if (selectedLocation !== batch.location._id) {
					console.log("Проверка прошла успешно")
					await axios.post('/api/movement/create-movement', {
						batch: batch._id,
						location_from: batch.location._id,
						location_to: selectedLocation,
						movement_date: moment().format('YYYY-MM-DD')
					});
					toast.success("Запись о перемещении создана");
				}

				window.location.reload();
				setBatch(null);
				setSelectedLocation("");
				setStatus("");
				setVisible(false);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const filteredBatches = batches?.filter(batch =>
		batch.batch_num.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<Layout title="Партия отгруженных товаров">
			<div className="inventory-container">
				<h1 className="inventory-title">Партия отгруженных товаров</h1>

				{/* Поле поиска */}
				<div className="search-container">
					<input
						type="text"
						className="form-control search-input"
						placeholder="Поиск товаров по номеру партии..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>


				{filteredBatches && filteredBatches.length > 0 ? (
					<div className="package-grid">
						{filteredBatches.map((b) => (
							<div className="package-card" key={b._id}>
								<p className="package-detail">Номер партии: {b.batch_num}</p>
								<p className="package-detail">Номер упаковки: {b.package.package_num}</p>
								<p className="package-detail">Товар: {b.package.product?.name}</p>
								<p className="package-detail">Местоположение: {b.location.address}</p>
								<p className="package-detail">Статус: {b.status}</p>

								{(user?.role === 0 || user?.role === 1 || user?.role === 3) && (
									<>
										<button
											className="btn btn-primary ms-2"
											onClick={() => {
												setVisible(true);
												setBatch(b)
												setSelectedPackage(b.package);
												setSelectedLocation(b.location._id);
												setStatus(b.status);
											}}
										>
											Редактировать
										</button>
										<button className="btn btn-danger ms-2" onClick={() => handleDelete(b._id)}>
											Удалить
										</button>
									</>
								)}
								<button className="btn btn-danger ms-2" onClick={() => handleGetInfo(b)}>
									Подробнее
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="no-products-message">Нет отгруженных товаров</div>
				)}

				<Modal
					onCancel={() => setVisible(false)}
					footer={null}
					visible={visible}
				>
					<BatchForm
						selectedPackage={selectedPackage}
						setSelectedPackage={setSelectedPackage}
						selectedLocation={selectedLocation}
						setSelectedLocation={setSelectedLocation}
						locations={locations}
						packages={packages}
						status={status}
						setStatus={setStatus}
						handleSubmit={handleUpdate}
					/>
				</Modal>
			</div>
		</Layout>
	);
};

export default Parties;

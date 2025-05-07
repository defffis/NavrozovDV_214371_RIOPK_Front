import { useEffect, useCallback, useState } from "react";
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import "./../styles/PackageStyle.css";
import { useAuthContext } from "../hooks/useAuthContext";
import axios from "axios";
import { Modal } from "antd";
import { toast } from "react-hot-toast";
import { usePackageContext } from "../hooks/usePackageContext";
import PackageForm from "../components/Form/PackageForm";
import { useProductContext } from "../hooks/useProductContext";

const Packages = () => {
	const navigate = useNavigate();
	const { products } = useProductContext() || [];
	const [visible, setVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState("");
	const [manufactureDate, setManufactureDate] = useState(moment());
	const [expirationDate, setExpirationDate] = useState(moment());
	const [prodPackage, setProdPackage] = useState();
	const [searchTerm, setSearchTerm] = useState("");
	const { packages, dispatch } = usePackageContext();
	const { user } = useAuthContext();


	const getAllPackages = useCallback(async () => {
		try {
			const { data } = await axios.get("/api/package/get-package");
			if (data?.success) {
				dispatch({ type: 'SET_PACKAGE', payload: data.packages });
			}
		} catch (error) {
			console.log(error);
		}
	}, [dispatch]);

	useEffect(() => {
		getAllPackages();
	}, [getAllPackages]);

	//update package
	const handleUpdate = async (e) => {
		e.preventDefault();
		try {
			console.log(prodPackage)
			const { data } = await axios.put(
				`/api/package/update-package/${prodPackage._id}`,
				{
					product: selectedProduct,
					manufacture_date: moment(manufactureDate).format('YYYY-MM-DD'),
					expiration_date: moment(expirationDate).format('YYYY-MM-DD'),
				}
			);

			if (data?.success) {
				console.log(data.package)
				toast.success(`package is updated`);
				dispatch({ type: "UPDATE_PACKAGE", payload: data.package });
				window.location.reload();
				setProdPackage(null);
				setSelectedProduct("");
				setManufactureDate("");
				setExpirationDate("");
				setVisible(false);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleBatch = (prodPackage) => {
		navigate('/logistician/batch', { state: { prodPackage } });
	};


	const handleDelete = async (packageId) => {
		try {
			const { data } = await axios.delete(`/api/package/delete-package/${packageId}`);
			if (data.success) {
				dispatch({ type: 'DELETE_PACKAGE', payload: packageId });
				toast.success("Успешно удалено");
			} else {
				toast.error(data.message || "Не удалось удалить");
			}
		} catch (error) {
			console.error("Ошибка при удалении:", error);
			toast.error("Ошибка при удалении");
		}
	};

	const filteredPackages = packages?.filter(prodPackage =>
		prodPackage.package_num.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<Layout title="Упакованные товары">
			<div className="inventory-container">
				<h1 className="inventory-title">Упакованные товары</h1>

				{/* Поле поиска */}
				<div className="search-container">
					<input
						type="text"
						className="form-control search-input"
						placeholder="Поиск товаров по номеру упаковки..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>


				{filteredPackages && filteredPackages.length > 0 ? (
					<div className="package-grid">
						{filteredPackages.map((p) => (
							<div className="package-card" key={p.package_num}>
								<p className="package-detail">Номер упаковки: {p.package_num}</p>
								<p className="package-detail">Товар: {p.product.name}</p>
								<p className="package-detail">Дата упаковки: {moment(p.manufacture_date).format('YYYY-MM-DD')}</p>
								<p className="package-detail">Срок годности (До): {moment(p.expiration_date).format('YYYY-MM-DD')}</p>

								{user?.role === 3 && (
									<>
										<button className="btn btn-primary me-2" onClick={() => handleBatch(p)}>
											Отправить товар
										</button>
									</>
								)}
								<button
									className="btn btn-primary ms-2"
									onClick={() => {
										setVisible(true);
										setSelectedProduct(p.product);
										setManufactureDate(p.manufacture_date);
										setExpirationDate(p.expiration_date)
										setProdPackage(p);
									}}
								>
									Редактировать
								</button>
								<button className="btn btn-primary" onClick={() => handleDelete(p._id)}>
									Удалить
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="no-products-message">
						Нет упакованных товаров
					</div>
				)}
				<Modal
					onCancel={() => setVisible(false)}
					footer={null}
					visible={visible}
				>
					<PackageForm
						selectedProduct={selectedProduct}
						setSelectedProduct={setSelectedProduct}
						manufactureDate={manufactureDate}
						setManufactureDate={setManufactureDate}
						expirationDate={expirationDate}
						setExpirationDate={setExpirationDate}
						handleSubmit={handleUpdate}
						buttonLabel="Сохранить изменения"
						products={products}
					/>
				</Modal>
			</div>
		</Layout>
	);
};

export default Packages;

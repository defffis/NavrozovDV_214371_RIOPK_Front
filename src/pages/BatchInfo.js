import { useEffect, useCallback, useState } from "react";
import { useLocation } from 'react-router-dom';
import Layout from "../components/Layout";
import "./../styles/MainPage.css";
import axios from "axios";
import moment from "moment";
import { toast } from "react-hot-toast";
import "./../styles/BatchInfoStyle.css";

const BatchInfo = () => {
	const loc = useLocation();
	const { batch } = loc.state || {};
	const [movements, setMovements] = useState([]);


	const getAllMovements = useCallback(async () => {
		try {
			const { data } = await axios.get(`/api/movement/get-movement/${batch._id}`);
			if (data?.success) {
				setMovements(data.movements)
			}
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong in getting movements");
		}
	}, [batch._id, setMovements]);

	useEffect(() => {
		getAllMovements();
	}, [getAllMovements]);


	const handleDelete = async (movementId) => {
		try {
			const { data } = await axios.delete(`/api/movement/delete-movement/${movementId}`);
			if (data.success) {
				toast.success("Перемещение успешно удалено");
			} else {
				toast.error(data.message || "Не удалось удалить товар");
			}
		} catch (error) {
			console.error("Ошибка при удалении товара:", error);
			toast.error("Ошибка при удалении товара");
		}
	};

	return (
		<Layout title="Информация о партии">
			<div className="batch-info-container">
				<div className="batch-main-info">
					<h2>Основная информация</h2>
					<p><strong>Номер упаковки:</strong> {batch.package.package_num}</p>
					<p><strong>Товар:</strong> {batch.package.product?.name}</p>
					<p><strong>Местоположение:</strong> {batch.location.address}</p>
					<p><strong>Статус:</strong> {batch.status}</p>
				</div>

				<div className="batch-movements">
					<h2>Перемещения</h2>
					<table className="movements-table">
						<thead>
							<tr>
								<th>№</th>
								<th>Откуда</th>
								<th>Куда</th>
								<th>Дата</th>
								<th>Действия</th>
							</tr>
						</thead>
						<tbody>
							{movements && movements.length > 0 ? (
								movements.map((movement, index) => (
									<tr key={movement._id}>
										<td>{index + 1}</td>
										<td>{`${movement.location_from.address} - ${movement.location_from.type}`}</td>
										<td>{`${movement.location_to.address} - ${movement.location_to.type}`}</td>
										<td>{moment(movement.movement_date).format('YYYY-MM-DD')}</td>
										<td>
											<button
												className="btn btn-danger btn-sm"
												onClick={() => handleDelete(movement._id)}
											>
												Удалить
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="5">Нет данных о перемещениях</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</Layout>
	);
};

export default BatchInfo;

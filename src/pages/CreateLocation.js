import React, { useCallback, useEffect, useState } from "react";
import Layout from "./../components/Layout";
import "../../src/styles/CreateSide.css"
import toast from "react-hot-toast";
import axios from "axios";
import LocationForm from "./../components/Form/LocationForm";
import { Modal } from "antd";
import { useLocationContext } from "../hooks/useLocationContext";

const CreateLocation = () => {
	const { locations, dispatch } = useLocationContext();
	const [address, setAddress] = useState("");
	const [type, setType] = useState("");
	const [visible, setVisible] = useState(false);
	const [selected, setSelected] = useState(null);
	const [updatedAddress, setUpdatedAddress] = useState("");
	const [updatedType, setUpdatedType] = useState("");

	//create loc form
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const { data } = await axios.post("/api/location/create-location", {
				address,
				type,
			});
			if (data?.success) {
				toast.success(`${address} is added`);
				dispatch({ type: 'CREATE_LOCATION', payload: data.location });
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error("something went wrong");
		}
	};

	//get all loc
	const getAllLocation = useCallback(async () => {
		try {
			const { data } = await axios.get("/api/location/get-location");
			if (data?.success) {
				dispatch({ type: 'SET_LOCATION', payload: data.locations });
			}
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong in getting location");
		}
	}, [dispatch]);

	useEffect(() => {
		getAllLocation();
	}, [getAllLocation]);

	//update location
	const handleUpdate = async (e) => {
		e.preventDefault();
		try {
			const { data } = await axios.put(
				`/api/location/update-location/${selected._id}`,
				{
					address: updatedAddress,
					type: updatedType
				}
			);
			if (data?.success) {
				toast.success(`${updatedAddress} is updated`);
				dispatch({ type: "UPDATE_LOCATION", payload: data.location });
				setSelected(null);
				setUpdatedAddress("");
				setUpdatedType("");
				setVisible(false);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.log(error);
		}
	};

	//delete location
	const handleDelete = async (id) => {
		try {
			const { data } = await axios.delete(
				`/api/location/delete-location/${id}`
			);
			if (data.success) {
				toast.success(`location is deleted`);
				dispatch({ type: "DELETE_LOCATION", payload: id });
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error("Something went wrong");
		}
	};

	return (
		<Layout title={"Создание места нахождения"}>
			<div className="container-fluid m-3 p-3 dashboard">
				<div className="row">
					<div className="inventory-container">
						<h1 className="inventory-title">Создание места нахождения</h1>
						<div className="p-3 w-50">
							<LocationForm
								address={address}
								setAddress={setAddress}
								type={type}
								setType={setType}
								handleSubmit={handleSubmit}
								buttonLabel="Добавить"
							/>
						</div>
						<div className="w-75">
							<table className="table">
								<thead>
									<tr>
										<th scope="col">Адрес</th>
										<th scope="col">Тип</th>
										<th scope="col">Действия</th>
									</tr>
								</thead>
								<tbody>
									{locations?.map((c) => (
										<>
											<tr key={c._id}>
												<td key={c._id}>{c.address}</td>
												<td key={c._id}>{c.type}</td>
												<td>
													<button
														className="btn btn-primary ms-2"
														onClick={() => {
															setVisible(true);
															setUpdatedAddress(c.address);
															setUpdatedType(c.type);
															setSelected(c);
														}}
													>
														Редактировать
													</button>
													<button
														className="btn btn-danger ms-2"
														onClick={() => {
															handleDelete(c._id);
														}}
													>
														Удалить
													</button>
												</td>
											</tr>
										</>
									))}
								</tbody>
							</table>
						</div>
						<Modal
							onCancel={() => setVisible(false)}
							footer={null}
							visible={visible}
						>
							<LocationForm
								address={updatedAddress}
								type={updatedType}
								setType={setUpdatedType}
								setAddress={setUpdatedAddress}
								handleSubmit={handleUpdate}
								buttonLabel="Сохранить изменения"
							/>
						</Modal>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default CreateLocation;

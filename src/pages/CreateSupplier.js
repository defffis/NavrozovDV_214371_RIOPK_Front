import React, { useCallback, useEffect, useState } from "react";
import Layout from "./../components/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import SupplierForm from "./../components/Form/SupplierForm";
import { Modal } from "antd";
import { useSupplierContext } from "../hooks/useSupplierContext";

const CreateSupplier = () => {
	const { suppliers, dispatch } = useSupplierContext();
	const [name, setName] = useState("");
	const [info, setInfo] = useState("");
	const [visible, setVisible] = useState(false);
	const [selected, setSelected] = useState(null);
	const [updatedName, setUpdatedName] = useState("");
	const [updatedInfo, setUpdatedInfo] = useState("");

	//create sup form
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const { data } = await axios.post("/api/supplier/create-supplier", {
				sup_name: name,
				info,
			});
			if (data?.success) {
				toast.success(`${name} is added`);
				dispatch({ type: "CREATE_SUPPLIER", payload: data.supplier });
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error("something went wrong");
		}
	};

	//get all loc
	const getAllSupplier = useCallback(async () => {
		try {
			const { data } = await axios.get("/api/supplier/get-supplier");
			if (data?.success) {
				dispatch({ type: 'SET_SUPPLIER', payload: data.suppliers });
			}
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong in getting supplier");
		}
	}, [dispatch]);

	useEffect(() => {
		getAllSupplier();
	}, [getAllSupplier]);

	//update location
	const handleUpdate = async (e) => {
		e.preventDefault();
		try {
			const { data } = await axios.put(
				`/api/supplier/update-supplier/${selected._id}`,
				{
					sup_name: updatedName,
					info: updatedInfo
				}
			);
			if (data?.success) {
				toast.success(`${updatedName} is updated`);
				setSelected(null);
				setUpdatedName("");
				setUpdatedInfo("");
				setVisible(false);
				dispatch({ type: "UPDATE_SUPPLIER", payload: data.supplier });
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
				`/api/supplier/delete-supplier/${id}`
			);
			if (data.success) {
				toast.success(`supplier is deleted`);
				dispatch({ type: "DELETE_SUPPLIER", payload: id });
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error("Something went wrong");
		}
	};

	return (
		<Layout title={"Создание поставщика"}>
			<div className="container-fluid m-3 p-3 dashboard">
				<div className="row">
					<div className="inventory-container">
						<h1 className="inventory-title">Создание поставщика</h1>
						<div className="p-3 w-50">
							<SupplierForm
								name={name}
								setName={setName}
								info={info}
								setInfo={setInfo}
								handleSubmit={handleSubmit}
								buttonLabel="Добавить"
							/>
						</div>
						<div className="w-75">
							<table className="table">
								<thead>
									<tr>
										<th scope="col">Имя поставщика</th>
										<th scope="col">Описание</th>
										<th scope="col">Действия</th>
									</tr>
								</thead>
								<tbody>
									{suppliers?.map((c) => (
										<>
											<tr key={c._id}>
												<td key={c._id}>{c.sup_name}</td>
												<td key={c._id}>{c.info}</td>
												<td>
													<button
														className="btn btn-primary ms-2"
														onClick={() => {
															setVisible(true);
															setUpdatedName(c.sup_name);
															setUpdatedInfo(c.info);
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
							<SupplierForm
								name={updatedName}
								setName={setUpdatedName}
								info={updatedInfo}
								setInfo={setUpdatedInfo}
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

export default CreateSupplier;

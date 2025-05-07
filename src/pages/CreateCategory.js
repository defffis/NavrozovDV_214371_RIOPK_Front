import React, { useCallback, useEffect, useState } from "react";
import Layout from "./../components/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import CategoryForm from "./../components/Form/CategoryForm";
import { useCategoryContext } from "../hooks/useCategoryContext";
import { Modal } from "antd";

const CreateCategory = () => {
  const { categories, dispatch } = useCategoryContext();
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");

  //create category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/category/create-category", {
        name,
      });
      if (data?.success) {
        toast.success(`${name} is created`);
        dispatch({ type: "CREATE_CATEGORY", payload: data.category });
        setName("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //get all categories
  const getAllCategory = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/category/get-category");
      if (data?.success) {
        dispatch({ type: 'SET_CATEGORY', payload: data.category });
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting category");
    }
  }, [dispatch]); // добавляем dispatch, если он тоже используется внутри

  useEffect(() => {
    getAllCategory();
  }, [getAllCategory]);

  //update category
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `/api/category/update-category/${selected._id}`,
        { name: updatedName }
      );

      if (data?.success) {
        toast.success(`${updatedName} is updated`);
        dispatch({ type: "UPDATE_CATEGORY", payload: data.category });
        setSelected(null);
        setUpdatedName("");
        setVisible(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //delete category
  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`/api/category/delete-category/${id}`);
      if (data.success) {
        toast.success(`Category is deleted`);
        dispatch({ type: "DELETE_CATEGORY", payload: id });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title={"Добавление категории"}>
      <div className="container-fluid m-3 p-3 dashboard">
        <div className="row">
          <div className="inventory-container">
            <h1 className="inventory-title">Создание категории</h1>
            <div className="p-3 w-50">
              <CategoryForm
                handleSubmit={handleSubmit}
                value={name}
                setValue={setName}
              />
            </div>
            <div className="w-75">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Название</th>
                    <th scope="col">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((c) => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>
                        <button
                          className="btn btn-primary ms-2"
                          onClick={() => {
                            setVisible(true);
                            setUpdatedName(c.name);
                            setSelected(c);
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          className="btn btn-danger ms-2"
                          onClick={() => handleDelete(c._id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal
              onCancel={() => setVisible(false)}
              footer={null}
              visible={visible}
            >
              <CategoryForm
                value={updatedName}
                setValue={setUpdatedName}
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

export default CreateCategory;

import React, { useState, useEffect } from "react";
import "./../styles/CreateProductStyle.css";
import Layout from "./../components/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
import { useCategoryContext } from "../hooks/useCategoryContext";
import { useLocationContext } from "../hooks/useLocationContext";
import { useSupplierContext } from "../hooks/useSupplierContext";
import { useProductContext } from "../hooks/useProductContext";
const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const { dispatch } = useProductContext();
  const { categories } = useCategoryContext();
  const { locations } = useLocationContext();
  const { suppliers } = useSupplierContext();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");



  useEffect(() => {

  }, []);

  //create product function
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name || !price || !quantity || !category || !location || !supplier) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    try {
      console.log(name, price, quantity, category, location, supplier)
      const productData = new FormData();
      productData.append("name", name);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("location", location);
      productData.append("supplier", supplier);
      productData.append("quantity", quantity);

      const { data } = axios.post('/api/product/create-product', productData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (data?.success) {
        toast.error(data?.message);
        dispatch({ type: "CREATE_PRODUCT", payload: data.product });
      } else {
        toast.success("Product Created Successfully");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error("something went wrong");
    }
  };

  return (
    <Layout title={"Создание товара"}>
      <div className="container-fluid m-3 p-3 dashboard">
        <div className="row">
          <div className="create-product-container">
            <h1 className="inventory-title">Создание товара</h1>
            <div className="m-1 w-80">
              <Select
                bordered={false}
                placeholder="Выберите категорию"
                size="large"
                showSearch
                required
                className="form-select mb-3"
                onChange={(value) => {
                  setCategory(value);
                }}
              >
                {categories?.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
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
                onChange={(value) => {
                  setLocation(value);
                }}
              >
                {locations?.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.address}
                  </Option>
                ))}
              </Select>
              <Select
                bordered={false}
                placeholder="Выберите поставщика"
                size="large"
                showSearch
                required
                className="form-select mb-3"
                onChange={(value) => {
                  setSupplier(value);
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
                <button className="btn btn-create" onClick={handleCreate}>
                  Создать товар
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;

import { useEffect, useCallback, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useProductContext } from "../hooks/useProductContext";
import Layout from "../components/Layout";
import "./../styles/MainPage.css";
import { useAuthContext } from "../hooks/useAuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useCategoryContext } from "../hooks/useCategoryContext";

const Home = () => {
    const navigate = useNavigate();
    const { products, dispatch } = useProductContext();
    const { categories } = useCategoryContext();
    const { user } = useAuthContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [file, setFile] = useState(null);

    const getAllProducts = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/product/get-product");
            console.log(data.products)
            if (data?.success) {
                dispatch({ type: 'SET_PRODUCT', payload: data.products });
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    useEffect(() => {
        getAllProducts();
    }, [getAllProducts]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) {
            toast.error("Пожалуйста, выберите файл для загрузки");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await axios.post("/api/product/read-file", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (data.success) {
                toast.success("Файл успешно загружен");
                getAllProducts();
            } else {
                toast.error(data.message || "Ошибка при загрузке файла");
            }
        } catch (error) {
            toast.error("Ошибка при загрузке файла");
        }
    };

    const handleUpdate = (productId) => {
        navigate('/product/update', { state: { productId } });
    };

    const handlePackage = (product) => {
        navigate('/logistician/package', { state: { product } });
    };

    const handleDelete = async (productId) => {
        try {
            const { data } = await axios.delete(`/api/product/delete-product/${productId}`);
            if (data.success) {
                dispatch({ type: 'DELETE_PRODUCT', payload: productId });
                toast.success("Товар успешно удален");
            } else {
                toast.error(data.message || "Не удалось удалить товар");
            }
        } catch (error) {
            console.error("Ошибка при удалении товара:", error);
            toast.error("Ошибка при удалении товара");
        }
    };

    // Фильтрация по названию и категории
    const filteredProducts = products?.filter(product => {
        const matchesSearchTerm = product.serial_num.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesCategory
        if (!product.category)
            matchesCategory = true
        else
            matchesCategory = selectedCategory ? product.category._id === selectedCategory : true;
        return matchesSearchTerm && matchesCategory;
    });

    return (
        <Layout title="Приемка">
            <div className="inventory-container">
                <h1 className="inventory-title">Товары на складе</h1>

                {/* Поле поиска */}
                <div className="search-container">
                    <input
                        type="text"
                        className="form-control search-input"
                        placeholder="Поиск товаров по серийному номеру..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Кнопки для фильтрации по категориям */}
                <div className="category-buttons">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setSelectedCategory(null)} // Кнопка для сброса фильтра
                    >
                        Все товары
                    </button>
                    {categories?.map((category) => (
                        <button
                            key={category._id}
                            className={`btn btn-outline-primary ${selectedCategory === category._id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category._id)} // Выбор категории
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {filteredProducts && filteredProducts.length > 0 ? (
                    <div className="product-grid">
                        {filteredProducts.map((product) => (
                            <div className="product-card" key={product.serial_num}>
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-detail">Серийный номер: {product.serial_num}</p>
                                <p className="product-detail">Цена: {product.price} руб.</p>
                                <p className="product-detail">Поставщик: {product.supplier && product.supplier.sup_name ? product.supplier.sup_name : 'Неизвестно'}</p>
                                <p className="product-detail">Категория: {product.category && product.category.name ? product.category.name : 'Неизвестно'}</p>
                                <p className="product-detail">Точка нахождения: {product.location && product.location.address ? product.location.address : 'Неизвестно'}</p>
                                <p className="product-detail">Количество: {product.quantity}</p>

                                {user.role === 3 && (
                                    <button className="btn btn-primary me-2 mb-3" onClick={() => handlePackage(product)}>
                                        Упаковать товар
                                    </button>
                                )}
                                {(user.role === 0 || user.role === 1 || user.role === 3) && (
                                    <>
                                        <button className="btn btn-primary mb-3" onClick={() => handleUpdate(product._id)}>
                                            Редактировать товар
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleDelete(product._id)}>
                                            Удалить товар
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-products-message">
                        Товары еще не добавлены
                    </div>
                )}


                {user.role === 0 && (
                    <>
                        <div className="mt-4 d-flex align-items-center">
                            <input
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                className="form-control"
                            />
                            <button className="btn btn-upload" onClick={handleFileUpload}>
                                Загрузить
                            </button>
                        </div>
                    </>
                )}

            </div>
        </Layout >
    );
};

export default Home;


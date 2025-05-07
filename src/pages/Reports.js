import React from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Layout from "../components/Layout";
import moment from "moment";
import "./../styles/ReportsPage.css";

const Reports = () => {

  const handleProductReport = async () => {
    try {
      const { data } = await axios.post(`/api/report/product-report`, {
        date: moment().format('YYYY-MM-DD')
      });
      console.log(data)
      if (data.success) {
        toast.success("Отчет успешно создан");
      } else {
        toast.error(data.message || "Не удалось создать отчет");
      }
    } catch (error) {
      console.error("Ошибка при создании отчета:", error);
      toast.error("Ошибка при создании отчета");
    }
  };

  const handleBatchReport = async () => {
    try {
      const { data } = await axios.post(`/api/report/batch-report`, {
        date: moment().format('YYYY-MM-DD')
      });
      if (data.success) {
        toast.success("Отчет успешно создан");
      } else {
        toast.error(data.message || "Не удалось создать отчет");
      }
    } catch (error) {
      console.error("Ошибка при создании отчета:", error);
      toast.error("Ошибка при создании отчета");
    }
  };

  const handlePackageReport = async () => {
    try {
      const { data } = await axios.post(`/api/report/package-report`, {
        date: moment().format('YYYY-MM-DD')
      });
      if (data.success) {
        toast.success("Отчет успешно создан");
      } else {
        toast.error(data.message || "Не удалось создать отчет");
      }
    } catch (error) {
      console.error("Ошибка при создании отчета:", error);
      toast.error("Ошибка при создании отчета");
    }
  };

  return (
    <Layout title="Создание отчетов">
      <div className="reports-page">
        <h1>Создание отчетов</h1>
        <div className="buttons-container">
          <button className="report-button" onClick={handleProductReport}>
            Отчет по продуктам
          </button>
          <button className="report-button" onClick={handleBatchReport}>
            Отчет по партиям
          </button>
          <button className="report-button" onClick={handlePackageReport}>
            Отчет по упаковкам
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;

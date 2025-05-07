import React from "react";

const CategoryForm = ({ value, setValue, handleSubmit, buttonLabel = "Добавить" }) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-control"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Введите название категории"
        required
      />
      <button type="submit" className="btn btn-primary mt-2">
        {buttonLabel}
      </button>
    </form>
  );
};


export default CategoryForm;

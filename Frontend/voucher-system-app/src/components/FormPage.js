import React from "react";

const FormPage = ({ title, onSubmit, children }) => {
  return (
    <div className="form-page">
      <h2>{title}</h2>
      <form onSubmit={onSubmit} className="form-grid">
        {children}
        {/* ❌ Removed default Submit button here */}
      </form>
    </div>
  );
};

export default FormPage;

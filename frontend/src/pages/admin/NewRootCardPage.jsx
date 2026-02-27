import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RootCardForm from "@/components/admin/RootCardForm";

const NewRootCardPage = () => {
  const navigate = useNavigate();

  const handleBackToList = () => {
    navigate("/admin/root-cards");
  };

  const handleCreateSuccess = () => {
    navigate("/admin/root-cards");
  };

  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Root Cards
        </button>
      </div>
      <RootCardForm
        mode="create"
        onSubmit={handleCreateSuccess}
        onCancel={handleBackToList}
      />
    </div>
  );
};

export default NewRootCardPage;

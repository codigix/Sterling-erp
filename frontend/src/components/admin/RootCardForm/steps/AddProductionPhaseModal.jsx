import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter } from "../../../ui/Modal";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import axios from "../../../../utils/api";
import toast from "../../../../utils/toastUtils";

const AddProductionPhaseModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Phase name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/production/phases-master", {
        name,
        description,
      });
      if (response.data.success) {
        toast.success("Production phase added successfully");
        onSuccess(response.data.data);
        setName("");
        setDescription("");
        onClose();
      }
    } catch (error) {
      console.error("Error adding production phase:", error);
      toast.error(error.response?.data?.message || "Failed to add production phase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Production Phase">
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <Input
            label="Phase Name"
            placeholder="Enter phase name (e.g., Special Treatment)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-left">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100"
              placeholder="Enter description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Add Phase
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default AddProductionPhaseModal;

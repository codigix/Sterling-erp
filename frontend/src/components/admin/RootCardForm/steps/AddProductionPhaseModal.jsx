import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter } from "../../../ui/Modal";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import axios from "../../../../utils/api";
import toast from "../../../../utils/toastUtils";

const AddProductionPhaseModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Phase name is required");
      return;
    }

    // Instead of calling the backend master API, we just return the data locally
    const newLocalPhase = {
      id: "local-" + Date.now(), // Generate a unique local ID
      name: name.trim(),
      description: description,
      hourly_rate: parseFloat(hourlyRate) || 0,
      is_default: false
    };

    toast.success("Phase added to this root card");
    onSuccess(newLocalPhase);
    setName("");
    setDescription("");
    setHourlyRate("");
    onClose();
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
          <Input
            label="Hourly Rate (INR)"
            type="number"
            placeholder="Enter hourly rate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            min="0"
            step="0.01"
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

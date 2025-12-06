import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import '../../styles/TaskPage.css';

const ProductionPlanFormPage = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    projectId: '',
    planName: '',
    startDate: '',
    endDate: '',
    estimatedCompletionDate: '',
    assignedSupervisor: '',
    notes: '',
    stages: []
  });
  const [employees, setEmployees] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [newStage, setNewStage] = useState({
    stageName: '',
    stageType: 'in_house',
    plannedStartDate: '',
    plannedEndDate: '',
    estimatedDurationDays: '',
    assignedEmployeeId: '',
    facilityId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
    fetchFacilities();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/sales');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await axios.get('/api/inventory/facilities/available');
      setFacilities(response.data);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStageInputChange = (e) => {
    const { name, value } = e.target;
    setNewStage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addStage = () => {
    if (!newStage.stageName) {
      setError('Stage name is required');
      return;
    }

    if (newStage.stageType === 'in_house' && !newStage.assignedEmployeeId) {
      setError('For in-house stages, please assign an employee');
      return;
    }

    const stage = { ...newStage, id: Date.now() };
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, stage]
    }));

    setNewStage({
      stageName: '',
      stageType: 'in_house',
      plannedStartDate: '',
      plannedEndDate: '',
      estimatedDurationDays: '',
      assignedEmployeeId: '',
      facilityId: '',
      notes: ''
    });

    setError('');
  };

  const removeStage = (stageId) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter(s => s.id !== stageId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectId || !formData.planName) {
      setError('Project and plan name are required');
      return;
    }

    if (formData.stages.length === 0) {
      setError('Please add at least one production stage');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/production/plans', {
        projectId: formData.projectId,
        planName: formData.planName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        estimatedCompletionDate: formData.estimatedCompletionDate,
        assignedSupervisor: formData.assignedSupervisor,
        notes: formData.notes
      });

      setSuccess('Production plan created successfully!');
      setFormData({
        projectId: '',
        planName: '',
        startDate: '',
        endDate: '',
        estimatedCompletionDate: '',
        assignedSupervisor: '',
        notes: '',
        stages: []
      });

      setTimeout(() => {
        window.location.href = '/department/production';
      }, 2000);
    } catch (err) {
      setError('Failed to create production plan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (id) => {
    const employee = employees.find(e => e.id == id);
    return employee ? employee.username : 'Unknown';
  };

  const getFacilityName = (id) => {
    const facility = facilities.find(f => f.id == id);
    return facility ? facility.name : 'Not assigned';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Production Plan</h1>
        <p>Define production stages and assign responsibilities</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <Card className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Project:</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.project_name || project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Plan Name:</label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter plan name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>End Date:</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Estimated Completion:</label>
                <input
                  type="date"
                  name="estimatedCompletionDate"
                  value={formData.estimatedCompletionDate}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Assigned Supervisor:</label>
                <select
                  name="assignedSupervisor"
                  value={formData.assignedSupervisor}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Supervisor</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Notes:</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Additional notes for this production plan"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Production Stages</h2>

            <div className="stage-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Stage Name:</label>
                  <input
                    type="text"
                    name="stageName"
                    value={newStage.stageName}
                    onChange={handleStageInputChange}
                    className="form-control"
                    placeholder="e.g., Machining, Assembly"
                  />
                </div>

                <div className="form-group">
                  <label>Type:</label>
                  <select
                    name="stageType"
                    value={newStage.stageType}
                    onChange={handleStageInputChange}
                    className="form-control"
                  >
                    <option value="in_house">In House</option>
                    <option value="outsource">Outsource</option>
                  </select>
                </div>
              </div>

              {newStage.stageType === 'in_house' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Assigned Employee:</label>
                      <select
                        name="assignedEmployeeId"
                        value={newStage.assignedEmployeeId}
                        onChange={handleStageInputChange}
                        className="form-control"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Facility:</label>
                      <select
                        name="facilityId"
                        value={newStage.facilityId}
                        onChange={handleStageInputChange}
                        className="form-control"
                      >
                        <option value="">Select Facility</option>
                        {facilities.map(fac => (
                          <option key={fac.id} value={fac.id}>
                            {fac.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Planned Start Date:</label>
                  <input
                    type="date"
                    name="plannedStartDate"
                    value={newStage.plannedStartDate}
                    onChange={handleStageInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Planned End Date:</label>
                  <input
                    type="date"
                    name="plannedEndDate"
                    value={newStage.plannedEndDate}
                    onChange={handleStageInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Estimated Duration (days):</label>
                  <input
                    type="number"
                    name="estimatedDurationDays"
                    value={newStage.estimatedDurationDays}
                    onChange={handleStageInputChange}
                    className="form-control"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Stage Notes:</label>
                <textarea
                  name="notes"
                  value={newStage.notes}
                  onChange={handleStageInputChange}
                  className="form-control"
                  placeholder="Notes for this stage"
                  rows="2"
                />
              </div>

              <Button
                text="+ Add Stage"
                variant="secondary"
                size="sm"
                onClick={addStage}
                type="button"
              />
            </div>

            {formData.stages.length > 0 && (
              <div className="stages-list">
                <h3>Added Stages ({formData.stages.length})</h3>
                {formData.stages.map((stage, index) => (
                  <div key={stage.id} className="stage-item">
                    <div className="stage-header">
                      <span className="stage-number">Stage {index + 1}</span>
                      <h4>{stage.stageName}</h4>
                      <span className="stage-type">{stage.stageType === 'in_house' ? '🏭 In House' : '🚚 Outsource'}</span>
                    </div>
                    <div className="stage-details">
                      {stage.assignedEmployeeId && <p>Assigned: {getEmployeeName(stage.assignedEmployeeId)}</p>}
                      {stage.facilityId && <p>Facility: {getFacilityName(stage.facilityId)}</p>}
                      {stage.plannedStartDate && <p>Start: {stage.plannedStartDate}</p>}
                      {stage.plannedEndDate && <p>End: {stage.plannedEndDate}</p>}
                      {stage.estimatedDurationDays && <p>Duration: {stage.estimatedDurationDays} days</p>}
                    </div>
                    <Button
                      text="Remove"
                      variant="danger"
                      size="sm"
                      onClick={() => removeStage(stage.id)}
                      type="button"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button
              text={loading ? 'Creating...' : 'Create Production Plan'}
              variant="primary"
              type="submit"
              disabled={loading}
            />
            <Button
              text="Cancel"
              variant="secondary"
              type="button"
              onClick={() => window.history.back()}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductionPlanFormPage;

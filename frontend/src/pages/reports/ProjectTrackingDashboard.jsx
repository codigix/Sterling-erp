import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import '../../styles/TaskPage.css';

const ProjectTrackingDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectProgress, setProjectProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: '', targetDate: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sales');
      setProjects(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const milestoneRes = await axios.get(`/api/tracking/project/${selectedProject.id}/milestones`);
      setMilestones(milestoneRes.data);

      const progressRes = await axios.get(`/api/tracking/project/${selectedProject.id}/progress`);
      setProjectProgress(progressRes.data);

      const teamRes = await axios.get(`/api/tracking/project/${selectedProject.id}/team`);
      setTeamMembers(teamRes.data);
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    }
  };

  const handleAddMilestone = async () => {
    try {
      await axios.post('/api/tracking/project-milestone', {
        projectId: selectedProject.id,
        milestoneName: newMilestone.name,
        targetDate: newMilestone.targetDate
      });

      setNewMilestone({ name: '', targetDate: '' });
      setShowMilestoneModal(false);
      await fetchProjectDetails();
    } catch (err) {
      setError('Failed to add milestone');
      console.error(err);
    }
  };

  const updateMilestoneStatus = async (milestoneId, status) => {
    try {
      await axios.patch(`/api/tracking/milestone/${milestoneId}/status`, { status });
      await fetchProjectDetails();
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 50) return '#3b82f6';
    if (percentage >= 25) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Project Tracking Dashboard</h1>
        <p>Monitor project progress and team performance</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tracking-layout">
        <div className="projects-sidebar">
          <Card title="Projects">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="projects-list">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <h4>{project.project_name || project.name}</h4>
                    <Badge type="info" text={project.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="tracking-content">
          {selectedProject ? (
            <>
              <Card className="content-card" title="Project Overview">
                <div className="project-overview">
                  <div className="overview-item">
                    <span className="label">Project Name:</span>
                    <span className="value">{selectedProject.project_name || selectedProject.name}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Status:</span>
                    <Badge type="info" text={selectedProject.status} />
                  </div>
                  {projectProgress && (
                    <>
                      <div className="overview-item">
                        <span className="label">Total Milestones:</span>
                        <span className="value">{projectProgress.total_milestones}</span>
                      </div>
                      <div className="overview-item">
                        <span className="label">Completed:</span>
                        <span className="value">{projectProgress.completed_milestones}</span>
                      </div>
                      <div className="overview-item">
                        <span className="label">Overall Progress:</span>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${projectProgress.average_completion}%`,
                              backgroundColor: getProgressColor(projectProgress.average_completion)
                            }}
                          />
                        </div>
                        <span>{projectProgress.average_completion}%</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Card className="content-card">
                <div className="card-header">
                  <h2>Milestones</h2>
                  <Button
                    text="+ Add Milestone"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowMilestoneModal(true)}
                  />
                </div>
                {milestones.length === 0 ? (
                  <div className="empty-state">No milestones added yet</div>
                ) : (
                  <div className="milestones-list">
                    {milestones.map(milestone => (
                      <div key={milestone.id} className="milestone-item">
                        <div className="milestone-info">
                          <h4>{milestone.milestone_name}</h4>
                          <p>Target: {new Date(milestone.target_date).toLocaleDateString()}</p>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${milestone.completion_percentage}%` }}
                            />
                          </div>
                          <span>{milestone.completion_percentage}% Complete</span>
                        </div>
                        <div className="milestone-actions">
                          <select
                            value={milestone.status}
                            onChange={(e) => updateMilestoneStatus(milestone.id, e.target.value)}
                            className="form-control"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {teamMembers.length > 0 && (
                <Card className="content-card" title="Team Members">
                  <div className="team-list">
                    {teamMembers.map(member => (
                      <div key={member.id} className="team-member">
                        <div className="member-info">
                          <h4>{member.employee_name}</h4>
                          <p>{member.employee_email}</p>
                        </div>
                        <div className="member-stats">
                          <div className="stat">
                            <span className="stat-label">Tasks:</span>
                            <span className="stat-value">{member.tasks_assigned}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Completed:</span>
                            <span className="stat-value">{member.tasks_completed}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Efficiency:</span>
                            <span className="stat-value">{member.efficiency_percentage}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="content-card">
              <div className="empty-state">
                <p>Select a project to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {showMilestoneModal && (
        <Modal
          title="Add Milestone"
          onClose={() => {
            setShowMilestoneModal(false);
            setNewMilestone({ name: '', targetDate: '' });
          }}
        >
          <div className="modal-content">
            <div className="form-group">
              <label>Milestone Name:</label>
              <input
                type="text"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                className="form-control"
                placeholder="Enter milestone name"
              />
            </div>
            <div className="form-group">
              <label>Target Date:</label>
              <input
                type="date"
                value={newMilestone.targetDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="modal-actions">
              <Button
                text="Add"
                variant="primary"
                onClick={handleAddMilestone}
              />
              <Button
                text="Cancel"
                variant="secondary"
                onClick={() => {
                  setShowMilestoneModal(false);
                  setNewMilestone({ name: '', targetDate: '' });
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectTrackingDashboard;

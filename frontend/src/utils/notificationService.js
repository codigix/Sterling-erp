import axios from './api';

const DEPARTMENT_MANAGERS = {
  designEngineering: {
    department: 'Design Engineering',
    manager: 'Design Engineer'
  },
  materialRequirements: {
    department: 'Inventory Management',
    manager: 'Inventory Manager'
  },
  productionPlan: {
    department: 'Production',
    manager: 'Production Manager'
  },
  qualityCheck: {
    department: 'Quality Control',
    manager: 'QC Manager'
  },
  shipment: {
    department: 'Logistics',
    manager: 'Logistics Manager'
  },
  delivery: {
    department: 'Delivery',
    manager: 'Logistics Manager'
  }
};

const STEP_DESCRIPTIONS = {
  1: 'Client PO',
  2: 'Design Engineering',
  3: 'Material Requirements',
  4: 'Production Plan',
  5: 'Quality Check',
  6: 'Shipment',
  7: 'Delivery'
};

export const sendAssignmentNotifications = async (rootCardData, formData) => {
  try {
    const assignmentNotifications = [];

    const stepAssignees = [
      { stepType: 'designEngineering', assignee: formData.designEngineeringAssignedTo },
      { stepType: 'materialRequirements', assignee: formData.materialRequirementsAssignedTo },
      { stepType: 'productionPlan', assignee: formData.productionPlanAssignedTo },
      { stepType: 'qualityCheck', assignee: formData.qualityCheckAssignedTo },
      { stepType: 'shipment', assignee: formData.shipmentAssignedTo },
      { stepType: 'delivery', assignee: formData.deliveryAssignedTo }
    ];

    stepAssignees.forEach(({ stepType, assignee }) => {
      if (assignee) {
        const deptInfo = DEPARTMENT_MANAGERS[stepType];
        assignmentNotifications.push({
          recipientId: assignee,
          type: 'root-card-assigned',
          title: `New ${deptInfo.manager} Task Assigned`,
          message: `Root Card RC-${rootCardData.id} for ${formData.projectName || formData.clientName} has been assigned to you for ${stepType.replace(/_/g, ' ')}`,
          stepType,
          department: deptInfo.department,
          priority: 'high',
          metadata: {
            rootCardId: rootCardData.id,
            poNumber: formData.poNumber,
            projectName: formData.projectName,
            clientName: formData.clientName,
            stepType,
            assignee
          }
        });
      }
    });

    if (assignmentNotifications.length > 0) {
      await Promise.all(
        assignmentNotifications.map(notification =>
          axios.post('/notifications', notification).catch(err => {
            console.error('Failed to send notification:', err);
            return null;
          })
        )
      );
    }

    return assignmentNotifications;
  } catch (error) {
    console.error('Error sending assignment notifications:', error);
    throw error;
  }
};

export const sendOrderCreatedNotification = async (rootCardData, formData) => {
  try {
    const notification = {
      recipientId: formData.internalProjectOwner || 'admin',
      type: 'root-card-created',
      title: 'New Root Card Created',
      message: `Root Card RC-${rootCardData.id} has been successfully created for ${formData.projectName || formData.clientName}. All assigned departments have been notified.`,
      priority: 'high',
      metadata: {
        rootCardId: rootCardData.id,
        poNumber: formData.poNumber,
        projectName: formData.projectName,
        clientName: formData.clientName,
        totalAmount: formData.totalAmount
      }
    };

    await axios.post('/notifications', notification);
    return notification;
  } catch (error) {
    console.error('Error sending order created notification:', error);
    throw error;
  }
};

export const getNotificationsForUser = async (userId) => {
  try {
    const response = await axios.get(`/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await axios.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await axios.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

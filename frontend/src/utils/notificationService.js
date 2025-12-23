import axios from './api';

const DEPARTMENT_MANAGERS = {
  design_engineering: {
    department: 'Design Engineering',
    manager: 'Design Engineer'
  },
  material_requirement: {
    department: 'Inventory Management',
    manager: 'Inventory Manager'
  },
  production_plan: {
    department: 'Production',
    manager: 'Production Manager'
  },
  quality_check: {
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
  2: 'Sales Order',
  3: 'Design Engineering',
  4: 'Material Requirement',
  5: 'Production Plan',
  6: 'Quality Check',
  7: 'Shipment',
  8: 'Delivery'
};

export const sendAssignmentNotifications = async (salesOrderData, formData) => {
  try {
    const assignmentNotifications = [];

    const stepAssignees = [
      { stepType: 'design_engineering', assignee: formData.design_engineeringAssignedTo },
      { stepType: 'material_requirement', assignee: formData.material_requirementAssignedTo },
      { stepType: 'production_plan', assignee: formData.production_planAssignedTo },
      { stepType: 'quality_check', assignee: formData.quality_checkAssignedTo },
      { stepType: 'shipment', assignee: formData.shipmentAssignedTo },
      { stepType: 'delivery', assignee: formData.deliveryAssignedToManager }
    ];

    stepAssignees.forEach(({ stepType, assignee }) => {
      if (assignee) {
        const deptInfo = DEPARTMENT_MANAGERS[stepType];
        assignmentNotifications.push({
          recipientId: assignee,
          type: 'sales-order-assigned',
          title: `New ${deptInfo.manager} Task Assigned`,
          message: `Sales Order SO-${salesOrderData.id} for ${formData.projectName || formData.clientName} has been assigned to you for ${stepType.replace(/_/g, ' ')}`,
          stepType,
          department: deptInfo.department,
          priority: 'high',
          metadata: {
            salesOrderId: salesOrderData.id,
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
          axios.post('/api/notifications', notification).catch(err => {
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

export const sendOrderCreatedNotification = async (salesOrderData, formData) => {
  try {
    const notification = {
      recipientId: formData.internalProjectOwner || 'admin',
      type: 'sales-order-created',
      title: 'New Sales Order Created',
      message: `Sales Order SO-${salesOrderData.id} has been successfully created for ${formData.projectName || formData.clientName}. All assigned departments have been notified.`,
      priority: 'high',
      metadata: {
        salesOrderId: salesOrderData.id,
        poNumber: formData.poNumber,
        projectName: formData.projectName,
        clientName: formData.clientName,
        totalAmount: formData.totalAmount
      }
    };

    await axios.post('/api/notifications', notification);
    return notification;
  } catch (error) {
    console.error('Error sending order created notification:', error);
    throw error;
  }
};

export const getNotificationsForUser = async (userId) => {
  try {
    const response = await axios.get(`/api/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await axios.patch(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await axios.delete(`/api/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

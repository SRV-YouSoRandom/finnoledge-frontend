const { executeCommand } = require('../utils/cliExecutor');

/**
 * Create a new offer letter using the rollkit CLI
 */
const createOfferLetter = async (req, res) => {
  try {
    const { candidateName, position, salary, joiningDate, user = 'bob' } = req.body;
    
    if (!candidateName || !position || !salary || !joiningDate) {
      return res.status(400).json({
        success: false,
        message: 'Candidate name, position, salary, and joining date are required'
      });
    }
    
    // Construct the CLI command with "Pending" status as default
    const command = `rollkit tx hr create-offer-letter "${candidateName}" "${position}" ${salary} "${joiningDate}" "Pending" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Offer letter created successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error creating offer letter:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to create offer letter: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Accept an offer letter using the rollkit CLI
 * This creates the employee record and authentication credentials
 */
const acceptOfferLetter = async (req, res) => {
  try {
    const { offerId, employeeId, contactInfo, user = 'bob' } = req.body;
    
    if (!offerId || !employeeId || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: 'Offer ID, employee ID, and contact info are required'
      });
    }
    
    // Construct the CLI command - this now creates address and password automatically
    const command = `rollkit tx hr accept-offer-letter ${offerId} "${employeeId}" "${contactInfo}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Offer letter accepted successfully. Employee record and authentication created.',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error accepting offer letter:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to accept offer letter: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Define a new role using the rollkit CLI
 */
const defineRole = async (req, res) => {
  try {
    const { name, description, permissions, user = 'bob' } = req.body;
    
    if (!name || !description || !permissions) {
      return res.status(400).json({
        success: false,
        message: 'Role name, description, and permissions are required'
      });
    }
    
    // Validate permissions against allowed values
    const validPermissions = ['ALL', 'SUBMIT_LEAVE', 'APPROVE_LEAVE', 'MANAGE_EMPLOYEES', 'VIEW_ONLY'];
    if (!validPermissions.includes(permissions)) {
      return res.status(400).json({
        success: false,
        message: `Invalid permissions. Must be one of: ${validPermissions.join(', ')}`
      });
    }
    
    // Construct the CLI command
    const command = `rollkit tx hr define-role "${name}" "${description}" "${permissions}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Role defined successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error defining role:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to define role: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Assign role to employee using the rollkit CLI
 * FIXED: Use system ID (0, 1, 2...) instead of employee ID (EMP001...)
 */
const assignRoleToEmployee = async (req, res) => {
  try {
    const { employeeId, roleName, user = 'bob' } = req.body;
    
    if (!employeeId || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'Employee system ID and role name are required'
      });
    }
    
    // IMPORTANT: employeeId should be the system ID (0, 1, 2...), not the HR employee ID
    const systemId = parseInt(employeeId);
    if (isNaN(systemId)) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID must be a valid system ID number (0, 1, 2...)'
      });
    }
    
    // Construct the CLI command using system ID
    const command = `rollkit tx hr assign-role-to-employee ${systemId} "${roleName}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Role assigned successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to assign role: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Submit leave request using the rollkit CLI
 * FIXED: Use system ID (0, 1, 2...) instead of employee ID (EMP001...)
 */
const submitLeaveRequest = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, reason, user = 'bob' } = req.body;
    
    if (!employeeId || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Employee system ID, start date, end date, and reason are required'
      });
    }
    
    // IMPORTANT: employeeId should be the system ID (0, 1, 2...), not the HR employee ID
    const systemId = parseInt(employeeId);
    if (isNaN(systemId)) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID must be a valid system ID number (0, 1, 2...)'
      });
    }
    
    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Dates must be in YYYY-MM-DD format'
      });
    }
    
    // Construct the CLI command using system ID
    const command = `rollkit tx hr submit-leave-request ${systemId} "${startDate}" "${endDate}" "${reason}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to submit leave request: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Process leave request using the rollkit CLI
 */
const processLeaveRequest = async (req, res) => {
  try {
    const { requestId, newStatus, user = 'bob' } = req.body;
    
    if (!requestId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and new status are required'
      });
    }
    
    // Ensure requestId is a number
    const reqId = parseInt(requestId);
    if (isNaN(reqId)) {
      return res.status(400).json({
        success: false,
        message: 'Request ID must be a valid number'
      });
    }
    
    // Validate status
    const validStatuses = ['Approved', 'Rejected'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Construct the CLI command
    const command = `rollkit tx hr process-leave-request ${reqId} "${newStatus}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Leave request processed successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error processing leave request:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to process leave request: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Change employee password using the rollkit CLI
 * FIXED: Use system ID (0, 1, 2...) instead of employee ID (EMP001...)
 */
const changePassword = async (req, res) => {
  try {
    const { employeeId, newPassword, user = 'bob' } = req.body;
    
    if (!employeeId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Employee system ID and new password are required'
      });
    }
    
    // IMPORTANT: employeeId should be the system ID (0, 1, 2...), not the HR employee ID
    const systemId = parseInt(employeeId);
    if (isNaN(systemId)) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID must be a valid system ID number (0, 1, 2...)'
      });
    }
    
    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Construct the CLI command using system ID
    const command = `rollkit tx hr change-password ${systemId} "${newPassword}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to change password: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

module.exports = {
  createOfferLetter,
  acceptOfferLetter,
  defineRole,
  assignRoleToEmployee,
  submitLeaveRequest,
  processLeaveRequest,
  changePassword
};
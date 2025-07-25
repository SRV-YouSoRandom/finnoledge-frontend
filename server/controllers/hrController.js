// server/controllers/hrController.js - DEBUG VERSION with enhanced logging

const { executeCommand } = require('../utils/cliExecutor');

/**
 * Submit leave request - DEBUG VERSION
 */
const submitLeaveRequest = async (req, res) => {
  try {
    console.log('=== SUBMIT LEAVE REQUEST DEBUG ===');
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    const { employeeId, startDate, endDate, reason, user = 'bob' } = req.body;
    
    console.log('Extracted values:');
    console.log('- employeeId:', employeeId, typeof employeeId);
    console.log('- startDate:', startDate, typeof startDate);
    console.log('- endDate:', endDate, typeof endDate);
    console.log('- reason:', reason, typeof reason, 'length:', reason?.length);
    console.log('- user:', user, typeof user);
    
    // Validate all required fields
    if (employeeId === undefined || employeeId === null) {
      console.log('ERROR: Employee ID is missing');
      return res.status(400).json({
        success: false,
        message: 'Employee system ID is required',
        debug: { receivedEmployeeId: employeeId }
      });
    }
    
    if (!startDate || !endDate || !reason) {
      console.log('ERROR: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Start date, end date, and reason are required',
        debug: { startDate, endDate, reason }
      });
    }
    
    // Convert employeeId to integer
    const systemId = parseInt(employeeId);
    console.log('Parsed systemId:', systemId, 'isNaN:', isNaN(systemId));
    
    if (isNaN(systemId) || systemId < 0) {
      console.log('ERROR: Invalid system ID');
      return res.status(400).json({
        success: false,
        message: 'Employee ID must be a valid system ID number (0, 1, 2...)',
        debug: { originalEmployeeId: employeeId, parsedSystemId: systemId }
      });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    console.log('Date validation:');
    console.log('- startDate matches regex:', dateRegex.test(startDate));
    console.log('- endDate matches regex:', dateRegex.test(endDate));
    
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      console.log('ERROR: Invalid date format');
      return res.status(400).json({
        success: false,
        message: 'Dates must be in YYYY-MM-DD format',
        debug: { startDate, endDate }
      });
    }
    
    // Validate date logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log('Date objects:');
    console.log('- start:', start);
    console.log('- end:', end);
    console.log('- end < start:', end < start);
    
    if (end < start) {
      console.log('ERROR: End date before start date');
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date',
        debug: { startDate, endDate, start, end }
      });
    }
    
    // Validate reason
    const trimmedReason = reason.trim();
    console.log('Reason validation:');
    console.log('- original reason:', JSON.stringify(reason));
    console.log('- trimmed reason:', JSON.stringify(trimmedReason));
    console.log('- trimmed length:', trimmedReason.length);
    
    if (trimmedReason.length < 5) {
      console.log('ERROR: Reason too short');
      return res.status(400).json({
        success: false,
        message: 'Reason must be at least 5 characters long',
        debug: { originalReason: reason, trimmedReason, length: trimmedReason.length }
      });
    }
    
    // Build command
    const command = `rollkit tx hr submit-leave-request ${systemId} "${startDate}" "${endDate}" "${trimmedReason}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('=== COMMAND TO EXECUTE ===');
    console.log(command);
    console.log('=== COMMAND BREAKDOWN ===');
    console.log('- systemId:', systemId);
    console.log('- startDate:', `"${startDate}"`);
    console.log('- endDate:', `"${endDate}"`);
    console.log('- reason:', `"${trimmedReason}"`);
    console.log('- user:', user);
    
    // Execute the command
    console.log('Executing command...');
    const result = await executeCommand(command);
    
    console.log('=== COMMAND RESULT ===');
    console.log('stdout:', result.stdout);
    console.log('stderr:', result.stderr);
    
    return res.status(200).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: result.stdout,
      debug: {
        command,
        systemId,
        startDate,
        endDate,
        trimmedReason,
        user
      }
    });
  } catch (error) {
    console.error('=== SUBMIT LEAVE REQUEST ERROR ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error stderr:', error.stderr);
    console.error('Error code:', error.code);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: `Failed to submit leave request: ${error.message}`,
      error: error.stderr || error.message,
      debug: {
        errorType: typeof error,
        errorKeys: Object.keys(error),
        fullError: error
      }
    });
  }
};

/**
 * Process leave request - DEBUG VERSION
 */
const processLeaveRequest = async (req, res) => {
  try {
    console.log('=== PROCESS LEAVE REQUEST DEBUG ===');
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    const { requestId, newStatus, user = 'bob' } = req.body;
    
    console.log('Extracted values:');
    console.log('- requestId:', requestId, typeof requestId);
    console.log('- newStatus:', newStatus, typeof newStatus);
    console.log('- user:', user, typeof user);
    
    if (requestId === undefined || requestId === null) {
      console.log('ERROR: Request ID is missing');
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
        debug: { receivedRequestId: requestId }
      });
    }
    
    if (!newStatus) {
      console.log('ERROR: New status is missing');
      return res.status(400).json({
        success: false,
        message: 'New status is required',
        debug: { receivedNewStatus: newStatus }
      });
    }
    
    // Parse requestId
    const reqId = parseInt(requestId);
    console.log('Parsed reqId:', reqId, 'isNaN:', isNaN(reqId));
    
    if (isNaN(reqId) || reqId < 0) {
      console.log('ERROR: Invalid request ID');
      return res.status(400).json({
        success: false,
        message: 'Request ID must be a valid number (0, 1, 2...)',
        debug: { originalRequestId: requestId, parsedReqId: reqId }
      });
    }
    
    // Validate status
    const validStatuses = ['Approved', 'Rejected'];
    console.log('Status validation:');
    console.log('- newStatus:', JSON.stringify(newStatus));
    console.log('- validStatuses:', validStatuses);
    console.log('- includes:', validStatuses.includes(newStatus));
    
    if (!validStatuses.includes(newStatus)) {
      console.log('ERROR: Invalid status');
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        debug: { receivedStatus: newStatus, validStatuses }
      });
    }
    
    // Build command
    const command = `rollkit tx hr process-leave-request ${reqId} "${newStatus}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('=== COMMAND TO EXECUTE ===');
    console.log(command);
    console.log('=== COMMAND BREAKDOWN ===');
    console.log('- reqId:', reqId);
    console.log('- newStatus:', `"${newStatus}"`);
    console.log('- user:', user);
    
    // Execute the command
    console.log('Executing command...');
    const result = await executeCommand(command);
    
    console.log('=== COMMAND RESULT ===');
    console.log('stdout:', result.stdout);
    console.log('stderr:', result.stderr);
    
    return res.status(200).json({
      success: true,
      message: `Leave request ${newStatus.toLowerCase()} successfully`,
      data: result.stdout,
      debug: {
        command,
        reqId,
        newStatus,
        user
      }
    });
  } catch (error) {
    console.error('=== PROCESS LEAVE REQUEST ERROR ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error stderr:', error.stderr);
    console.error('Error code:', error.code);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: `Failed to process leave request: ${error.message}`,
      error: error.stderr || error.message,
      debug: {
        errorType: typeof error,
        errorKeys: Object.keys(error),
        fullError: error
      }
    });
  }
};

// Include other functions unchanged...
const createOfferLetter = async (req, res) => {
  try {
    const { candidateName, position, salary, joiningDate, user = 'bob' } = req.body;
    
    if (!candidateName || !position || !salary || !joiningDate) {
      return res.status(400).json({
        success: false,
        message: 'Candidate name, position, salary, and joining date are required'
      });
    }
    
    const command = `rollkit tx hr create-offer-letter "${candidateName}" "${position}" ${salary} "${joiningDate}" "Pending" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing command:', command);
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

const acceptOfferLetter = async (req, res) => {
  try {
    const { offerId, employeeId, contactInfo, user = 'bob' } = req.body;
    
    if (!offerId || !employeeId || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: 'Offer ID, employee ID, and contact info are required'
      });
    }
    
    const command = `rollkit tx hr accept-offer-letter ${offerId} "${employeeId}" "${contactInfo}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing command:', command);
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

const defineRole = async (req, res) => {
  try {
    const { name, description, permissions, user = 'bob' } = req.body;
    
    if (!name || !description || !permissions) {
      return res.status(400).json({
        success: false,
        message: 'Role name, description, and permissions are required'
      });
    }
    
    const validPermissions = ['ALL', 'SUBMIT_LEAVE', 'APPROVE_LEAVE', 'MANAGE_EMPLOYEES', 'VIEW_ONLY'];
    if (!validPermissions.includes(permissions)) {
      return res.status(400).json({
        success: false,
        message: `Invalid permissions. Must be one of: ${validPermissions.join(', ')}`
      });
    }
    
    const command = `rollkit tx hr define-role "${name}" "${description}" "${permissions}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing command:', command);
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

const assignRoleToEmployee = async (req, res) => {
  try {
    const { employeeId, roleName, user = 'bob' } = req.body;
    
    if (employeeId === undefined || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'Employee system ID and role name are required'
      });
    }
    
    const systemId = parseInt(employeeId);
    if (isNaN(systemId) || systemId < 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID must be a valid system ID number (0, 1, 2...)'
      });
    }
    
    const command = `rollkit tx hr assign-role-to-employee ${systemId} "${roleName}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing assign role command:', command);
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

const changePassword = async (req, res) => {
  try {
    const { employeeId, newPassword, user = 'bob' } = req.body;
    
    if (employeeId === undefined || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Employee system ID and new password are required'
      });
    }
    
    const systemId = parseInt(employeeId);
    if (isNaN(systemId) || systemId < 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID must be a valid system ID number (0, 1, 2...)'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    const command = `rollkit tx hr change-password ${systemId} "${newPassword}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing change password command:', command);
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
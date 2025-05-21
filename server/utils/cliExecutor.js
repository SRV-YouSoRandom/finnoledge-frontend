const { exec } = require('child_process');
const util = require('util');

// Promisify exec
const execPromise = util.promisify(exec);

/**
 * Execute a shell command and return the result
 * @param {string} command - The command to execute
 * @returns {Promise<{stdout: string, stderr: string}>} - Command execution results
 */
const executeCommand = async (command) => {
  try {
    const result = await execPromise(command);
    return result;
  } catch (error) {
    // Handle errors from the command execution
    console.error(`Command execution error: ${error.message}`);
    throw {
      message: error.message,
      stderr: error.stderr,
      code: error.code
    };
  }
};

module.exports = {
  executeCommand
};
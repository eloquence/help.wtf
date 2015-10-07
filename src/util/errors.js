'use strict';
module.exports = handleError;

function handleError(error, customMessage, keepRunning) {
  if (customMessage) console.error(customMessage);
  if (!keepRunning) {
    console.error('Aborting execution. Error message:');
    console.error(error.message);
    process.exit();
  } else {
    console.error('Continuing execution. Error message:');
    console.error(error.message);
  }
}

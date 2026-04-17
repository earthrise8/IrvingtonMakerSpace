const admin = require('firebase-admin');

admin.initializeApp();

// Import and export all Cloud Functions
const { onJobSubmitted } = require('./onJobSubmitted');
const { onJobStatusChange } = require('./onJobStatusChange');

module.exports = {
  onJobSubmitted,
  onJobStatusChange,
};

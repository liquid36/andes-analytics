module.exports = {
  name: 'analytics',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/analytics',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

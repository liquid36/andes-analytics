module.exports = {
  name: 'snomed',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/snomed',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

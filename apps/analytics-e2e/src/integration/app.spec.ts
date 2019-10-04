import { getGreeting } from '../support/app.po';

describe('analytics', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to analytics!');
  });
});

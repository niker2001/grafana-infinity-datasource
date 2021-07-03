it('loads page', () => {
  cy.visit('/');
  cy.contains('Welcome to Grafana');
});

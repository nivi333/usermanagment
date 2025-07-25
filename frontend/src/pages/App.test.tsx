import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  // Update this test to match your actual UI, or remove if not needed
  // For now, just check the main heading
  expect(screen.getByText(/User Management System/i)).toBeInTheDocument();
});

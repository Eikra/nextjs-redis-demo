import { render, screen } from '@testing-library/react';
import PostList from './components/PostList';

test('handles invalid data', () => {
  render(<PostList page={1} limit={10} />);
  expect(screen.getByText('Loading posts...')).toBeInTheDocument();
});
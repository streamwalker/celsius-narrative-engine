import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ social: vi.fn(), password: vi.fn(), otp: vi.fn() }));
vi.mock('@/lib/social-auth', () => ({ signInWithSocialProvider: mocks.social }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { signInWithPassword: mocks.password, signInWithOtp: mocks.otp } } }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import { AuthModal } from '@/components/AuthModal';
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());
const show = () => render(<MemoryRouter><AuthModal isOpen onClose={vi.fn()} /></MemoryRouter>);
it.each(['Google', 'Apple'])('starts %s without requiring email/password', async name => {
  mocks.social.mockResolvedValue({ redirected: true, error: null }); show();
  fireEvent.click(screen.getByRole('button', { name: `Sign in with ${name}` }));
  await waitFor(() => expect(mocks.social).toHaveBeenCalledWith(name.toLowerCase()));
  expect(mocks.password).not.toHaveBeenCalled();
});
it('shows cancellation errors and leaves email login usable', async () => {
  mocks.social.mockRejectedValue(new Error('Sign in was cancelled')); show();
  fireEvent.click(screen.getByRole('button', { name: 'Sign in with Apple' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Sign in was cancelled');
  expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
});
it('preserves password login', async () => {
  mocks.password.mockResolvedValue({ error: null }); show();
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
  await waitFor(() => expect(mocks.password).toHaveBeenCalledWith({ email: 'test@example.com', password: 'test-password' }));
  expect(mocks.social).not.toHaveBeenCalled();
});
it('preserves magic-link delivery to the current origin', async () => {
  mocks.otp.mockResolvedValue({ error: null }); show();
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Or send magic link' }));
  await waitFor(() => expect(mocks.otp).toHaveBeenCalledWith({ email: 'test@example.com', options: { emailRedirectTo: `${window.location.origin}/` } }));
});

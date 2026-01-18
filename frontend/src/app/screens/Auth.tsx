import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { UserProfile } from '@/app/types/profile';
import { login, signup, getMyProfile, storeToken } from '@/api/auth';

interface AuthProps {
  onSignIn: (profile: UserProfile, token: string, userId: string) => void;
  onSignUp: (token: string, userId: string) => void;
}


export const Auth: React.FC<AuthProps> = ({ onSignIn, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { access_token, user_id } = await login(email, password);

      // easiest persistence (no security concerns)
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_id", String(user_id));

      storeToken(access_token);

      const profile = await getMyProfile();
      onSignIn(profile, access_token, String(user_id));
    } catch (err: unknown) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  const handleSignUp = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter a username and password.');
      return;
    }
    setLoading(true);
    try {
      const { access_token, user_id } = await signup(email, password);

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_id", String(user_id));

      storeToken(access_token);
      onSignUp(access_token, String(user_id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#FFEBDA] flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center">
          <h2 className="text-4xl font-bold" style={{ fontFamily: 'Castoro, serif' }}>Welcome Back</h2>
          <p className="text-[#666666] mt-2">Sign in to continue your journey or sign up to get started.</p>
        </div>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="mt-1"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="•••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="mt-1"
              disabled={loading}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Button onClick={handleSignIn} className="w-full" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</Button>
          <Button onClick={handleSignUp} className="w-full" variant="outline" disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</Button>
        </div>
      </div>
    </div>
  );
};

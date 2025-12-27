import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { BookOpen, AlertCircle } from 'lucide-react';
import logoImage from "figma:asset/7a426d3e88da63d501cc1619361ed2fb3a0a1ad3.png";

export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        // Handle forgot password
        if (!email) {
          setError('Please enter your email address');
          setIsLoading(false);
          return;
        }

        // Check if user exists
        const users = JSON.parse(localStorage.getItem('library_users') || '[]');
        const userExists = users.find((u: any) => u.email === email);

        if (!userExists) {
          setError('No account found with this email address');
          setIsLoading(false);
          return;
        }

        // Simulate password reset (in production, this would send an email)
        // For demo purposes, we'll generate a temporary password
        const tempPassword = 'temp' + Math.random().toString(36).substring(2, 8);
        
        // Update user's password
        const updatedUsers = users.map((u: any) => {
          if (u.email === email) {
            return { ...u, password: tempPassword };
          }
          return u;
        });
        localStorage.setItem('library_users', JSON.stringify(updatedUsers));

        setSuccessMessage(`Password reset successful! Your temporary password is: ${tempPassword}. Please use this to login and change your password in Settings.`);
        
        // Clear form after 5 seconds and switch to login
        setTimeout(() => {
          setMode('signin');
          setEmail('');
          setSuccessMessage('');
        }, 8000);
        
        setIsLoading(false);
        return;
      }
      
      if (mode === 'signup') {
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }

        const result = await register(name, email, password);
        if (result.success) {
          setSuccessMessage('Registration successful! Redirecting...');
          // New users are members by default, redirect to member interface
          setTimeout(() => {
            navigate('/member');
          }, 500);
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      } else if (mode === 'signin') {
        // Sign in
        const success = await login(email, password);
        if (success) {
          // Wait for auth context to update, then redirect based on role
          setTimeout(() => {
            const storedUser = localStorage.getItem('library_user');
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              if (userData.role === 'Administrator') {
                navigate('/admin');
              } else {
                navigate('/member');
              }
            }
          }, 100);
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-14 h-14 flex items-center justify-center">
            <img src={logoImage} alt="Book Keeper" className="w-14 h-14" />
          </div>
          <div>
            <CardTitle className="text-foreground text-2xl">Book Keeper</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Library Management System</p>
          </div>
          <CardDescription>
            {mode === 'signup' 
              ? 'Create a new account to get started' 
              : mode === 'forgot'
              ? 'Reset your password'
              : 'Sign in to manage your library'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={mode === 'signup' ? "your.email@example.com" : "admin@library.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading 
                ? (mode === 'signup' ? 'Creating Account...' : mode === 'forgot' ? 'Resetting Password...' : 'Signing in...') 
                : (mode === 'signup' ? 'Sign Up' : mode === 'forgot' ? 'Reset Password' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center">
            {mode === 'signin' && (
              <>
                <Button 
                  variant="link" 
                  onClick={() => toggleMode('signup')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Don't have an account? Sign Up
                </Button>
                <div>
                  <Button 
                    variant="link" 
                    onClick={() => toggleMode('forgot')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Forgot Password?
                  </Button>
                </div>
              </>
            )}
            {mode === 'signup' && (
              <Button 
                variant="link" 
                onClick={() => toggleMode('signin')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Already have an account? Sign In
              </Button>
            )}
            {mode === 'forgot' && (
              <Button 
                variant="link" 
                onClick={() => toggleMode('signin')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </Button>
            )}
          </div>

          {/* Demo account section removed */}
        </CardContent>
      </Card>
    </div>
  );
}
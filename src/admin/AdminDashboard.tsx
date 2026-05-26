import { useState, useEffect } from 'react';
import { 
  Users, Settings, LogOut, Plus, Trash2, 
  Copy, AlertTriangle, Clock, DollarSign, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { hashPassword } from '@/lib/passwordHash';
import { DEFAULT_USERS, type LegacyUserRecord } from '@/lib/defaultUsers';

type User = LegacyUserRecord;

interface AdminDashboardProps {
  onLogout: () => void;
}

const USERS_KEY = 'cryptolegacy-users';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// USDT TRC20 addresses: base58, start with 'T', total length 34.
const USDT_TRC20_REGEX = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const MIN_PASSWORD_LENGTH = 8;

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUsdtAddress, setNewUsdtAddress] = useState('TNXrPYL2c3n8r8aQ7q9K3wK9mL7pQ5nR4sT');
  const [closureDays, setClosureDays] = useState(3);
  const [globalUsdtAddress, setGlobalUsdtAddress] = useState('TNXrPYL2c3n8r8aQ7q9K3wK9mL7pQ5nR4sT');

  // Load data from localStorage on mount.
  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed)) {
          setUsers(parsed);
        } else {
          setUsers([...DEFAULT_USERS]);
          localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
        }
      } catch {
        setUsers([...DEFAULT_USERS]);
        localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }
    } else {
      setUsers([...DEFAULT_USERS]);
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  // Save users to localStorage whenever they change
  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  };

  // Add new user. Passwords are hashed before being persisted; the
  // plaintext value never enters localStorage.
  const handleAddUser = async () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    const trimmedPassword = newPassword.trim();
    const trimmedUsdt = newUsdtAddress.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Please enter both email and password');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    if (!trimmedUsdt || !USDT_TRC20_REGEX.test(trimmedUsdt)) {
      toast.error('Please enter a valid USDT TRC20 address');
      return;
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existingUser) {
      toast.error('User with this email already exists!');
      return;
    }

    const passwordHash = await hashPassword(trimmedEmail, trimmedPassword);
    const newUser: User = {
      email: trimmedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
      usdtAddress: trimmedUsdt,
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    // Set user-specific closure timer
    const userTimerKey = `shutdown-timer-${newUser.email}`;
    const targetTime = Date.now() + (closureDays * 24 * 60 * 60 * 1000);
    localStorage.setItem(userTimerKey, targetTime.toString());

    // Clear form (wipe plaintext from React state immediately)
    setNewEmail('');
    setNewPassword('');

    toast.success(`User ${newUser.email} created successfully!`);
  };

  // Delete user
  const handleDeleteUser = (email: string) => {
    const updatedUsers = users.filter(u => u.email !== email);
    saveUsers(updatedUsers);
    
    // Also remove user's timer
    const userTimerKey = `shutdown-timer-${email}`;
    localStorage.removeItem(userTimerKey);
    
    toast.success('User deleted successfully');
  };

  // Update user's USDT address (validated before persisting).
  const handleUpdateUserUsdt = (email: string, newAddress: string) => {
    const trimmed = newAddress.trim();
    if (!USDT_TRC20_REGEX.test(trimmed)) {
      // Allow the field to update visually but don't persist invalid values.
      const updatedUsers = users.map((u) =>
        u.email === email ? { ...u, usdtAddress: trimmed } : u
      );
      setUsers(updatedUsers);
      return;
    }
    const updatedUsers = users.map((u) =>
      u.email === email ? { ...u, usdtAddress: trimmed } : u
    );
    saveUsers(updatedUsers);
    toast.success('USDT address updated for user');
  };

  // Save global USDT address (validated before persisting).
  const handleSaveGlobalAddress = () => {
    const trimmed = globalUsdtAddress.trim();
    if (!USDT_TRC20_REGEX.test(trimmed)) {
      toast.error('Invalid USDT TRC20 address');
      return;
    }
    localStorage.setItem('global-usdt-address', trimmed);
    toast.success('Global USDT address saved successfully');
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-sm">CryptoLegacy Wallet Control Center</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="border-red-600/50 bg-red-600/10 hover:bg-red-600/20 text-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-[#111827] border border-[#374151]">
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Users className="w-4 h-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Users List Tab */}
          <TabsContent value="users">
            <Card className="bg-[#111827] border-[#374151]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Existing Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No users found</p>
                ) : (
                  <div className="space-y-4">
                    {users.map((user, index) => (
                      <div
                        key={index}
                        className="p-4 bg-[#1f2937] border border-[#374151] rounded-lg"
                      >
                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <div>
                            <Label className="text-gray-400 text-xs">Email</Label>
                            <p className="text-white font-medium">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <Label className="text-gray-400 text-xs">USDT Address</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={user.usdtAddress ?? ''}
                              onChange={(e) => handleUpdateUserUsdt(user.email, e.target.value)}
                              className="flex-1 bg-[#0a0e17] border-[#374151] text-green-400 font-mono text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(user.usdtAddress ?? '')}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 text-xs">
                            Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.email)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create User Tab */}
          <TabsContent value="create">
            <Card className="bg-[#111827] border-[#374151]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  Create New User
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-300 text-sm">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Enter user details below. The USDT address will be shown to this user during withdrawal.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300 mb-2 block">Email *</Label>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="user@example.com"
                      autoComplete="off"
                      className="bg-[#1f2937] border-[#374151] text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 mb-2 block">Password *</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="new-password"
                      className="bg-[#1f2937] border-[#374151] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 block">USDT TRC20 Address for this user *</Label>
                    <Input
                      value={newUsdtAddress}
                      onChange={(e) => setNewUsdtAddress(e.target.value)}
                      placeholder="Enter USDT TRC20 address"
                      className="bg-[#1f2937] border-[#374151] text-green-400 font-mono"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      This address will be shown to the user when they initiate a withdrawal
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 mb-2 block">Closure Timer (Days)</Label>
                    <Input
                      type="number"
                      value={closureDays}
                      onChange={(e) => setClosureDays(parseInt(e.target.value) || 3)}
                      min={1}
                      max={30}
                      className="bg-[#1f2937] border-[#374151] text-white"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Countdown will start from when user first visits the site
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleAddUser}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create User
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-[#111827] border-[#374151]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  Global Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-gray-300 mb-2 block">Default USDT TRC20 Address</Label>
                  <div className="flex gap-2">
                    <Input
                      value={globalUsdtAddress}
                      onChange={(e) => setGlobalUsdtAddress(e.target.value)}
                      placeholder="Enter default USDT TRC20 address"
                      className="flex-1 bg-[#1f2937] border-[#374151] text-green-400 font-mono"
                    />
                    <Button
                      onClick={handleSaveGlobalAddress}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    This is the default address used when creating new users
                  </p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <h4 className="text-white font-medium">Platform Closure</h4>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Each user gets their own countdown timer based on their account creation date.
                    </p>
                  </div>
                  <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <h4 className="text-white font-medium">Fee Timer</h4>
                    </div>
                    <p className="text-gray-400 text-sm">
                      The 30-minute payment timer starts fresh each time a user visits the fee page.
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                    <p className="text-gray-400 text-sm">Total Users</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">$103</p>
                    <p className="text-gray-400 text-sm">Withdrawal Fee</p>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">30 min</p>
                    <p className="text-gray-400 text-sm">Payment Window</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

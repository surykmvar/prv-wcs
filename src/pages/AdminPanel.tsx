import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, Users, MessageSquare, Mic, Plus, Edit, Trash, Download, Search, Filter } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [voiceResponses, setVoiceResponses] = useState([]);
  const [referralCodes, setReferralCodes] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [userReferrals, setUserReferrals] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  
  // Filters
  const [codeFilter, setCodeFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  
  // New referral code form
  const [newCode, setNewCode] = useState({
    code: '',
    maxUses: '',
    expiresAt: '',
    assignedTo: ''
  });

  // New plan form
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    priceCents: '',
    intervalType: 'month',
    features: ''
  });

  useEffect(() => {
    if (roleLoading) return;
    
    if (!isAdmin) {
      navigate('/');
      return;
    }

    loadAdminData();
  }, [isAdmin, roleLoading, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Load users
      const { data: usersData, error: usersError } = await supabase.rpc('get_auth_users_basic');
      if (usersError) throw usersError;

      // Load thoughts with counts
      const { data: thoughtsData, error: thoughtsError } = await supabase
        .from('thoughts')
        .select(`
          *,
          voice_responses(count)
        `);
      if (thoughtsError) throw thoughtsError;

      // Load voice responses
      const { data: voiceData, error: voiceError } = await supabase
        .from('voice_responses')
        .select('*');
      if (voiceError) throw voiceError;

      // Load referral codes
      const { data: codesData, error: codesError } = await supabase
        .from('referral_codes')
        .select('*');
      if (codesError) throw codesError;

      // Load membership plans
      const { data: plansData, error: plansError } = await supabase
        .from('membership_plans')
        .select('*');
      if (plansError) throw plansError;

      // Load user referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('user_referrals')
        .select('*');
      if (referralsError) throw referralsError;

      // Load user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, first_name, last_name');
      if (profilesError) throw profilesError;

      setUsers(usersData || []);
      setThoughts(thoughtsData || []);
      setVoiceResponses(voiceData || []);
      setReferralCodes(codesData || []);
      setMembershipPlans(plansData || []);
      setUserReferrals(referralsData || []);
      setUserProfiles(profilesData || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    try {
      const { error } = await supabase
        .from('referral_codes')
        .insert({
          code: newCode.code,
          max_uses: newCode.maxUses ? parseInt(newCode.maxUses) : null,
          expires_at: newCode.expiresAt || null,
          assigned_to: newCode.assignedTo || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral code created successfully"
      });

      setNewCode({ code: '', maxUses: '', expiresAt: '', assignedTo: '' });
      loadAdminData();
    } catch (error) {
      console.error('Error creating referral code:', error);
      toast({
        title: "Error",
        description: "Failed to create referral code",
        variant: "destructive"
      });
    }
  };

  const toggleCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('referral_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Code ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      loadAdminData();
    } catch (error) {
      console.error('Error updating code status:', error);
      toast({
        title: "Error",
        description: "Failed to update code status",
        variant: "destructive"
      });
    }
  };

  const createMembershipPlan = async () => {
    try {
      const features = newPlan.features.split(',').map(f => f.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('membership_plans')
        .insert({
          name: newPlan.name,
          description: newPlan.description,
          price_cents: parseInt(newPlan.priceCents) || 0,
          interval_type: newPlan.intervalType,
          features
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Membership plan created successfully"
      });

      setNewPlan({ name: '', description: '', priceCents: '', intervalType: 'month', features: '' });
      loadAdminData();
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create membership plan",
        variant: "destructive"
      });
    }
  };

  const exportReferralsCSV = () => {
    const csvContent = [
      ['Code', 'Uses', 'Max Uses', 'Active', 'Expires', 'Created', 'Assigned To'].join(','),
      ...referralCodes.map((code: any) => [
        code.code,
        code.current_uses,
        code.max_uses || 'Unlimited',
        code.is_active ? 'Yes' : 'No',
        code.expires_at ? new Date(code.expires_at).toISOString() : 'Never',
        new Date(code.created_at).toISOString(),
        code.assigned_to || 'Unassigned'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-codes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const assignCodeToUser = async (codeId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('referral_codes')
        .update({ assigned_to: userId })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Code assigned successfully"
      });

      loadAdminData();
    } catch (error) {
      console.error('Error assigning code:', error);
      toast({
        title: "Error",
        description: "Failed to assign code",
        variant: "destructive"
      });
    }
  };

  const filteredCodes = referralCodes.filter((code: any) => {
    if (codeFilter === 'active') return code.is_active;
    if (codeFilter === 'inactive') return !code.is_active;
    if (codeFilter === 'expired') return code.expires_at && new Date(code.expires_at) < new Date();
    return true;
  });

  const getUserReferralCounts = (userId: string) => {
    const sentCount = userReferrals.filter((r: any) => r.referrer_id === userId).length;
    const receivedCount = userReferrals.filter((r: any) => r.referred_id === userId).length;
    return { sent: sentCount, received: receivedCount };
  };

  const filteredUsers = users.filter((user: any) => 
    userSearch === '' || 
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Woices</title>
        <meta name="description" content="Admin panel for managing users, referrals, and membership plans" />
      </Helmet>
      
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to App
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Thoughts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{thoughts.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voice Responses</CardTitle>
                  <Mic className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{voiceResponses.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Referral Codes</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{referralCodes.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredUsers.map((user: any) => {
                    const referralCounts = getUserReferralCounts(user.user_id);
                    const profile = userProfiles.find((p: any) => p.user_id === user.user_id);
                    return (
                      <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{user.email}</div>
                          {profile && (
                            <div className="text-sm text-muted-foreground">
                              {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </div>
                          {user.last_sign_in_at && (
                            <div className="text-sm text-muted-foreground">
                              Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            ID: {user.user_id}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {thoughts.filter((t: any) => t.user_id === user.user_id).length} thoughts
                          </Badge>
                          <Badge variant="secondary">
                            {voiceResponses.filter((v: any) => v.user_id === user.user_id).length} responses
                          </Badge>
                          <Badge variant="outline">
                            {referralCounts.sent} referrals sent
                          </Badge>
                          <Badge variant="outline">
                            {referralCounts.received > 0 ? '1 referral received' : 'Not referred'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Referral Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={newCode.code}
                        onChange={(e) => setNewCode({...newCode, code: e.target.value})}
                        placeholder="e.g., WELCOME10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxUses">Max Uses (optional)</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        value={newCode.maxUses}
                        onChange={(e) => setNewCode({...newCode, maxUses: e.target.value})}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiresAt">Expires At (optional)</Label>
                      <Input
                        id="expiresAt"
                        type="datetime-local"
                        value={newCode.expiresAt}
                        onChange={(e) => setNewCode({...newCode, expiresAt: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignedTo">Assign to User ID (optional)</Label>
                      <Input
                        id="assignedTo"
                        value={newCode.assignedTo}
                        onChange={(e) => setNewCode({...newCode, assignedTo: e.target.value})}
                        placeholder="User UUID"
                      />
                    </div>
                  </div>
                  <Button onClick={createReferralCode}>Create Code</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Referral Codes</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={codeFilter}
                        onChange={(e) => setCodeFilter(e.target.value)}
                        className="px-3 py-1 border rounded-md text-sm"
                      >
                        <option value="all">All Codes</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="expired">Expired</option>
                      </select>
                      <Button variant="outline" size="sm" onClick={exportReferralsCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     {filteredCodes.map((code: any) => {
                      const assignedUser = users.find((u: any) => u.user_id === code.assigned_to);
                      return (
                        <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-mono font-bold">{code.code}</div>
                            <div className="text-sm text-muted-foreground">
                              Uses: {code.current_uses}{code.max_uses ? ` / ${code.max_uses}` : ' (unlimited)'}
                            </div>
                            {code.expires_at && (
                              <div className="text-sm text-muted-foreground">
                                Expires: {new Date(code.expires_at).toLocaleDateString()}
                              </div>
                            )}
                            {assignedUser ? (
                              <div className="text-sm text-muted-foreground">
                                Assigned to: {assignedUser.email}
                              </div>
                            ) : (
                              <div className="text-sm text-red-500">Unassigned</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={code.is_active ? "default" : "secondary"}>
                              {code.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Switch
                              checked={code.is_active}
                              onCheckedChange={() => toggleCodeStatus(code.id, code.is_active)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="memberships">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Membership Plan</CardTitle>
                  <CardDescription>Ready for future Stripe integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="planName">Plan Name</Label>
                      <Input
                        id="planName"
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                        placeholder="e.g., Basic, Pro, Creator"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priceCents">Price (cents)</Label>
                      <Input
                        id="priceCents"
                        type="number"
                        value={newPlan.priceCents}
                        onChange={(e) => setNewPlan({...newPlan, priceCents: e.target.value})}
                        placeholder="e.g., 999 for $9.99"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="planDescription">Description</Label>
                    <Textarea
                      id="planDescription"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                      placeholder="Plan description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="features">Features (comma-separated)</Label>
                    <Input
                      id="features"
                      value={newPlan.features}
                      onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
                      placeholder="e.g., Unlimited thoughts, Priority support"
                    />
                  </div>
                  <Button onClick={createMembershipPlan}>Create Plan</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Membership Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {membershipPlans.map((plan: any) => (
                      <Card key={plan.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {plan.name}
                            <Badge variant={plan.is_active ? "default" : "secondary"}>
                              {plan.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            ${(plan.price_cents / 100).toFixed(2)} / {plan.interval_type}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                          <div className="space-y-1">
                            {plan.features?.map((feature: string, index: number) => (
                              <div key={index} className="text-sm">• {feature}</div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thoughts Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {thoughts.slice(0, 10).map((thought: any) => (
                      <div key={thought.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{thought.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{thought.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{thought.status}</Badge>
                          <Badge variant="secondary">
                            {voiceResponses.filter((v: any) => v.thought_id === thought.id).length} responses
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
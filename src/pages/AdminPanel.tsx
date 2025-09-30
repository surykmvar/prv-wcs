import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, Users, MessageSquare, Mic, Plus, Download, Search, CalendarIcon, Circle, Square, Trash2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CreditPackageManager } from '@/components/admin/CreditPackageManager';
import { Helmet } from 'react-helmet-async';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { validateAudioDuration } from '@/utils/audioUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminPanel() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [showSystemFlowMobileNotice, setShowSystemFlowMobileNotice] = useState(false);
  const [deleteWidgetId, setDeleteWidgetId] = useState<string | null>(null);
  const [users, setUsers] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [voiceResponses, setVoiceResponses] = useState([]);
  const [referralCodes, setReferralCodes] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [userReferrals, setUserReferrals] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [landingWidgets, setLandingWidgets] = useState([]);
  
  // Filters
  const [codeFilter, setCodeFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  
  // New referral code form
  const [newCode, setNewCode] = useState({
    code: '',
    maxUses: '',
    expiresAt: undefined as Date | undefined,
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

  // New widget form
  const [newWidget, setNewWidget] = useState({
    reviewer_name: '',
    product_name: '',
    location: '',
    duration: 0,
    audio_url: '',
    gender: 'male',
    widget_type: 'website',
    myth_votes: '0',
    fact_votes: '0',
    unclear_votes: '0'
  });
  
  // Voice recording state
  const [recordingMode, setRecordingMode] = useState<'upload' | 'record'>('upload');
  const voiceRecording = useVoiceRecording(60);

  useEffect(() => {
    loadAdminData();
  }, []);

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

      // Load landing page widgets
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('landing_page_widgets')
        .select('*')
        .order('display_order');
      if (widgetsError) throw widgetsError;

      setUsers(usersData || []);
      setThoughts(thoughtsData || []);
      setVoiceResponses(voiceData || []);
      setReferralCodes(codesData || []);
      setMembershipPlans(plansData || []);
      setUserReferrals(referralsData || []);
      setUserProfiles(profilesData || []);
      setLandingWidgets(widgetsData || []);
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
          expires_at: newCode.expiresAt ? newCode.expiresAt.toISOString() : null,
          assigned_to: newCode.assignedTo || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral code created successfully"
      });

      setNewCode({ code: '', maxUses: '', expiresAt: undefined, assignedTo: '' });
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

  const createLandingWidget = async () => {
    try {
      // Validate required fields
      if (!newWidget.reviewer_name || !newWidget.product_name || !newWidget.location) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Validate audio and duration
      if (!newWidget.audio_url || newWidget.duration === 0) {
        toast({
          title: "Error",
          description: "Please record or upload audio (max 60 seconds)",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('landing_page_widgets')
        .insert({
          reviewer_name: newWidget.reviewer_name,
          product_name: newWidget.product_name,
          location: newWidget.location,
          duration: newWidget.duration,
          rating: Math.max(1, Math.min(5, Math.round(
            parseInt(newWidget.fact_votes) > parseInt(newWidget.myth_votes) ? 5 : 
            parseInt(newWidget.myth_votes) > parseInt(newWidget.fact_votes) ? 1 : 3
          ))),
          audio_url: newWidget.audio_url || null,
          gender: newWidget.gender,
          widget_type: newWidget.widget_type,
          myth_votes: parseInt(newWidget.myth_votes),
          fact_votes: parseInt(newWidget.fact_votes),
          unclear_votes: parseInt(newWidget.unclear_votes),
          display_order: landingWidgets.filter((w: any) => w.widget_type === newWidget.widget_type).length + 1
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Landing page widget created successfully"
      });

      // Reset form and recording
      setNewWidget({
        reviewer_name: '',
        product_name: '',
        location: '',
        duration: 0,
        audio_url: '',
        gender: 'male',
        widget_type: 'website',
        myth_votes: '0',
        fact_votes: '0',
        unclear_votes: '0'
      });
      voiceRecording.resetRecording();
      setRecordingMode('upload');
      loadAdminData();
    } catch (error) {
      console.error('Error creating widget:', error);
      toast({
        title: "Error",
        description: "Failed to create landing page widget",
        variant: "destructive"
      });
    }
  };

  const toggleWidgetStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('landing_page_widgets')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Widget ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      loadAdminData();
    } catch (error) {
      console.error('Error updating widget status:', error);
      toast({
        title: "Error",
        description: "Failed to update widget status",
        variant: "destructive"
      });
    }
  };

  const deleteWidget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('landing_page_widgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Widget deleted successfully"
      });

      setDeleteWidgetId(null);
      loadAdminData();
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: "Error",
        description: "Failed to delete widget",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Woices</title>
        <meta name="description" content="Admin panel for managing users, referrals, and membership plans" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
          <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
            <Button 
              onClick={() => {
                if (isMobile) {
                  setShowSystemFlowMobileNotice(true)
                } else {
                  navigate('/system-flow')
                }
              }} 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto"
            >
              System Flow
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="sm" className="w-full sm:w-auto">
              Back to App
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="w-full overflow-x-auto no-scrollbar">
            <TabsList className="inline-flex whitespace-nowrap gap-1 rounded-lg border bg-muted p-1 md:p-2 h-9 md:h-10 text-xs md:text-sm min-w-full sm:min-w-0">
              <TabsTrigger value="overview" className="shrink-0 px-2 py-1 text-xs">Overview</TabsTrigger>
              <TabsTrigger value="users" className="shrink-0 px-2 py-1 text-xs">Users</TabsTrigger>
              <TabsTrigger value="referrals" className="shrink-0 px-2 py-1 text-xs">Referrals</TabsTrigger>
              <TabsTrigger value="memberships" className="shrink-0 px-2 py-1 text-xs">Members</TabsTrigger>
              <TabsTrigger value="content" className="shrink-0 px-2 py-1 text-xs">Content</TabsTrigger>
              <TabsTrigger value="landing-widgets" className="shrink-0 px-2 py-1 text-xs">Landing Page</TabsTrigger>
            </TabsList>
          </div>

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
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">User Management</CardTitle>
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
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredUsers.map((user: any) => {
                    const referralCounts = getUserReferralCounts(user.user_id);
                    const profile = userProfiles.find((p: any) => p.user_id === user.user_id);
                    return (
                      <div key={user.user_id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-2 p-4 border rounded-lg">
                        <div className="flex-1">
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Create Referral Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={newCode.code}
                        onChange={(e) => setNewCode({...newCode, code: e.target.value})}
                        placeholder="e.g., WELCOME10"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxUses">Max Uses (optional)</Label>
                      <Input
                        id="maxUses"
                        className="h-9 text-sm"
                        type="number"
                        value={newCode.maxUses}
                        onChange={(e) => setNewCode({...newCode, maxUses: e.target.value})}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiresAt">Expires At (optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCode.expiresAt ? format(newCode.expiresAt, "PPP p") : "Pick a date and time"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newCode.expiresAt}
                            onSelect={(date) => setNewCode({...newCode, expiresAt: date})}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
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
                  <Button onClick={createReferralCode} size="sm">Create Code</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Referral Codes</CardTitle>
                    </div>
                    <div className="flex gap-2">
<Select value={codeFilter} onValueChange={setCodeFilter}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Filter codes" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Codes</SelectItem>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
    <SelectItem value="expired">Expired</SelectItem>
  </SelectContent>
</Select>
<Button variant="secondary" size="sm" onClick={exportReferralsCSV}>
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
                        <div key={code.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-2 p-4 border rounded-lg">
                          <div className="flex-1">
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
            <CreditPackageManager />
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

          <TabsContent value="landing-widgets">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Create Landing Page Widget</CardTitle>
                  <CardDescription>Manage demo voice reviews shown on the landing page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reviewer_name">Reviewer Name</Label>
                      <Input
                        id="reviewer_name"
                        value={newWidget.reviewer_name}
                        onChange={(e) => setNewWidget({...newWidget, reviewer_name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="product_name">Product Name</Label>
                      <Input
                        id="product_name"
                        value={newWidget.product_name}
                        onChange={(e) => setNewWidget({...newWidget, product_name: e.target.value})}
                        placeholder="Wireless Headphones"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newWidget.location}
                        onChange={(e) => setNewWidget({...newWidget, location: e.target.value})}
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>

                  {/* Audio Recording/Upload Section */}
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Audio (Max 60 seconds)</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={recordingMode === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setRecordingMode('upload');
                            voiceRecording.resetRecording();
                          }}
                        >
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant={recordingMode === 'record' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRecordingMode('record')}
                        >
                          <Mic className="w-3 h-3 mr-1" />
                          Record Voice
                        </Button>
                      </div>
                    </div>

                    {recordingMode === 'upload' ? (
                      <div>
                        <Input
                          id="audio_upload"
                          type="file"
                          accept=".wav,.mp3,.m4a,.ogg,audio/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                // Validate audio duration
                                const validation = await validateAudioDuration(file, 60);
                                
                                if (!validation.valid) {
                                  toast({
                                    title: "Error",
                                    description: validation.error,
                                    variant: "destructive"
                                  });
                                  e.target.value = ''; // Reset input
                                  return;
                                }

                                const fileExt = file.name.split('.').pop();
                                const fileName = `widget-${Date.now()}.${fileExt}`;
                                
                                const { data, error } = await supabase.storage
                                  .from('voice-recordings')
                                  .upload(fileName, file);
                                
                                if (error) throw error;
                                
                                setNewWidget({
                                  ...newWidget, 
                                  audio_url: fileName,
                                  duration: validation.duration
                                });
                                
                                toast({
                                  title: "Success",
                                  description: `Audio uploaded (${validation.duration}s)`
                                });
                              } catch (error) {
                                console.error('Upload error:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to upload audio file",
                                  variant: "destructive"
                                });
                              }
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload audio file (max 60 seconds). Supported formats: WAV, MP3, M4A, OGG
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Recording Controls */}
                        <div className="flex items-center gap-3">
                          {!voiceRecording.isRecording && !voiceRecording.audioUrl && (
                            <Button
                              type="button"
                              onClick={voiceRecording.startRecording}
                              size="sm"
                              className="gap-2"
                            >
                              <Circle className="w-4 h-4 fill-current" />
                              Start Recording
                            </Button>
                          )}
                          
                          {voiceRecording.isRecording && (
                            <>
                              <Button
                                type="button"
                                onClick={voiceRecording.stopRecording}
                                size="sm"
                                variant="destructive"
                                className="gap-2"
                              >
                                <Square className="w-4 h-4" />
                                Stop
                              </Button>
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                                <span className="font-mono">{voiceRecording.formatTime(voiceRecording.timeLeft)}</span>
                              </div>
                            </>
                          )}

                          {voiceRecording.audioUrl && (
                            <>
                              <audio src={voiceRecording.audioUrl} controls className="flex-1 h-8" />
                              <Button
                                type="button"
                                onClick={async () => {
                                  try {
                                    if (!voiceRecording.audioBlob) return;
                                    
                                    const fileName = `widget-${Date.now()}.webm`;
                                    const { data, error } = await supabase.storage
                                      .from('voice-recordings')
                                      .upload(fileName, voiceRecording.audioBlob);
                                    
                                    if (error) throw error;
                                    
                                    setNewWidget({
                                      ...newWidget, 
                                      audio_url: fileName,
                                      duration: voiceRecording.duration
                                    });
                                    
                                    toast({
                                      title: "Success",
                                      description: `Recording saved (${voiceRecording.duration}s)`
                                    });
                                  } catch (error) {
                                    console.error('Save error:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to save recording",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                                size="sm"
                                variant="default"
                              >
                                Use Recording
                              </Button>
                              <Button
                                type="button"
                                onClick={voiceRecording.resetRecording}
                                size="sm"
                                variant="outline"
                              >
                                Re-record
                              </Button>
                            </>
                          )}
                        </div>
                        
                        {voiceRecording.isRecording && (
                          <p className="text-xs text-muted-foreground">
                            Recording will automatically stop at 60 seconds
                          </p>
                        )}
                      </div>
                    )}

                    {/* Show current audio status */}
                    {newWidget.audio_url && newWidget.duration > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-2 rounded">
                        <Mic className="w-4 h-4" />
                        <span>Audio ready: {newWidget.duration}s</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Voice Gender</Label>
                      <Select value={newWidget.gender} onValueChange={(value) => setNewWidget({...newWidget, gender: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="widget_type">Widget Type</Label>
                      <Select value={newWidget.widget_type} onValueChange={(value) => setNewWidget({...newWidget, widget_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website Integration</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="myth_votes">Myth Votes</Label>
                      <Input
                        id="myth_votes"
                        type="number"
                        value={newWidget.myth_votes}
                        onChange={(e) => setNewWidget({...newWidget, myth_votes: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fact_votes">Fact Votes</Label>
                      <Input
                        id="fact_votes"
                        type="number"
                        value={newWidget.fact_votes}
                        onChange={(e) => setNewWidget({...newWidget, fact_votes: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unclear_votes">Unclear Votes</Label>
                      <Input
                        id="unclear_votes"
                        type="number"
                        value={newWidget.unclear_votes}
                        onChange={(e) => setNewWidget({...newWidget, unclear_votes: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={createLandingWidget} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Widget
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Existing Landing Page Widgets</CardTitle>
                  <CardDescription>Manage and edit widgets shown on the landing page</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {landingWidgets.map((widget: any) => (
                      <div key={widget.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{widget.reviewer_name} - {widget.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {widget.location} • {widget.duration}s • {widget.rating} stars • {widget.gender}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Votes: {widget.fact_votes} fact, {widget.myth_votes} myth, {widget.unclear_votes} unclear
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Type: {widget.widget_type} • Order: {widget.display_order}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            className={widget.is_active 
                              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700" 
                              : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700"
                            }
                          >
                            {widget.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className={widget.is_active 
                              ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900" 
                              : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900"
                            }
                            onClick={() => toggleWidgetStatus(widget.id, widget.is_active)}
                          >
                            {widget.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900"
                            onClick={() => setDeleteWidgetId(widget.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
        
        <AlertDialog open={showSystemFlowMobileNotice} onOpenChange={setShowSystemFlowMobileNotice}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desktop-only feature</AlertDialogTitle>
              <AlertDialogDescription>
                System Flow is only accessible on desktop. Please open Woices on a laptop or desktop to view it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                className="bg-muted text-muted-foreground hover:bg-muted/80"
                onClick={() => {
                  setShowSystemFlowMobileNotice(false)
                }}
              >
                Stay on Admin Panel
              </AlertDialogAction>
              <AlertDialogAction onClick={() => {
                setShowSystemFlowMobileNotice(false)
                navigate('/')
              }}>
                Go Home
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={deleteWidgetId !== null} onOpenChange={(open) => !open && setDeleteWidgetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Widget</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this widget? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction 
                className="bg-muted text-muted-foreground hover:bg-muted/80"
                onClick={() => setDeleteWidgetId(null)}
              >
                Cancel
              </AlertDialogAction>
              <AlertDialogAction 
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => deleteWidgetId && deleteWidget(deleteWidgetId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

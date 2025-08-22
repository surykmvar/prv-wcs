import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Tag, Calendar } from 'lucide-react';
import { useCreditPackages, CreditPackage } from '@/hooks/useCreditPackages';
import { useToast } from '@/hooks/use-toast';

export function CreditPackageManager() {
  const { packages, loading, createPackage, updatePackage, deletePackage, applySeasonalOffer, removeSeasonalOffer } = useCreditPackages();
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<string>('India');
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSeasonalDialog, setShowSeasonalDialog] = useState(false);
  const [seasonalPackage, setSeasonalPackage] = useState<CreditPackage | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    points: '',
    price_cents: '',
    currency: 'INR',
    region: 'India',
    is_popular: false,
    is_active: true
  });

  const [seasonalData, setSeasonalData] = useState({
    percentage: '',
    expires_at: ''
  });

  const regions = ['India', 'Europe', 'US'];
  const currencies = {
    'India': 'INR',
    'Europe': 'EUR',
    'US': 'USD'
  };

  const filteredPackages = packages.filter(pkg => pkg.region === selectedRegion);

  const resetForm = () => {
    setFormData({
      name: '',
      points: '',
      price_cents: '',
      currency: currencies[selectedRegion as keyof typeof currencies] || 'USD',
      region: selectedRegion,
      is_popular: false,
      is_active: true
    });
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.points || !formData.price_cents) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      await createPackage({
        ...formData,
        points: parseInt(formData.points),
        price_cents: parseInt(formData.price_cents)
      } as any);

      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingPackage) return;

    try {
      await updatePackage(editingPackage.id, {
        ...formData,
        points: parseInt(formData.points),
        price_cents: parseInt(formData.price_cents)
      });

      setEditingPackage(null);
      resetForm();
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePackage(id);
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const openEditDialog = (pkg: CreditPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      points: pkg.points.toString(),
      price_cents: pkg.price_cents.toString(),
      currency: pkg.currency,
      region: pkg.region,
      is_popular: pkg.is_popular,
      is_active: pkg.is_active
    });
  };

  const openSeasonalDialog = (pkg: CreditPackage) => {
    setSeasonalPackage(pkg);
    setSeasonalData({
      percentage: pkg.seasonal_offer_percentage?.toString() || '',
      expires_at: pkg.seasonal_offer_expires_at ? 
        new Date(pkg.seasonal_offer_expires_at).toISOString().split('T')[0] : ''
    });
    setShowSeasonalDialog(true);
  };

  const handleSeasonalOffer = async () => {
    if (!seasonalPackage) return;

    try {
      if (seasonalData.percentage && seasonalData.expires_at) {
        await applySeasonalOffer(
          seasonalPackage.id,
          parseInt(seasonalData.percentage),
          new Date(seasonalData.expires_at).toISOString()
        );
      } else {
        await removeSeasonalOffer(seasonalPackage.id);
      }

      setShowSeasonalDialog(false);
      setSeasonalPackage(null);
      setSeasonalData({ percentage: '', expires_at: '' });
    } catch (error) {
      console.error('Error managing seasonal offer:', error);
    }
  };

  if (loading) {
    return <div>Loading packages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Credit Package Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Credit Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Starter Pack"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (cents)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price_cents}
                    onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
                    placeholder="9900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({ 
                    ...formData, 
                    region: value, 
                    currency: currencies[value as keyof typeof currencies] || 'USD' 
                  })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label htmlFor="popular">Mark as Popular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedRegion} onValueChange={setSelectedRegion}>
        <TabsList>
          {regions.map(region => (
            <TabsTrigger key={region} value={region}>{region}</TabsTrigger>
          ))}
        </TabsList>

        {regions.map(region => (
          <TabsContent key={region} value={region}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map(pkg => {
                const hasSeasonalOffer = pkg.seasonal_offer_percentage && 
                  pkg.seasonal_offer_expires_at && 
                  new Date(pkg.seasonal_offer_expires_at) > new Date();

                return (
                  <Card key={pkg.id} className={`relative ${!pkg.is_active ? 'opacity-50' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <div className="flex gap-1">
                          {pkg.is_popular && (
                            <Badge variant="default">Popular</Badge>
                          )}
                          {hasSeasonalOffer && (
                            <Badge variant="destructive">
                              -{pkg.seasonal_offer_percentage}%
                            </Badge>
                          )}
                          {!pkg.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{pkg.points}</div>
                        <div className="text-sm text-muted-foreground">Credits</div>
                        <div className="text-lg font-semibold text-primary">
                          {pkg.currency === 'INR' ? '₹' : pkg.currency === 'EUR' ? '€' : '$'}
                          {(pkg.price_cents / 100).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(pkg)}
                          className="flex-1"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSeasonalDialog(pkg)}
                          className="flex-1"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          Offer
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(pkg.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      {editingPackage && (
        <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Credit Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Package Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-points">Points</Label>
                  <Input
                    id="edit-points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Price (cents)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price_cents}
                    onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                />
                <Label htmlFor="edit-popular">Mark as Popular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <Button onClick={handleEdit} className="w-full">
                Update Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Seasonal Offer Dialog */}
      <Dialog open={showSeasonalDialog} onOpenChange={setShowSeasonalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Seasonal Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="percentage">Discount Percentage</Label>
              <Input
                id="percentage"
                type="number"
                placeholder="20"
                value={seasonalData.percentage}
                onChange={(e) => setSeasonalData({ ...seasonalData, percentage: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expires">Expires On</Label>
              <Input
                id="expires"
                type="date"
                value={seasonalData.expires_at}
                onChange={(e) => setSeasonalData({ ...seasonalData, expires_at: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSeasonalOffer} className="flex-1">
                {seasonalData.percentage ? 'Apply Offer' : 'Remove Offer'}
              </Button>
              <Button variant="outline" onClick={() => setShowSeasonalDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
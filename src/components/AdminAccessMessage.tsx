import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Mail } from 'lucide-react';

export function AdminAccessMessage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Admin Access Required</CardTitle>
          <CardDescription>
            You need admin privileges to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe you should have admin access, please contact the system administrator.
          </p>
          <Button 
            variant="outline"
            onClick={() => window.location.href = 'mailto:admin@woices.com?subject=Admin Access Request'}
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Request Admin Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
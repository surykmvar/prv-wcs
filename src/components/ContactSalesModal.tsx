import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Building, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText, sanitizeTextPreserveSpaces, sanitizeName, validateEmail } from '@/utils/sanitization';

interface ContactSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSalesModal({ open, onOpenChange }: ContactSalesModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    address: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please provide a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    // Validate message length
    if (formData.message.length < 10) {
      toast({
        title: 'Message Too Short',
        description: 'Please provide at least 10 characters in your message.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.message.length > 5000) {
      toast({
        title: 'Message Too Long',
        description: 'Please keep your message under 5000 characters.',
        variant: 'destructive'
      });
      return;
    }

    // Validate name length
    if (formData.name.length < 2) {
      toast({
        title: 'Invalid Name',
        description: 'Please provide at least 2 characters for your name.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      // Sanitize all inputs before sending to database
      const sanitizedData = {
        name: sanitizeName(formData.name),
        email: sanitizeText(formData.email).toLowerCase(),
        company_name: formData.company_name ? sanitizeText(formData.company_name) : '',
        address: formData.address ? sanitizeText(formData.address) : '',
        message: sanitizeText(formData.message)
      };

      // Send email to info@woices.app and store in database
      const [emailResponse, dbResponse] = await Promise.all([
        supabase.functions.invoke('send-sales-inquiry', {
          body: {
            name: sanitizedData.name,
            email: sanitizedData.email,
            companyName: sanitizedData.company_name,
            message: sanitizedData.message
          }
        }),
        supabase.functions.invoke('submit-sales-inquiry', {
          body: {
            name: sanitizedData.name,
            email: sanitizedData.email,
            companyName: sanitizedData.company_name,
            message: sanitizedData.message
          }
        })
      ]);

      const { data: response, error } = dbResponse;

      if (error || !response?.success) {
        // Handle specific error messages from edge function
        const errorMessage = response?.error || error?.message || 'Unknown error';
        
        if (errorMessage.includes('Too many submissions') || errorMessage.includes('rate limit')) {
          toast({
            title: 'Submission Limit Reached',
            description: 'You can only submit 3 inquiries per hour. Please try again later.',
            variant: 'destructive'
          });
          return;
        }
        
        if (errorMessage.includes('Invalid submission data')) {
          toast({
            title: 'Invalid Data',
            description: 'Please check all fields and try again.',
            variant: 'destructive'
          });
          return;
        }
        
        throw new Error(errorMessage);
      }

      toast({
        title: 'Inquiry Sent!',
        description: 'Thank you for your interest. Our sales team will contact you within 24 hours.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company_name: '',
        address: '',
        message: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit your inquiry. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    // Basic client-side sanitization for real-time feedback - preserve spaces for typing
    let sanitizedValue = value;
    
    if (field === 'name' || field === 'company_name') {
      sanitizedValue = value.replace(/[<>]/g, '').substring(0, 100);
    } else if (field === 'email') {
      sanitizedValue = sanitizeTextPreserveSpaces(value).toLowerCase();
    } else if (field === 'address' || field === 'message') {
      sanitizedValue = sanitizeTextPreserveSpaces(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center gap-2 justify-center">
            <Building className="h-5 w-5 text-primary" />
            Contact Sales
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Name
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="Your company name"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="Your business address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tell us about your business needs and how we can help..."
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Inquiry'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
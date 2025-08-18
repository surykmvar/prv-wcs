import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
// Removed Card components in favor of custom layout
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, X, Mail, Phone } from 'lucide-react'
import { isPasswordLeaked } from '@/utils/security'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import authOrb from '@/assets/auth-orb-woices.webp'
type AuthMode = 'signin' | 'signup'
type AuthMethod = 'email' | 'phone'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const urlMode = searchParams.get('mode')
  const mode: AuthMode = (urlMode === 'signup' || urlMode === 'signin') ? urlMode : 'signin'
  const redirectParam = searchParams.get('redirect') || '/'
  const redirectTarget = decodeURIComponent(redirectParam)
  
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [comingSoon, setComingSoon] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate(redirectTarget)
      }
    }
    checkUser()
  }, [navigate, redirectTarget])

  // Basic SEO: title, description, canonical
  useEffect(() => {
    const pageTitle = mode === 'signin' ? 'Sign in' : 'Register'
    document.title = `${pageTitle} - Woices`

    const desc = 'Sign in or create your Woices account to join thoughtful voice debates.'
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', desc)

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', window.location.href)
  }, [mode])

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Security: check leaked passwords before attempting signup
      const leakedCount = await isPasswordLeaked(password)
      if (leakedCount > 0) {
        toast({
          title: "Choose a safer password",
          description: "This password has appeared in known data breaches. Please use a different, stronger password.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      const redirectUrl = `${window.location.origin}${redirectTarget}`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })

      if (error) throw error

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your signup.",
      })
      
      // If user confirms email immediately and we have a referral code, try to apply it
      // Note: This will only work if email confirmation is disabled in Supabase
      if (referralCode.trim()) {
        try {
          const { data: session } = await supabase.auth.getSession()
          if (session?.session) {
            const response = await supabase.functions.invoke('apply-referral', {
              body: { referralCode: referralCode.trim() }
            });

            if (response.error) {
              console.error('Error applying referral:', response.error);
              return;
            }

            const result = response.data;
            if (result.success) {
              toast({
                title: "Referral Applied!",
                description: "Your referral code has been applied successfully! 🎉"
              });
            } else {
              // Handle specific error codes with better messages
              const errorMessages = {
                'ALREADY_REFERRED': 'You have already been referred by someone else.',
                'INVALID_CODE': 'This referral code is invalid or has been deactivated.',
                'EXPIRED_CODE': 'This referral code has expired.',
                'MAX_USES_REACHED': 'This referral code has reached its usage limit.',
                'SELF_REFERRAL': 'You cannot use your own referral code.'
              };
              
              const message = errorMessages[result.code as keyof typeof errorMessages] || result.message || 'Unknown error occurred';
              toast({
                title: "Referral Code Issue",
                description: message,
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error('Error applying referral code:', error);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Apply referral code if provided and user doesn't have one already
      if (referralCode.trim()) {
        try {
          const { data: referralData, error: referralError } = await supabase.functions.invoke('apply-referral', {
            body: { referralCode: referralCode.trim() }
          });
          
          if (referralData?.success) {
            toast({
              title: "Referral Applied!",
              description: "Your referral code has been applied successfully.",
            });
          }
        } catch (error) {
          console.error('Error applying referral code:', error);
        }
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      })
      
      navigate(redirectTarget)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: 'Enter your email',
        description: 'Please enter your account email above first.'
      })
      return
    }
    try {
      const redirectUrl = `${window.location.origin}/auth`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      })
      if (error) throw error
      toast({ title: 'Password reset sent', description: 'Check your email for the reset link.' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Could not send reset email.', variant: 'destructive' })
    }
  }

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!otpSent) {
        // Send OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: {
            data: mode === 'signup' ? {
              first_name: firstName,
              last_name: lastName
            } : undefined
          }
        })

        if (error) throw error

        setOtpSent(true)
        toast({
          title: "OTP sent",
          description: "Please check your phone for the verification code.",
        })
      } else {
        // Verify OTP
        const { error } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: 'sms'
        })

        if (error) throw error

        toast({
          title: mode === 'signup' ? "Account created!" : "Welcome back!",
          description: "You've successfully authenticated.",
        })
        
        navigate(redirectTarget)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetPhoneFlow = () => {
    setOtpSent(false)
    setOtp('')
  }

  const renderTabButtons = () => (
    <div className="flex justify-center gap-2 mb-6">
      <Button 
        variant={mode === 'signin' ? 'default' : 'outline'}
        onClick={() => navigate('/auth?mode=signin')}
        className="flex-1"
      >
        Sign In
      </Button>
      <Button 
        variant={mode === 'signup' ? 'default' : 'outline'}
        onClick={() => navigate('/auth?mode=signup')}
        className="flex-1"
      >
        Register Now!
      </Button>
    </div>
  )

  const renderAuthMethodToggle = () => (
    <div className="mb-4">
      <Tabs
        value={authMethod}
        onValueChange={(v) => {
          if (v === 'phone' && mode === 'signup') {
            setComingSoon(true)
            return
          }
          setAuthMethod(v as AuthMethod)
          resetPhoneFlow()
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex items-center gap-2" aria-disabled={mode === 'signup'}>
            <Phone className="h-4 w-4" /> Phone
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )

  const renderEmailForm = () => (
    <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
      {mode === 'signup' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === 'signup' ? 6 : undefined} />
          <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {mode === 'signup' && (
          <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="referral">Referral Code (Optional)</Label>
        <Input 
          id="referral" 
          type="text" 
          placeholder="Enter referral code" 
          value={referralCode} 
          onChange={(e) => setReferralCode(e.target.value)} 
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(Boolean(v))} />
          <span>Remember me</span>
        </label>
        <Button type="button" variant="link" className="px-0" onClick={handleResetPassword}>
          Forgot password?
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (mode === 'signin' ? 'Signing in...' : 'Creating account...') : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
      </Button>
    </form>
  )

  const renderPhoneForm = () => (
    <form onSubmit={handlePhoneAuth} className="space-y-4">
      {mode === 'signup' && !otpSent && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone-first-name">First Name</Label>
            <Input
              id="phone-first-name"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone-last-name">Last Name</Label>
            <Input
              id="phone-last-name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
      )}
      
      {!otpSent ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1 for US)
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending OTP..." : "Send Verification Code"}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to {phone}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetPhoneFlow}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </div>
        </>
      )}
    </form>
  )

  return (
    <main className="w-full px-4 sm:px-6 py-8 md:py-12 min-h-[85vh] flex items-center justify-center">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl border bg-card shadow-sm md:grid-cols-2">
        {/* Left: Form */}
        <article className="relative p-6 sm:p-10 md:order-2">
          <button
            aria-label="Close"
            onClick={() => navigate('/')}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <header className="mb-6">
            <div className="mb-2 flex gap-2">
              <Button 
                variant={mode === 'signin' ? 'default' : 'outline'}
                onClick={() => navigate('/auth?mode=signin')}
                size="sm"
              >
                Sign In
              </Button>
              <Button 
                variant={mode === 'signup' ? 'default' : 'outline'}
                onClick={() => navigate('/auth?mode=signup')}
                size="sm"
              >
                Register Now
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Join the conversation and share your voice.</p>
          </header>

          {renderAuthMethodToggle()}
          {authMethod === 'email' ? renderEmailForm() : renderPhoneForm()}

          {comingSoon && (
            <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center space-y-2 px-6">
                <p className="text-lg font-semibold">Phone sign up is coming soon</p>
                <p className="text-sm text-muted-foreground">Please use email for now.</p>
                <Button onClick={() => setComingSoon(false)} className="mt-2">Okay</Button>
              </div>
            </div>
          )}
        </article>

        {/* Right: Visual */}
        <aside className="hidden md:block relative bg-muted md:order-1">
          <img
            src={authOrb}
            alt="AI voice assistant orb with waveforms in Woices gradient"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </aside>
      </section>
    </main>
  )
}
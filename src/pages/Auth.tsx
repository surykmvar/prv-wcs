import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, X, Mail, Phone } from 'lucide-react'
import { isPasswordLeaked } from '@/utils/security'
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
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
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
  }, [navigate])

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
        Log In
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
    <div className="flex justify-center gap-2 mb-4">
      <Button 
        variant={authMethod === 'email' ? 'default' : 'outline'}
        onClick={() => {
          setAuthMethod('email')
          resetPhoneFlow()
        }}
        size="sm"
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        Email
      </Button>
      <Button 
        variant={authMethod === 'phone' ? 'default' : 'outline'}
        onClick={() => {
          if (mode === 'signup') {
            setComingSoon(true)
            return
          }
          setAuthMethod('phone')
          resetPhoneFlow()
        }}
        size="sm"
        className="flex items-center gap-2"
      >
        <Phone className="h-4 w-4" />
        Phone
      </Button>
    </div>
  )

  const renderEmailForm = () => (
    <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
      {mode === 'signup' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={mode === 'signin' ? "Enter your password" : "Create a password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'signup' ? 6 : undefined}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {mode === 'signup' && (
          <p className="text-xs text-muted-foreground">
            Password must be at least 6 characters long
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (mode === 'signin' ? "Signing in..." : "Creating account...") : (mode === 'signin' ? "Sign In" : "Sign Up")}
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md relative">
        {/* Back/Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="absolute right-4 top-4 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Woices</CardTitle>
          <CardDescription>
            Join the conversation and share your voice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {renderTabButtons()}
            {renderAuthMethodToggle()}
            {authMethod === 'email' ? renderEmailForm() : renderPhoneForm()}
          </div>
        </CardContent>
        {comingSoon && (
          <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="text-center space-y-2 px-6">
              <p className="text-lg font-semibold">Phone sign up is coming soon</p>
              <p className="text-sm text-muted-foreground">Please use email for now.</p>
              <Button onClick={() => setComingSoon(false)} className="mt-2">Okay</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
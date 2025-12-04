import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

type AuthView = 'login' | 'register' | 'forgot-password';

const emailSchema = z.string().trim().email({ message: "Email inválido" });
const passwordSchema = z.string().min(6, { message: "Mínimo 6 caracteres" });

export default function AuthPage() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const [view, setView] = useState<AuthView>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    obradorCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  if (!loading && user) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    if (view !== 'forgot-password') {
      const passwordResult = passwordSchema.safeParse(formData.password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (view === 'register' && !formData.fullName.trim()) {
      newErrors.fullName = 'Nombre requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (view === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Error de inicio de sesión",
            description: error.message === 'Invalid login credentials' 
              ? 'Credenciales inválidas' 
              : error.message,
            variant: "destructive",
          });
        }
      } else if (view === 'register') {
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.fullName,
          formData.obradorCode || undefined
        );
        if (error) {
          toast({
            title: "Error de registro",
            description: error.message === 'User already registered'
              ? 'Este email ya está registrado'
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Cuenta creada",
            description: "Has iniciado sesión automáticamente",
          });
        }
      } else if (view === 'forgot-password') {
        const { error } = await resetPassword(formData.email);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Email enviado",
            description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
          });
          setView('login');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">TF</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TraceFood</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="panel-industrial p-6">
            {/* View Title */}
            <div className="text-center mb-6">
              {view === 'login' && (
                <>
                  <LogIn className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
                  <p className="text-muted-foreground mt-1">Accede a tu cuenta de TraceFood</p>
                </>
              )}
              {view === 'register' && (
                <>
                  <UserPlus className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h2 className="text-2xl font-bold">Crear Cuenta</h2>
                  <p className="text-muted-foreground mt-1">Regístrate en TraceFood</p>
                </>
              )}
              {view === 'forgot-password' && (
                <>
                  <KeyRound className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h2 className="text-2xl font-bold">Recuperar Contraseña</h2>
                  <p className="text-muted-foreground mt-1">Te enviaremos un enlace por email</p>
                </>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'register' && (
                <div>
                  <Label htmlFor="fullName" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Nombre Completo *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Tu nombre"
                    className="mt-2 h-12 bg-muted border-2 border-border focus:border-primary"
                  />
                  {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className="mt-2 h-12 bg-muted border-2 border-border focus:border-primary"
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              {view !== 'forgot-password' && (
                <div>
                  <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Contraseña *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="mt-2 h-12 bg-muted border-2 border-border focus:border-primary pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 translate-y-[-25%] text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                </div>
              )}

              {view === 'register' && (
                <div>
                  <Label htmlFor="obradorCode" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Código de Obrador (opcional)
                  </Label>
                  <Input
                    id="obradorCode"
                    type="text"
                    value={formData.obradorCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, obradorCode: e.target.value }))}
                    placeholder="Ej: OBR-001"
                    className="mt-2 h-12 bg-muted border-2 border-border focus:border-primary font-mono-industrial"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Para vincular con tu centro de trabajo
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="industrial"
                size="industrial"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    {view === 'login' && <LogIn className="h-6 w-6" />}
                    {view === 'register' && <UserPlus className="h-6 w-6" />}
                    {view === 'forgot-password' && <KeyRound className="h-6 w-6" />}
                    <span>
                      {view === 'login' && 'Entrar'}
                      {view === 'register' && 'Crear Cuenta'}
                      {view === 'forgot-password' && 'Enviar Email'}
                    </span>
                  </>
                )}
              </Button>
            </form>

            {/* View Switching */}
            <div className="mt-6 space-y-3">
              {view === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <div className="border-t border-border pt-4">
                    <p className="text-center text-sm text-muted-foreground">
                      ¿No tienes cuenta?{' '}
                      <button
                        type="button"
                        onClick={() => setView('register')}
                        className="text-primary font-bold hover:underline"
                      >
                        Regístrate
                      </button>
                    </p>
                  </div>
                </>
              )}
              
              {view === 'register' && (
                <div className="border-t border-border pt-4">
                  <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-primary font-bold hover:underline"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              )}
              
              {view === 'forgot-password' && (
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

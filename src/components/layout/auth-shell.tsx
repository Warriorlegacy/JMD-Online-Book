export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[#0a0f18]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.1),transparent_40%)]" />
        {/* Animated orbs */}
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-amber-500/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-400/10 blur-[80px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-12 w-12">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="url(#logoGrad)" opacity="0.2" />
              <path d="M30 65 L50 30 L70 65 M35 50 L50 35 L65 50" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="50" cy="72" r="8" fill="url(#logoGrad)" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-base text-slate-400 leading-relaxed">{subtitle}</p>
        </div>
        
        {/* Form Container */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8">
          {children}
        </div>
        
        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500">
          By continuing, you agree to our Terms & Conditions
        </p>
      </div>
    </div>
  );
}

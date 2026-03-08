import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileJson, Tag, ShieldCheck, BarChart3, Moon, Sun, Menu, ChevronRight, ChevronDown, Play, Boxes, Code, Users, History, ListChecks, ArrowLeftRight, TrendingDown, FileBarChart, Store, Stethoscope, BookOpen, Rocket, HelpCircle, MessageCircleQuestion, ShoppingCart, Target, Package, Sparkles } from 'lucide-react';
import { Button, cn } from './ui';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, indent }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
      indent && "pl-9",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

interface SidebarGroupProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isActive?: boolean;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({ icon: Icon, label, children, defaultOpen = false, isActive = false }) => {
  const [open, setOpen] = React.useState(defaultOpen || isActive);

  React.useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="flex-1 text-left">{label}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="mt-1 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

export type ViewMode = 'dev' | 'pm';

interface LayoutProps {
  children: React.ReactNode;
  isDark: boolean;
  toggleDark: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  compareRuns?: [string, string] | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, isDark, toggleDark, viewMode, onViewModeChange, compareRuns }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 md:relative md:translate-x-0",
          !sidebarOpen && "-translate-x-full md:hidden"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                e
              </div>
              <span className="font-bold text-lg">eBBot Testing</span>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {/* 1. EB Bundle Setup */}
            <SidebarGroup
              icon={Package}
              label="EB Bundle Setup"
              isActive={['/playground', '/history', '/churn-analysis', '/churn-report', '/results', '/evaluation-runs', '/run-comparison', '/bundle-setup-testing-guide'].includes(pathname)}
            >
              <SidebarItem icon={Play} label="Playground" active={pathname === '/playground'} onClick={() => navigate('/playground')} indent />
              <SidebarItem icon={History} label="Pipeline History" active={pathname === '/history'} onClick={() => navigate('/history')} indent />
              <SidebarItem icon={TrendingDown} label="Churn Analysis" active={pathname === '/churn-analysis'} onClick={() => navigate('/churn-analysis')} indent />
              <SidebarItem icon={FileBarChart} label="Churn Report" active={pathname === '/churn-report'} onClick={() => navigate('/churn-report')} indent />
              <SidebarItem icon={BarChart3} label="Test Results" active={pathname === '/results'} onClick={() => navigate('/results')} indent />
              <SidebarItem icon={ListChecks} label="Evaluation Runs" active={pathname === '/evaluation-runs'} onClick={() => navigate('/evaluation-runs')} indent />
              {compareRuns && (
                <SidebarItem icon={ArrowLeftRight} label="Run Comparison" active={pathname === '/run-comparison'} onClick={() => navigate('/run-comparison')} indent />
              )}
              <SidebarItem icon={BookOpen} label="Bundle Setup Guide" active={pathname === '/bundle-setup-testing-guide'} onClick={() => navigate('/bundle-setup-testing-guide')} indent />
            </SidebarGroup>

            {/* 2. Magic Bundles */}
            <SidebarGroup
              icon={Sparkles}
              label="Magic Bundles"
              isActive={['/success-metrics', '/onboarding-diagnosis', '/onboarding-history', '/store-profiling', '/onboarding-flow', '/store-profiling-faq', '/onboarding-faq'].includes(pathname)}
            >
              <SidebarItem icon={Store} label="Store Profiles" active={pathname === '/success-metrics'} onClick={() => navigate('/success-metrics')} indent />
              <SidebarItem icon={Stethoscope} label="Diagnosis" active={pathname === '/onboarding-diagnosis'} onClick={() => navigate('/onboarding-diagnosis')} indent />
              <SidebarItem icon={History} label="History" active={pathname === '/onboarding-history'} onClick={() => navigate('/onboarding-history')} indent />
              <SidebarItem icon={BookOpen} label="Store Profiling" active={pathname === '/store-profiling'} onClick={() => navigate('/store-profiling')} indent />
              <SidebarItem icon={HelpCircle} label="Store Profiling FAQ" active={pathname === '/store-profiling-faq'} onClick={() => navigate('/store-profiling-faq')} indent />
              <SidebarItem icon={Rocket} label="Onboarding Flow" active={pathname === '/onboarding-flow'} onClick={() => navigate('/onboarding-flow')} indent />
              <SidebarItem icon={MessageCircleQuestion} label="Onboarding FAQ" active={pathname === '/onboarding-faq'} onClick={() => navigate('/onboarding-faq')} indent />
            </SidebarGroup>

            {/* 4. BaaS */}
            <SidebarGroup
              icon={ShoppingCart}
              label="BaaS"
              isActive={['/baas-overview', '/run-strategy', '/baas-handoff', '/baas-faq'].includes(pathname)}
            >
              <SidebarItem icon={ShoppingCart} label="BaaS Overview" active={pathname === '/baas-overview'} onClick={() => navigate('/baas-overview')} indent />
              <SidebarItem icon={Target} label="Run Full Strategy" active={pathname === '/run-strategy'} onClick={() => navigate('/run-strategy')} indent />
              <SidebarItem icon={BookOpen} label="BaaS Handoff" active={pathname === '/baas-handoff'} onClick={() => navigate('/baas-handoff')} indent />
              <SidebarItem icon={HelpCircle} label="BaaS FAQ" active={pathname === '/baas-faq'} onClick={() => navigate('/baas-faq')} indent />
            </SidebarGroup>

          </div>

          <div className="p-4 border-t space-y-3">
            {/* View Mode Toggle */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-1">View Mode</p>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('pm')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    viewMode === 'pm'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Users className="w-4 h-4" />
                  PM
                </button>
                <button
                  onClick={() => onViewModeChange('dev')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    viewMode === 'dev'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Code className="w-4 h-4" />
                  Dev
                </button>
              </div>
            </div>

            <Button variant="outline" className="w-full justify-start space-x-2" onClick={toggleDark}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-14 border-b flex items-center px-4 bg-card">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="ml-4 font-semibold">eBBot Dashboard</span>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           <div className="max-w-7xl mx-auto space-y-8">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};

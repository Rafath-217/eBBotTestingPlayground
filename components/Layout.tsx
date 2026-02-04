import React from 'react';
import { LayoutDashboard, FileJson, Tag, ShieldCheck, BarChart3, Moon, Sun, Menu, ChevronRight, Play, Boxes, Code, Users } from 'lucide-react';
import { Button, cn } from './ui';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
      active 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

export type ViewMode = 'dev' | 'pm';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDark: boolean;
  toggleDark: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, isDark, toggleDark, viewMode, onViewModeChange }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

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
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Overview" 
              active={activeTab === 'overview'} 
              onClick={() => onTabChange('overview')} 
            />
            
            <div className="pt-4 pb-2">
              <h4 className="px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">Components</h4>
              <div className="space-y-1">
                <SidebarItem
                  icon={FileJson}
                  label="Structure LLM"
                  active={activeTab === 'structure'}
                  onClick={() => onTabChange('structure')}
                />
                <SidebarItem
                  icon={Tag}
                  label="Discount LLM"
                  active={activeTab === 'discount'}
                  onClick={() => onTabChange('discount')}
                />
                <SidebarItem
                  icon={ShieldCheck}
                  label="Rules LLM"
                  active={activeTab === 'rules'}
                  onClick={() => onTabChange('rules')}
                />
                <SidebarItem
                  icon={Boxes}
                  label="Assembly"
                  active={activeTab === 'assembly'}
                  onClick={() => onTabChange('assembly')}
                />
              </div>
            </div>

            <div className="pt-4 pb-2">
              <h4 className="px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">Analysis</h4>
              <SidebarItem
                icon={BarChart3}
                label="Test Results"
                active={activeTab === 'results'}
                onClick={() => onTabChange('results')}
              />
            </div>

            <div className="pt-4 pb-2">
              <h4 className="px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">Live Testing</h4>
              <SidebarItem
                icon={Play}
                label="Playground"
                active={activeTab === 'playground'}
                onClick={() => onTabChange('playground')}
              />
            </div>
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


import { Building2, Home, Plus, BarChart3, Settings, Users, Globe, TrendingUp } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: BarChart3,
    view: "dashboard" as const,
  },
  {
    title: "Propriedades",
    url: "#",
    icon: Building2,
    view: "properties" as const,
  },
  {
    title: "Adicionar Imóvel",
    url: "#",
    icon: Plus,
    view: "add-property" as const,
  },
];

const analyticsItems = [
  {
    title: "Relatórios",
    url: "#",
    icon: TrendingUp,
  },
  {
    title: "Portais",
    url: "#",
    icon: Globe,
  },
];

const secondaryItems = [
  {
    title: "Clientes",
    url: "#",
    icon: Users,
  },
  {
    title: "Configurações",
    url: "#",
    icon: Settings,
  },
];

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: "dashboard" | "properties" | "add-property") => void;
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-gray-800 bg-gray-900 text-white">
      <SidebarHeader className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ImobiPro
            </span>
            <span className="text-xs text-gray-400">Gestão Imobiliária</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 bg-gray-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider px-3 py-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={currentView === item.view}
                    className={`
                      text-gray-300 hover:text-white hover:bg-gray-800/70 transition-all duration-200
                      ${currentView === item.view 
                        ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-white border-l-2 border-blue-500' 
                        : ''
                      }
                    `}
                  >
                    <button 
                      onClick={() => onViewChange(item.view)}
                      className="flex items-center gap-3 w-full px-3 py-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider px-3 py-2">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-gray-800/70 transition-all duration-200">
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider px-3 py-2">
            Outros
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-gray-800/70 transition-all duration-200">
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/70 hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <span className="text-sm font-medium text-white">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-gray-400 truncate">admin@imobipro.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

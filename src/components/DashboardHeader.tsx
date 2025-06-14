
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  return (
    <header className="border-b border-gray-800/50 bg-gray-900/95 backdrop-blur-sm px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar propriedades..."
              className="w-80 pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-800/70 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
              <span className="text-white text-[10px]">3</span>
            </span>
          </Button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center ring-2 ring-blue-500/20">
            <span className="text-sm font-medium text-white">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}

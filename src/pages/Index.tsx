import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardContent } from "@/components/DashboardContent";
import { PropertyForm } from "@/components/PropertyForm";
import { PropertyList } from "@/components/PropertyList";
import { ReportsView } from "@/components/ReportsView";
import { PortalsView } from "@/components/PortalsView";
import { ClientsView } from "@/components/ClientsView";
import { AgendaView } from "@/components/AgendaView";
import { ConnectionsView } from "@/components/ConnectionsView";
import { ContractsView } from "@/components/ContractsView";

import { useProperties } from "@/hooks/useProperties";

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "properties" | "add-property" | "contracts" | "agenda" | "reports" | "portals" | "clients" | "connections">("dashboard");
  const { properties, loading, refetch } = useProperties();

  const handlePropertySubmit = () => {
    refetch();
    setCurrentView("properties");
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardContent 
          properties={properties} 
          loading={loading} 
          onNavigateToAgenda={() => setCurrentView("agenda")}
        />;
      case "properties":
        return <PropertyList properties={properties} loading={loading} onAddNew={() => setCurrentView("add-property")} refetch={refetch} />;
      case "add-property":
        return <PropertyForm onSubmit={handlePropertySubmit} onCancel={() => setCurrentView("properties")} />;
      case "contracts":
        return <ContractsView />;
      case "agenda":
        return <AgendaView />;
      case "reports":
        return <ReportsView />;
      case "portals":
        return <PortalsView />;
      case "clients":
        return <ClientsView />;
      case "connections":
        return <ConnectionsView />;
      default:
        return <DashboardContent properties={properties} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-6 bg-gradient-to-br from-gray-950/50 to-gray-900/50">
              {renderContent()}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;


import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardContent } from "@/components/DashboardContent";
import { PropertyForm } from "@/components/PropertyForm";
import { PropertyList } from "@/components/PropertyList";

export type Property = {
  id: string;
  title: string;
  type: "house" | "apartment" | "commercial" | "land";
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  state: string;
  status: "available" | "sold" | "rented";
  images: string[];
  description: string;
  createdAt: Date;
};

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "properties" | "add-property">("dashboard");
  const [properties, setProperties] = useState<Property[]>([
    {
      id: "1",
      title: "Casa Moderna em Condomínio",
      type: "house",
      price: 850000,
      area: 250,
      bedrooms: 4,
      bathrooms: 3,
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      status: "available",
      images: ["/placeholder.svg"],
      description: "Belíssima casa em condomínio fechado com área de lazer completa.",
      createdAt: new Date("2024-01-15")
    },
    {
      id: "2",
      title: "Apartamento no Centro",
      type: "apartment",
      price: 450000,
      area: 85,
      bedrooms: 2,
      bathrooms: 2,
      address: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      status: "rented",
      images: ["/placeholder.svg"],
      description: "Apartamento moderno com vista para a cidade.",
      createdAt: new Date("2024-02-10")
    },
    {
      id: "3",
      title: "Terreno Comercial",
      type: "land",
      price: 1200000,
      area: 500,
      address: "Rua Comercial, 456",
      city: "São Paulo",
      state: "SP",
      status: "available",
      images: ["/placeholder.svg"],
      description: "Excelente terreno para empreendimento comercial.",
      createdAt: new Date("2024-03-05")
    }
  ]);

  const addProperty = (property: Omit<Property, "id" | "createdAt">) => {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setProperties([...properties, newProperty]);
    setCurrentView("properties");
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardContent properties={properties} />;
      case "properties":
        return <PropertyList properties={properties} onAddNew={() => setCurrentView("add-property")} />;
      case "add-property":
        return <PropertyForm onSubmit={addProperty} onCancel={() => setCurrentView("properties")} />;
      default:
        return <DashboardContent properties={properties} />;
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

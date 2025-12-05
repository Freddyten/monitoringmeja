import Link from "next/link";
import {
  Users,
  SprayCan,
  LayoutDashboard,
  QrCode,
  Timer,
  Utensils,
  LogOut,
  CheckCircle2,
  ArrowRight,
  ChefHat,
  Info
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const portals = [
    {
      title: "Customer Area",
      href: "/customer",
      icon: Users,
      description: "Scan QR, cari meja kosong, dan reservasi tempat duduk.",
      theme: "text-blue-600",
      bg: "bg-blue-100",
      border: "hover:border-blue-500/50"
    },
    {
      title: "Staff Cleaning",
      href: "/cleaning",
      icon: SprayCan,
      description: "Dashboard operasional untuk update status kebersihan meja.",
      theme: "text-green-600",
      bg: "bg-green-100",
      border: "hover:border-green-500/50"
    },
    {
      title: "Monitoring Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Pantau utilitas dan status seluruh meja secara real-time.",
      theme: "text-purple-600",
      bg: "bg-purple-100",
      border: "hover:border-purple-500/50"
    }
  ];

  const workflow = [
    { icon: QrCode, text: "Customer scan QR code tenant" },
    { icon: Timer, text: "Pilih meja & Timer 10 menit (Menuju Meja)" },
    { icon: Utensils, text: "Tiba di meja & Timer 30 menit (Makan)" },
    { icon: LogOut, text: "Selesai makan (Status: Perlu Dibersihkan)" },
    { icon: SprayCan, text: "Staff scan QR untuk membersihkan" },
    { icon: CheckCircle2, text: "Meja siap untuk customer baru" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 rotate-3 transition-transform hover:rotate-6">
              <ChefHat className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Sistem Monitoring Meja
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              Platform manajemen meja terintegrasi untuk efisiensi operasional dan pengalaman pelanggan yang lebih baik.
            </p>
          </div>
        </div>

        {/* Portal Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <Link key={portal.href} href={portal.href} className="group">
              <Card className={`h-full transition-all duration-300 hover:shadow-lg border bg-white ${portal.border}`}>
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${portal.bg}`}>
                    <portal.icon className={`h-8 w-8 ${portal.theme}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {portal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <CardDescription className="text-slate-600 text-sm leading-relaxed">
                    {portal.description}
                  </CardDescription>
                  <Button variant="outline" className="w-full group-hover:bg-white group-hover:text-primary group-hover:border-primary/50 transition-all">
                    Akses Halaman <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Workflow Section - Redesigned to Light Theme */}
        <Card className="bg-white border shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50 pb-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-white text-primary border-primary/20 px-3 py-1">
                <Info className="w-3 h-3 mr-1" /> Info Sistem
              </Badge>
            </div>
            <CardTitle className="text-2xl text-slate-900">Alur Kerja Sistem</CardTitle>
            <CardDescription className="text-slate-500">
              Visualisasi aliran data dari reservasi pelanggan hingga proses pembersihan meja.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-8">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {workflow.map((step, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-200 hover:bg-white hover:shadow-md hover:border-slate-200"
                >
                  <div className="mt-1 h-10 w-10 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-primary shadow-sm shrink-0">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Langkah {index + 1}
                    </p>
                    <p className="text-sm font-medium text-slate-700 leading-snug">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pb-8 text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} RestoApp Management System. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
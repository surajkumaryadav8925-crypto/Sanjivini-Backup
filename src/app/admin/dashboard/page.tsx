"use client";

import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Building2, Bed, Users, Droplet, AlertTriangle, TrendingUp, MapPin } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Hospitals", value: "245", change: "+12", color: "text-blue-600", icon: Building2 },
    { label: "Available Beds", value: "4,521", change: "+234", color: "text-emerald-600", icon: Bed },
    { label: "Users", value: "125K", change: "+5.2K", color: "text-purple-600", icon: Users },
    { label: "Blood Units", value: "12,456", change: "-234", color: "text-rose-600", icon: Droplet },
  ];

  const alerts = [
    { district: "Delhi NCR", alert: "Dengue cases increasing", severity: "high", count: 234 },
    { district: "Mumbai", alert: "Flu outbreak in schools", severity: "medium", count: 156 },
  ];

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Government Health Dashboard</h1>
        <p className="text-muted-foreground">Monitoring healthcare infrastructure across India</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Badge variant="info">Real-time Data</Badge>
        <Badge variant="secondary">Last Updated: Just now</Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" />{stat.change}</p>
                </div>
                <stat.icon className={`h-10 w-10 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />District Health Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${alert.severity === "high" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${alert.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
                    <div><p className="font-medium">{alert.district}</p><p className="text-sm text-muted-foreground">{alert.alert}</p></div>
                  </div>
                  <div className="text-right"><p className="font-bold">{alert.count}</p><p className="text-xs text-muted-foreground">cases</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Disease Trends</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><div className="flex justify-between text-sm mb-1"><span>Dengue</span><span className="text-red-600">↑ 45%</span></div><div className="h-2 bg-muted rounded-full"><div className="h-2 bg-red-500 rounded-full" style={{ width: "65%" }} /></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Flu</span><span className="text-amber-600">↑ 23%</span></div><div className="h-2 bg-muted rounded-full"><div className="h-2 bg-amber-500 rounded-full" style={{ width: "45%" }} /></div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Top Hospitals</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Hospital</th><th className="text-right py-2">Beds</th><th className="text-right py-2">ICU</th><th className="text-right py-2">Actions</th></tr></thead>
            <tbody>
              <tr className="border-b"><td className="py-3">AIIMS Delhi</td><td className="text-right">2,500</td><td className="text-right">200</td><td className="text-right"><Button variant="ghost" size="sm">View</Button></td></tr>
              <tr className="border-b"><td className="py-3">PGIMER Chandigarh</td><td className="text-right">1,800</td><td className="text-right">150</td><td className="text-right"><Button variant="ghost" size="sm">View</Button></td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Building2, Bed, Users, Droplet, AlertTriangle, TrendingUp, MapPin, Activity, AlertCircle, Phone, Truck, Package, Wind, Droplets } from "lucide-react";
import { useState } from "react";

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

  // India Health Status Map Data
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const regionData = [
    { state: "Rajasthan", status: "healthy", cases: 1234, beds: 4500 },
    { state: "Maharashtra", status: "warning", cases: 4567, beds: 3200 },
    { state: "Delhi", status: "critical", cases: 7890, beds: 1200 },
    { state: "Karnataka", status: "healthy", cases: 2345, beds: 5100 },
    { state: "Tamil Nadu", status: "healthy", cases: 1987, beds: 4800 },
    { state: "Gujarat", status: "warning", cases: 3456, beds: 2800 },
    { state: "UP", status: "critical", cases: 8901, beds: 1500 },
    { state: "West Bengal", status: "warning", cases: 2876, beds: 2100 },
    { state: "Kerala", status: "healthy", cases: 1567, beds: 3900 },
    { state: "Punjab", status: "healthy", cases: 987, beds: 2900 },
    { state: "Haryana", status: "moderate", cases: 2134, beds: 2400 },
    { state: "MP", status: "warning", cases: 3234, beds: 1900 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-emerald-500";
      case "moderate": return "bg-amber-400";
      case "warning": return "bg-orange-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "healthy": return "Healthy";
      case "moderate": return "Moderate";
      case "warning": return "Warning";
      case "critical": return "Critical";
      default: return "Unknown";
    }
  };

  // Critical Resource Shortage Monitoring
  const resourceShortages = [
    { resource: "ICU Beds", available: 1245, required: 2300, shortage: 1055, severity: "critical", icon: Bed },
    { resource: "Ventilators", available: 890, required: 1500, shortage: 610, severity: "critical", icon: Wind },
    { resource: "Oxygen Cylinders", available: 3420, required: 4500, shortage: 1080, severity: "high", icon: Droplets },
    { resource: "Remdesivir", available: 5600, required: 8000, shortage: 2400, severity: "high", icon: Package },
    { resource: "Favipiravir", available: 7800, required: 8500, shortage: 700, severity: "medium", icon: Package },
    { resource: "N95 Masks", available: 45000, required: 60000, shortage: 15000, severity: "medium", icon: Package },
    { resource: "PPE Kits", available: 23000, required: 35000, shortage: 12000, severity: "high", icon: Package },
    { resource: "Test Kits", available: 125000, required: 180000, shortage: 55000, severity: "medium", icon: Package },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-amber-600 bg-amber-50 border-amber-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "high": return <Badge className="bg-orange-100 text-orange-700 border-orange-300">High</Badge>;
      case "medium": return <Badge variant="secondary">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  // Emergency Response Monitoring
  const emergencyResponses = [
    { id: "ER-001", type: "Disease Outbreak", location: "Delhi NCR", status: "active", responders: 45, patients: 234, eta: "On Scene" },
    { id: "ER-002", type: "Accident", location: "Mumbai Highway", status: "dispatched", responders: 12, patients: 8, eta: "8 min" },
    { id: "ER-003", type: "Flood Relief", location: "Kerala District", status: "en-route", responders: 120, patients: 567, eta: "25 min" },
    { id: "ER-004", type: "Fire Emergency", location: "Chennai", status: "resolved", responders: 35, patients: 12, eta: "Completed" },
    { id: "ER-005", type: "Earthquake Relief", location: "Gujarat", status: "active", responders: 200, patients: 890, eta: "On Scene" },
  ];

  const getEmergencyStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-500 animate-pulse";
      case "dispatched": return "bg-orange-500";
      case "en-route": return "bg-amber-500";
      case "resolved": return "bg-emerald-500";
      default: return "bg-gray-400";
    }
  };

  const getEmergencyStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "dispatched": return "Dispatched";
      case "en-route": return "En Route";
      case "resolved": return "Resolved";
      default: return "Unknown";
    }
  };

  const emergencyStats = {
    active: emergencyResponses.filter(e => e.status === "active").length,
    dispatched: emergencyResponses.filter(e => e.status === "dispatched").length,
    totalToday: 127,
    resolvedToday: 89,
    avgResponseTime: "12 min",
  };

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
            <div><div className="flex justify-between text-sm mb-1"><span>Dengue</span><span className="text-red-600">? 45%</span></div><div className="h-2 bg-muted rounded-full"><div className="h-2 bg-red-500 rounded-full" style={{ width: "65%" }} /></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Flu</span><span className="text-amber-600">? 23%</span></div><div className="h-2 bg-muted rounded-full"><div className="h-2 bg-amber-500 rounded-full" style={{ width: "45%" }} /></div></div>
          </CardContent>
        </Card>
      </div>

      {/* ========== NEW FEATURE 1: INDIA HEALTH STATUS MAP ========== */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            India Health Status Map
            <Badge variant="info" className="ml-2">12 States</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500"></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-400"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span>Critical</span>
            </div>
          </div>

          {/* State Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {regionData.map((region) => (
              <div
                key={region.state}
                onClick={() => setSelectedRegion(selectedRegion === region.state ? null : region.state)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                  selectedRegion === region.state 
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-200" 
                    : "border-transparent hover:border-gray-300"
                } ${getStatusColor(region.status)} bg-opacity-20`}
              >
                <p className="font-medium text-sm truncate">{region.state}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(region.status)}`}></div>
                  <span className="text-xs opacity-80">{getStatusLabel(region.status)}</span>
                </div>
                <p className="text-xs mt-1 opacity-70">{region.cases.toLocaleString()} cases</p>
              </div>
            ))}
          </div>

          {/* Selected Region Details */}
          {selectedRegion && (
            <div className="mt-4 p-4 bg-muted rounded-lg border">
              {(() => {
                const selected = regionData.find(r => r.state === selectedRegion);
                return selected ? (
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Active Cases</p>
                      <p className="text-2xl font-bold text-red-600">{selected.cases.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Available Beds</p>
                      <p className="text-2xl font-bold text-emerald-600">{selected.beds.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Bed Occupancy</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {Math.round((selected.cases / (selected.cases + selected.beds)) * 100)}%
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========== NEW FEATURE 2: CRITICAL RESOURCE SHORTAGE MONITORING ========== */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Critical Resource Shortage Monitoring
            <Badge variant="destructive" className="ml-2">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Resource Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-muted-foreground">Critical Items</p>
              <p className="text-2xl font-bold text-red-600">
                {resourceShortages.filter(r => r.severity === "critical").length}
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">
                {resourceShortages.filter(r => r.severity === "high").length}
              </p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-muted-foreground">Total Shortage</p>
              <p className="text-2xl font-bold text-amber-600">
                {resourceShortages.reduce((acc, r) => acc + r.shortage, 0).toLocaleString("en-US")}
              </p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Available</p>
              <p className="text-2xl font-bold">
                {resourceShortages.reduce((acc, r) => acc + r.available, 0).toLocaleString("en-US")}
              </p>
            </div>
          </div>

          {/* Resource List */}
          <div className="space-y-3">
            {resourceShortages.map((item) => (
              <div
                key={item.resource}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(item.severity)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{item.resource}</p>
                      <p className="text-sm text-muted-foreground">
                        Available: {item.available.toLocaleString()} / Required: {item.required.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">-{item.shortage.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">shortage</p>
                    </div>
                    {getSeverityBadge(item.severity)}
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.severity === "critical" ? "bg-red-500" :
                      item.severity === "high" ? "bg-orange-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${(item.available / item.required) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((item.available / item.required) * 100)}% of required stock
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========== NEW FEATURE 3: EMERGENCY RESPONSE MONITORING ========== */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-orange-500" />
            Emergency Response Monitoring
            <Badge variant="destructive" className="ml-2">Real-time</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Emergency Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-red-600">{emergencyStats.active}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-muted-foreground">Dispatched</p>
              <p className="text-2xl font-bold text-orange-600">{emergencyStats.dispatched}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Today</p>
              <p className="text-2xl font-bold">{emergencyStats.totalToday}</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-emerald-600">{emergencyStats.resolvedToday}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Response</p>
              <p className="text-2xl font-bold">{emergencyStats.avgResponseTime}</p>
            </div>
          </div>

          {/* Emergency Response Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">ID</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Location</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-right py-3 px-2">Responders</th>
                  <th className="text-right py-3 px-2">Patients</th>
                  <th className="text-right py-3 px-2">ETA</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emergencyResponses.map((response) => (
                  <tr key={response.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 font-mono text-xs">{response.id}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {response.type}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {response.location}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getEmergencyStatusColor(response.status)}`}></div>
                        <span className="text-sm">{getEmergencyStatusLabel(response.status)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {response.responders}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{response.patients}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{response.eta}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-1">
                        {response.status !== "resolved" && (
                          <>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-2">
                              <Truck className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 px-2">View</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="destructive" size="sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Declare Emergency
            </Button>
            <Button variant="default" size="sm">
              <Truck className="h-4 w-4 mr-1" />
              Dispatch Team
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" />
              Contact Control Room
            </Button>
          </div>
        </CardContent>
      </Card>

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

"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { getContainerMargins } from "@/lib/utils";

// Simulasi data yang nantinya akan dari API
const initialDashboardData = {
  stats: {
    totalContent: 2847,
    engagementRate: "156%",
    totalReach: "24.5K",
    newFollowers: 3247,
    conversionRate: "4.2%",
  },
  recentContent: [
    {
      id: "1",
      title: "Promo Valentine Special - Bunga Mawar Premium",
      platform: "Instagram",
      status: "Published",
      engagement: "2.4K likes, 89 comments",
      thumbnail:
        "https://images.pexels.com/photos/1029622/pexels-photo-1029622.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: "2",
      title: "Tips Merawat Bunga Segar di Rumah",
      platform: "Facebook",
      status: "Scheduled",
      engagement: "Posting pada 14:00",
      thumbnail:
        "https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: "3",
      title: "Behind The Scene - Proses Penataan Buket",
      platform: "TikTok",
      status: "Processing",
      engagement: "AI sedang generate video",
      thumbnail:
        "https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ],
  insights: [
    {
      type: "trending",
      icon: "⚡",
      title: "Trending Topic",
      message: "#BungaValentine sedang trending. Buat konten sekarang!",
      color: "blue",
    },
    {
      type: "timing",
      icon: "📅",
      title: "Optimal Posting Time",
      message: "Audience paling aktif pada 14:00-16:00 hari ini",
      color: "green",
    },
    {
      type: "advertising",
      icon: "🎯",
      title: "Ad Opportunity",
      message: "Konten 'Promo Valentine' cocok untuk boosting ads",
      color: "orange",
    },
  ],
};

export default function DynamicDashboard() {
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [totalContent, setTotalContent] = useState("");

  // Simulasi update data real-time
  const refreshData = () => {
    setIsLoading(true);

    // Simulasi API call
    setTimeout(() => {
      setDashboardData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalContent:
            prev.stats.totalContent + Math.floor(Math.random() * 10),
          engagementRate: `${(
            parseFloat(prev.stats.engagementRate) +
            Math.random() * 5
          ).toFixed(1)}%`,
          newFollowers:
            prev.stats.newFollowers + Math.floor(Math.random() * 50),
        },
      }));
      setTotalContent((prev) =>
        (parseInt(prev) + Math.floor(Math.random() * 10)).toLocaleString(
          "id-ID"
        )
      );
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInsightColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200";
      case "green":
        return "bg-green-50 border-green-200";
      case "orange":
        return "bg-orange-50 border-orange-200";
      case "purple":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <section id="dashboard" className="py-20 bg-white">
      <div className={getContainerMargins()}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Dashboard yang{" "}
              <span className="text-blue-600">Powerful & Real-time</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kelola seluruh marketing campaign Anda dari satu dashboard yang
              mudah dipahami dan selalu terupdate
            </p>
            <Button
              onClick={refreshData}
              disabled={isLoading}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Data
            </Button>
          </div>

          {/* Dashboard Mockup */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
            {/* Browser Header */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
              <div className="ml-4 text-gray-400 text-sm">
                dashboard.postmatic.id
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Dashboard POSTMATIC</h3>
                    <p className="text-blue-100">
                      Selamat datang, Toko Bunga Mawar
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-100">
                      Total Konten Bulan Ini
                    </div>
                    <div className="text-3xl font-bold transition-all duration-500">
                      {totalContent}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600 transition-all duration-500">
                          {dashboardData.stats.engagementRate}
                        </div>
                        <div className="text-sm text-gray-600">
                          Engagement Rate
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {dashboardData.stats.totalReach}
                        </div>
                        <div className="text-sm text-gray-600">Total Reach</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600 transition-all duration-500">
                          {dashboardData.stats.newFollowers.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          New Followers
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {dashboardData.stats.conversionRate}
                        </div>
                        <div className="text-sm text-gray-600">
                          Conversion Rate
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Recent Content */}
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Konten Terbaru Generated
                    </h4>
                    <div className="space-y-4">
                      {dashboardData.recentContent.map((content) => (
                        <div
                          key={content.id}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start space-x-4">
                            <Image
                              width={64}
                              height={64}
                              src={content.thumbnail}
                              alt={content.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-medium text-gray-900 mb-1">
                                    {content.title}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {content.platform} • {content.engagement}
                                  </div>
                                </div>
                                <Badge
                                  className={`${getStatusColor(
                                    content.status
                                  )} text-xs`}
                                >
                                  {content.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      AI Insights & Rekomendasi
                    </h4>
                    <div className="space-y-4">
                      {dashboardData.insights.map((insight, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${getInsightColor(
                            insight.color
                          )} hover:shadow-md transition-shadow`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-xl">{insight.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 mb-1">
                                {insight.title}
                              </div>
                              <div className="text-sm text-gray-600">
                                {insight.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Analytics
              </h3>
              <p className="text-gray-600">
                Monitor performa konten secara real-time dengan insights
                mendalam yang terupdate otomatis
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Recommendations
              </h3>
              <p className="text-gray-600">
                Dapatkan saran cerdas dari AI untuk mengoptimalkan strategy
                marketing berdasarkan data terkini
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smart Automation
              </h3>
              <p className="text-gray-600">
                Kelola jadwal posting dengan calendar view yang intuitif dan
                otomasi yang cerdas
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

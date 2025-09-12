import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { getContainerMargins } from "@/lib/utils";

export default function DashboardPreview() {
  const TOTAL_CONTENT = 2847;

  function formatNumber(num: number) {
    // Always use Indonesian locale for consistency
    return new Intl.NumberFormat("id-ID").format(num);
  }
  return (
    <section id="dashboard" className="py-20 bg-white">
      <div className={getContainerMargins()}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Dashboard yang{" "}
              <span className="text-blue-600">Powerful & Intuitive</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kelola seluruh marketing campaign Anda dari satu dashboard yang
              mudah dipahami
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
            {/* Browser Header */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
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
                    <div className="text-3xl font-bold">
                      {" "}
                      {formatNumber(TOTAL_CONTENT)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          156%
                        </div>
                        <div className="text-sm text-gray-600">
                          Engagement Rate
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          24.5K
                        </div>
                        <div className="text-sm text-gray-600">Total Reach</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          3,247
                        </div>
                        <div className="text-sm text-gray-600">
                          New Followers
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          4.2%
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
                      {[
                        {
                          title:
                            "Promo Valentine Special - Bunga Mawar Premium",
                          platform: "Instagram",
                          status: "Published",
                          engagement: "2.4K likes, 89 comments",
                        },
                        {
                          title: "Tips Merawat Bunga Segar di Rumah",
                          platform: "Facebook",
                          status: "Scheduled",
                          engagement: "Posting pada 14:00",
                        },
                        {
                          title: "Behind The Scene - Proses Penataan Buket",
                          platform: "TikTok",
                          status: "Processing",
                          engagement: "AI sedang generate video",
                        },
                      ].map((content, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {content.title}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {content.platform} • {content.engagement}
                              </div>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                content.status === "Published"
                                  ? "bg-green-100 text-green-800"
                                  : content.status === "Scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {content.status}
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
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-blue-900">
                              Trending Topic
                            </div>
                            <div className="text-sm text-blue-700">
                              #BungaValentine sedang trending. Buat konten
                              sekarang!
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start space-x-3">
                          <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-green-900">
                              Optimal Posting Time
                            </div>
                            <div className="text-sm text-green-700">
                              Audience paling aktif pada 14:00-16:00 hari ini
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-start space-x-3">
                          <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-orange-900">
                              Ad Opportunity
                            </div>
                            <div className="text-sm text-orange-700">
                              Konten &quot;Promo Valentine&quot; cocok untuk
                              boosting ads
                            </div>
                          </div>
                        </div>
                      </div>
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
                mendalam
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
                marketing
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Content Calendar
              </h3>
              <p className="text-gray-600">
                Kelola jadwal posting dengan calendar view yang intuitif
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

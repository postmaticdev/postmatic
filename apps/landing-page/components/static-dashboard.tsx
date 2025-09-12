import { getContainerMargins } from "@/lib/utils";

export default function StaticDashboard() {
  return (
    <section id="dashboard" className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
                    <div className="text-3xl font-bold">2.847</div>
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
                        {/* BarChart3 icon */}
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 3v18h18M7 12h4v6H7zM15 8h4v10h-4zM11 5h4v13h-4z" />
                        </svg>
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
                        {/* TrendingUp icon */}
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M22 12l-4-4L12 16l-3-3-7 7" />
                        </svg>
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
                        {/* Users icon */}
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          3.247
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
                        {/* Target icon */}
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
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
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start space-x-4">
                          {/* <Image
                            src="https://images.pexels.com/photos/1029622/pexels-photo-1029622.jpeg?auto=compress&cs=tinysrgb&w=400"
                            alt="Promo Valentine"
                            className="w-16 h-16 rounded-lg object-cover"
                          /> */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-gray-900 mb-1">
                                  Promo Valentine Special - Bunga Mawar Premium
                                </div>
                                <div className="text-sm text-gray-600">
                                  Instagram • 2.4K likes, 89 comments
                                </div>
                              </div>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Published
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start space-x-4">
                          {/* <Image
                            src="https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg?auto=compress&cs=tinysrgb&w=400"
                            alt="Tips Merawat Bunga"
                            className="w-16 h-16 rounded-lg object-cover"
                          /> */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-gray-900 mb-1">
                                  Tips Merawat Bunga Segar di Rumah
                                </div>
                                <div className="text-sm text-gray-600">
                                  Facebook • Posting pada 14:00
                                </div>
                              </div>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                Scheduled
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start space-x-4">
                          {/* <Image
                            src="https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=400"
                            alt="Behind The Scene"
                            className="w-16 h-16 rounded-lg object-cover"
                          /> */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-gray-900 mb-1">
                                  Behind The Scene - Proses Penataan Buket
                                </div>
                                <div className="text-sm text-gray-600">
                                  TikTok • AI sedang generate video
                                </div>
                              </div>
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                Processing
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      AI Insights & Rekomendasi
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">⚡</span>
                          <div>
                            <div className="font-medium text-gray-900 mb-1">
                              Trending Topic
                            </div>
                            <div className="text-sm text-gray-600">
                              #BungaValentine sedang trending. Buat konten
                              sekarang!
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">📅</span>
                          <div>
                            <div className="font-medium text-gray-900 mb-1">
                              Optimal Posting Time
                            </div>
                            <div className="text-sm text-gray-600">
                              Audience paling aktif pada 14:00-16:00 hari ini
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">🎯</span>
                          <div>
                            <div className="font-medium text-gray-900 mb-1">
                              Ad Opportunity
                            </div>
                            <div className="text-sm text-gray-600">
                              Konten &#39;Promo Valentine&#39; cocok untuk boosting ads
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
                {/* BarChart3 icon */}
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3v18h18M7 12h4v6H7zM15 8h4v10h-4zM11 5h4v13h-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Analytics
              </h3>
              <p className="text-gray-600">
                Monitor performa konten secara real-time dengan insights mendalam
                yang terupdate otomatis
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {/* Zap icon */}
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
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
                {/* Calendar icon */}
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
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
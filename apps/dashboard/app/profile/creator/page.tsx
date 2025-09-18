"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadPhoto } from "@/components/forms/upload-photo";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  ShoppingCart,
  Coins,
  Receipt,
  Search,
  MoreHorizontal,
  Plus,
  X,
  DollarSign,
  CreditCard,
  ArrowRight,
} from "lucide-react";

interface DesignTemplate {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface Keyword {
  id: string;
  text: string;
}

interface FormData {
  designName: string;
  keywords: Keyword[];
  category: string;
  price: string;
  designFile: string | null;
}

export default function CreatorPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [formData, setFormData] = useState<FormData>({
    designName: "",
    keywords: [],
    category: "",
    price: "",
    designFile: null,
  });

  // Sample data for design templates
  const templates: DesignTemplate[] = Array.from({ length: 10 }, (_, i) => ({
    id: `template-${i + 1}`,
    name: "Template 1",
    price: 30000,
    image: "/images/hasan.jpg", // Using existing image
  }));

  const addKeyword = () => {
    if (
      newKeyword.trim() &&
      !formData.keywords.find((k) => k.text === newKeyword.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [
          ...prev.keywords,
          { id: Date.now().toString(), text: newKeyword.trim() },
        ],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k.id !== id),
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    setIsDialogOpen(false);
    // Reset form
    setFormData({
      designName: "",
      keywords: [],
      category: "",
      price: "",
      designFile: null,
    });
  };

  const affiliatorData = [
    {
      name: "Hasan Rama",
      email: "hayhasan.project@gmail.com",
      status: "Active",
      code: "HXSNX221",
      totalSpend: "Rp 1.200.000",
      totalCommissions: "Rp 120.000",
      paidDate: "12/12/2025",
    },
    {
      name: "Hasan Rama",
      email: "hayhasan.project@gmail.com",
      status: "Active",
      code: "HXSNX221",
      totalSpend: "Rp 1.200.000",
      totalCommissions: "Rp 120.000",
      paidDate: "12/12/2025",
    },
    {
      name: "Hasan Rama",
      email: "hayhasan.project@gmail.com",
      status: "Active",
      code: "HXSNX221",
      totalSpend: "Rp 1.200.000",
      totalCommissions: "Rp 120.000",
      paidDate: "12/12/2025",
    },
    {
      name: "Hasan Rama",
      email: "hayhasan.project@gmail.com",
      status: "Active",
      code: "HXSNX221",
      totalSpend: "Rp 1.200.000",
      totalCommissions: "Rp 120.000",
      paidDate: "12/12/2025",
    },
    {
      name: "Hasan Rama",
      email: "hayhasan.project@gmail.com",
      status: "Active",
      code: "HXSNX221",
      totalSpend: "Rp 1.200.000",
      totalCommissions: "Rp 120.000",
      paidDate: "12/12/2025",
    },
  ];
  return null;
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Selamat datang kembali, Hayhasan
            </h1>
            <p className="text-gray-500 text-sm">
              Kelola desain Anda dan pantau pendapatan Anda
            </p>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              ID Kreator
            </p>
            <p className="text-lg font-semibold text-gray-900">HXSNX221</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Total Desain
                  </p>
                  <p className="text-3xl font-bold text-gray-900">1,045</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">
                      +30%
                    </span>
                    <span className="text-sm text-gray-500">vs tahun lalu</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Total Pesanan
                  </p>
                  <p className="text-3xl font-bold text-gray-900">903</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">
                      +30%
                    </span>
                    <span className="text-sm text-gray-500">vs tahun lalu</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Total Pendapatan
                  </p>
                  <p className="text-3xl font-bold text-gray-900">Rp 2.56B</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">
                      +30%
                    </span>
                    <span className="text-sm text-gray-500">vs tahun lalu</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Coins className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Total Komisi
                  </p>
                  <p className="text-3xl font-bold text-gray-900">Rp 256M</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">
                      +30%
                    </span>
                    <span className="text-sm text-gray-500">vs tahun lalu</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Receipt className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creator Design Information */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Portofolio Desain
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Kelola template desain dan kreasi Anda
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm px-6 py-2.5 rounded-lg font-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Desain
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Buat Desain Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 p-6">
                    {/* Upload Design */}
                    <UploadPhoto
                      label="Unggah Desain"
                      onImageChange={(file: string | null) =>
                        setFormData((prev) => ({ ...prev, designFile: file }))
                      }
                    />

                    {/* Design Name */}
                    <div className="space-y-2">
                      <Label htmlFor="designName">Nama Desain</Label>
                      <Input
                        id="designName"
                        value={formData.designName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            designName: e.target.value,
                          }))
                        }
                        placeholder="Masukkan nama desain"
                      />
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                      <Label>Kata Kunci</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Tambah kata kunci"
                          onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                        />
                        <Button type="button" onClick={addKeyword} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.keywords.map((keyword) => (
                          <Badge
                            key={keyword.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {keyword.text}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeKeyword(keyword.id)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="logo">Logo</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="poster">Poster</SelectItem>
                          <SelectItem value="flyer">Flyer</SelectItem>
                          <SelectItem value="business-card">
                            Kartu Nama
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor="price">Harga</Label>
                      <Input
                        id="price"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="Masukkan harga"
                        type="number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Buat Desain
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative mt-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari desain, template, atau kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="group cursor-pointer">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 group-hover:border-gray-300 transition-all duration-200 group-hover:shadow-md">
                    <Image
                      src="/hasan.jpg"
                      alt={template.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="font-medium text-sm text-gray-900">
                      {template.name}
                    </p>
                    <p className="text-blue-600 font-semibold text-sm">
                      Rp {template.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
              >
                <span className="text-gray-500">‹</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                3
              </Button>
              <span className="text-gray-400 px-2">...</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                29
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
              >
                <span className="text-gray-500">›</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Affiliator Management */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Manajemen Afiliator
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Kelola dan pantau mitra afiliasi Anda (5 pengguna aktif)
                </p>
              </div>
              <Select defaultValue="all-status">
                <SelectTrigger className="w-40 rounded-lg border-gray-200">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative mt-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama, email, atau kode referral..."
                className="pl-12 py-3 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total Pengeluaran
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Komisi
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tanggal Dibayar
                    </th>
                    <th className="pb-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {affiliatorData.map((affiliator, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      <td className="py-4 font-medium text-gray-900">
                        {affiliator.name}
                      </td>
                      <td className="py-4 text-gray-600">{affiliator.email}</td>
                      <td className="py-4">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-1 rounded-full">
                          {affiliator.status}
                        </Badge>
                      </td>
                      <td className="py-4 font-mono text-sm font-medium text-gray-900">
                        {affiliator.code}
                      </td>
                      <td className="py-4 font-medium text-gray-900">
                        {affiliator.totalSpend}
                      </td>
                      <td className="py-4 font-medium text-gray-900">
                        {affiliator.totalCommissions}
                      </td>
                      <td className="py-4 text-gray-600">
                        {affiliator.paidDate}
                      </td>
                      <td className="py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
              >
                <span className="text-gray-500">‹</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                3
              </Button>
              <span className="text-gray-400 px-2">...</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                29
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
              >
                <span className="text-gray-500">›</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Center Sidebar */}
      <div className="w-80 p-6 bg-gray-50/30 border-l border-gray-200">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Withdrawal Center
                </CardTitle>
                <p className="text-sm text-gray-500">Manage your earnings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  Rp 100.000.000
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Available for withdrawal
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Under Review
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  Rp 156.000.000
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Processing time: 7 working days
                </p>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium shadow-sm">
              Request Withdrawal
            </Button>

            <div>
              <div className="mb-4">
                <p className="font-semibold text-gray-900 mb-1">
                  Withdrawal History
                </p>
                <p className="text-sm text-gray-500">
                  Track your withdrawal requests and transactions
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors duration-150 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-100 rounded-lg">
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Completed
                        </p>
                        <p className="text-xs text-gray-600">Rp 1.000.000</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          GoPlay ****5678
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">11/29/2024</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors duration-150 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-amber-100 rounded-lg">
                        <CreditCard className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Under Review
                        </p>
                        <p className="text-xs text-gray-600">Rp 3.200.000</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Mandiri ****9012
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">12/19/2024</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

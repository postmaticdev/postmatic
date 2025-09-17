// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Search, Users, TrendingUp, Package, DollarSign, Download, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

// export default function AffiliatorPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("All Status");
//   const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
//   const [withdrawalForm, setWithdrawalForm] = useState({
//     recipientName: "",
//     bankName: "",
//     accountNumber: "",
//     phoneNumber: "",
//     amount: "",
//     withdrawalMethod: "bank"
//   });

//   // Sample data for affiliators
//   const affiliators = [
//     {
//       name: "Hasan Rama asu ruwet",
//       email: "hayhasan.project@gmail.com",
//       status: "Active",
//       code: "HXSNX221",
//       totalSpend: "Rp 1.200.000",
//       totalCommissions: "Rp 120.000",
//       paidDate: "12/12/2025"
//     },
//     {
//       name: "Hasan Rama",
//       email: "hayhasan.project@gmail.com", 
//       status: "Active",
//       code: "HXSNX221",
//       totalSpend: "Rp 1.200.000",
//       totalCommissions: "Rp 120.000",
//       paidDate: "12/12/2025"
//     },
//     {
//       name: "Hasan Rama",
//       email: "hayhasan.project@gmail.com",
//       status: "Active", 
//       code: "HXSNX221",
//       totalSpend: "Rp 1.200.000",
//       totalCommissions: "Rp 120.000",
//       paidDate: "12/12/2025"
//     },
//     {
//       name: "Hasan Rama",
//       email: "hayhasan.project@gmail.com",
//       status: "Active",
//       code: "HXSNX221", 
//       totalSpend: "Rp 1.200.000",
//       totalCommissions: "Rp 120.000",
//       paidDate: "12/12/2025"
//     },
//     {
//       name: "Hasan Rama",
//       email: "hayhasan.project@gmail.com",
//       status: "Active",
//       code: "HXSNX221",
//       totalSpend: "Rp 1.200.000", 
//       totalCommissions: "Rp 120.000",
//       paidDate: "12/12/2025"
//     }
//   ];

//   const withdrawalHistory = [
//     {
//       id: "WON012",
//       status: "Completed",
//       amount: "Rp 1.000.000",
//       method: "GoPay ****5678",
//       completedDate: "11/10/2024"
//     },
//     {
//       id: "WON013", 
//       status: "Pending",
//       amount: "Rp 3.200.000",
//       method: "Mandiri ****9012",
//       processingNote: "Your withdrawal is being processed. You will receive a notification once it's completed."
//     }
//   ];

//   const bankOptions = [
//     "Bank Mandiri",
//     "Bank BCA", 
//     "Bank BNI",
//     "Bank BRI",
//     "Bank CIMB Niaga",
//     "Bank Danamon",
//     "Bank Permata",
//     "Bank OCBC NISP",
//     "GoPay",
//     "OVO",
//     "DANA",
//     "ShopeePay"
//   ];

//   const handleWithdrawalSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle withdrawal submission here
//     console.log("Withdrawal form data:", withdrawalForm);
//     setIsWithdrawalDialogOpen(false);
//     // Reset form
//     setWithdrawalForm({
//       recipientName: "",
//       bankName: "",
//       accountNumber: "",
//       phoneNumber: "",
//       amount: "",
//       withdrawalMethod: "bank"
//     });
//   };

//   const handleFormChange = (field: string, value: string) => {
//     setWithdrawalForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   return null;
//   return (
//     <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Welcome Section */}
//         <Card className="bg-white border-0 shadow-sm">
//           <CardContent className="p-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 mb-1">
//                   Selamat datang kembali, Hayhasan
//                 </h1>
//                 <p className="text-gray-600">Anda harus memilih bisnis Anda terlebih dahulu.</p>
//               </div>
//               <div className="text-right">
//                 <div className="text-2xl font-bold text-gray-900">HXSNX221</div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Overview Stats */}
//         <Card className="bg-white border-0 shadow-sm">
//           <CardContent className="p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-6">Ringkasan</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {/* Total Invitations */}
//               <div className="flex items-start space-x-4">
//                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                   <Users className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-600 text-sm mb-1">Total Undangan</p>
//                   <p className="text-2xl font-bold text-gray-900 mb-1">1045</p>
//                   <div className="flex items-center">
//                     <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
//                     <span className="text-green-500 text-sm font-medium">30%</span>
//                     <span className="text-gray-500 text-sm ml-2">Naik dari tahun lalu</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Total Conversions */}
//               <div className="flex items-start space-x-4">
//                 <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6 text-red-600" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-600 text-sm mb-1">Total Konversi</p>
//                   <p className="text-2xl font-bold text-gray-900 mb-1">903</p>
//                   <div className="flex items-center">
//                     <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
//                     <span className="text-green-500 text-sm font-medium">30%</span>
//                     <span className="text-gray-500 text-sm ml-2">Naik dari tahun lalu</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Total Order */}
//               <div className="flex items-start space-x-4">
//                 <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                   <Package className="w-6 h-6 text-yellow-600" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-600 text-sm mb-1">Total Pesanan</p>
//                   <p className="text-2xl font-bold text-gray-900 mb-1">Rp 2.56 Milyar</p>
//                   <div className="flex items-center">
//                     <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
//                     <span className="text-green-500 text-sm font-medium">30%</span>
//                     <span className="text-gray-500 text-sm ml-2">Naik dari tahun lalu</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Total Commission */}
//               <div className="flex items-start space-x-4">
//                 <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                   <DollarSign className="w-6 h-6 text-yellow-600" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-gray-600 text-sm mb-1">Total Komisi</p>
//                   <p className="text-2xl font-bold text-gray-900 mb-1">Rp 256 Juta</p>
//                   <div className="flex items-center">
//                     <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
//                     <span className="text-green-500 text-sm font-medium">30%</span>
//                     <span className="text-gray-500 text-sm ml-2">Naik dari tahun lalu</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Affiliator Management */}
//           <div className="lg:col-span-2">
//             <Card className="bg-white border-0 shadow-sm">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900">Manajemen Afiliator</h3>
//                     <p className="text-sm text-gray-600">Cari dan filter pengguna sistem (8 pengguna)</p>
//                   </div>
//                 </div>

//                 {/* Search and Filter */}
//                 <div className="flex items-center space-x-4 mb-6">
//                   <div className="relative flex-1">
//                     <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <Input
//                       placeholder="Cari berdasarkan nama atau email"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="pl-10"
//                     />
//                   </div>
//                   <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                     <SelectTrigger className="w-32">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="All Status">Semua Status</SelectItem>
//                       <SelectItem value="Active">Aktif</SelectItem>
//                       <SelectItem value="Inactive">Tidak Aktif</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Table */}
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-gray-200">
//                         <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Nama</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Email</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Kode</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Total Pengeluaran</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Total Komisi</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Tanggal Dibayar</th>
//                         <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Aksi</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {affiliators.map((affiliator, index) => (
//                         <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
//                           <td className="py-4 px-4 text-sm text-gray-900">{affiliator.name}</td>
//                           <td className="py-4 px-4 text-sm text-gray-600">{affiliator.email}</td>
//                           <td className="py-4 px-4">
//                             <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
//                               {affiliator.status}
//                             </Badge>
//                           </td>
//                           <td className="py-4 px-4 text-sm text-gray-900">{affiliator.code}</td>
//                           <td className="py-4 px-4 text-sm text-gray-900">{affiliator.totalSpend}</td>
//                           <td className="py-4 px-4 text-sm text-gray-900">{affiliator.totalCommissions}</td>
//                           <td className="py-4 px-4 text-sm text-gray-600">{affiliator.paidDate}</td>
//                           <td className="py-4 px-4">
//                             <Button variant="ghost" size="sm">
//                               <MoreHorizontal className="w-4 h-4" />
//                             </Button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination */}
//                 <div className="flex items-center justify-center space-x-2 mt-6">
//                   <Button variant="ghost" size="sm" disabled>
//                     <ChevronLeft className="w-4 h-4" />
//                   </Button>
//                   <Button variant="ghost" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
//                     1
//                   </Button>
//                   <Button variant="ghost" size="sm">
//                     2
//                   </Button>
//                   <Button variant="ghost" size="sm">
//                     3
//                   </Button>
//                   <span className="text-gray-500">...</span>
//                   <Button variant="ghost" size="sm">
//                     29
//                   </Button>
//                   <Button variant="ghost" size="sm">
//                     <ChevronRight className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Withdrawal Center */}
//           <div>
//             <Card className="bg-white border-0 shadow-sm">
//               <CardContent className="p-6">
//                 <div className="flex items-center space-x-3 mb-6">
//                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <Download className="w-4 h-4 text-blue-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900">Pusat Penarikan</h3>
//                 </div>

//                 {/* Balance Section */}
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">Saldo total:</p>
//                     <p className="text-lg font-bold text-gray-900">Rp 100.000.000</p>
//                     <p className="text-xs text-gray-500">Siap untuk ditarik</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">Sedang Ditinjau:</p>
//                     <p className="text-lg font-bold text-gray-900">Rp 156.000.000</p>
//                     <p className="text-xs text-gray-500">Penarikan Anda sedang diproses</p>
//                   </div>
//                 </div>

//                 {/* Withdrawal Button */}
//                 <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-6">
//                       Penarikan
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-md">
//                     <DialogHeader>
//                       <DialogTitle>Permintaan Penarikan</DialogTitle>
//                     </DialogHeader>
//                     <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
//                       {/* Amount */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Jumlah Penarikan
//                         </label>
//                         <Input
//                           type="text"
//                           placeholder="Rp 0"
//                           value={withdrawalForm.amount}
//                           onChange={(e) => handleFormChange("amount", e.target.value)}
//                           required
//                         />
//                       </div>

//                       {/* Recipient Name */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Nama Penerima
//                         </label>
//                         <Input
//                           type="text"
//                           placeholder="Masukkan nama penerima"
//                           value={withdrawalForm.recipientName}
//                           onChange={(e) => handleFormChange("recipientName", e.target.value)}
//                           required
//                         />
//                       </div>

//                       {/* Bank Selection */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Pilih Bank / E-Wallet
//                         </label>
//                         <Select
//                           value={withdrawalForm.bankName}
//                           onValueChange={(value) => handleFormChange("bankName", value)}
//                         >
//                           <SelectTrigger>
//                             <SelectValue placeholder="Pilih bank atau e-wallet" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {bankOptions.map((bank) => (
//                               <SelectItem key={bank} value={bank}>
//                                 {bank}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       {/* Account Number */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Nomor Rekening / E-Wallet
//                         </label>
//                         <Input
//                           type="text"
//                           placeholder="Masukkan nomor rekening atau e-wallet"
//                           value={withdrawalForm.accountNumber}
//                           onChange={(e) => handleFormChange("accountNumber", e.target.value)}
//                           required
//                         />
//                       </div>

//                       {/* Phone Number */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Nomor Telepon
//                         </label>
//                         <Input
//                           type="tel"
//                           placeholder="Masukkan nomor telepon"
//                           value={withdrawalForm.phoneNumber}
//                           onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
//                           required
//                         />
//                       </div>

//                       {/* Form Actions */}
//                       <div className="flex space-x-3 pt-4">
//                         <Button
//                           type="button"
//                           variant="outline"
//                           onClick={() => setIsWithdrawalDialogOpen(false)}
//                           className="flex-1"
//                         >
//                           Batal
//                         </Button>
//                         <Button
//                           type="submit"
//                           className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
//                         >
//                           Kirim Permintaan
//                         </Button>
//                       </div>
//                     </form>
//                   </DialogContent>
//                 </Dialog>

//                 {/* History Section */}
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-4">History withdrawal</h4>
//                   <p className="text-sm text-gray-600 mb-4">Manage your history withdrawals and view transaction history</p>

//                   <div className="space-y-4">
//                     {withdrawalHistory.map((item, index) => (
//                       <div key={index} className="border border-gray-200 rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="flex items-center space-x-2">
//                             <span className="text-sm font-medium text-gray-900">{item.id}</span>
//                             <Badge 
//                               className={
//                                 item.status === 'Completed' 
//                                   ? "bg-green-100 text-green-800 border-green-200"
//                                   : "bg-orange-100 text-orange-800 border-orange-200"
//                               }
//                             >
//                               {item.status}
//                             </Badge>
//                           </div>
//                           <span className="text-sm text-gray-500">
//                             {item.completedDate || '12/10/2024'}
//                           </span>
//                         </div>
                        
//                         <div className="space-y-1">
//                           <p className="text-sm">
//                             <span className="text-gray-600">Amount:</span>
//                             <span className="font-medium text-gray-900 ml-1">{item.amount}</span>
//                           </p>
//                           <p className="text-sm">
//                             <span className="text-gray-600">Method:</span>
//                             <span className="text-gray-900 ml-1">{item.method}</span>
//                           </p>
//                           {item.status === 'Completed' && (
//                             <p className="text-sm">
//                               <span className="text-gray-600">Completed on</span>
//                               <span className="text-gray-900 ml-1">{item.completedDate}</span>
//                             </p>
//                           )}
//                         </div>

//                         {item.processingNote && (
//                           <p className="text-xs text-gray-500 mt-2">{item.processingNote}</p>
//                         )}

//                         <div className="flex justify-end mt-3">
//                           <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
//                             <Download className="w-4 h-4 mr-1" />
//                             Receipt
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

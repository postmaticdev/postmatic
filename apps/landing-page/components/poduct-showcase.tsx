"use client";

import { MacWindow } from "./custom/mac-window";
import { Product } from "@/models/product";
import { ProductCard } from "./custom/product-card";
import { useState } from "react";
import { ProductModal } from "./custom/product-modal";

export default function ProductShowcase() {
  const products: Product[] = [
    {
      id: 1,
      name: "Dendeng Lambok",
      shortDes: "Dendeng pedas khas Minang dengan rasa autentik penuh sensasi",
      description: "🔥 Pedasnya Bikin Nagih! \n\nPerkenalkan Dendeng Lambok – dendeng khas Minang dengan cita rasa pedas otentik yang siap mengguncang lidahmu! Dibuat dari daging pilihan, dipadukan dengan bumbu rempah asli, dan sambal melimpah yang bikin makan makin lahap. 🌶🍖\n\nCocok disantap bareng nasi hangat, atau jadi lauk praktis yang siap kapan saja. \n\n📦 Kemasan 200gr, praktis & higienis.\n\nYuk, cobain sekarang dan rasakan sensasi pedasnya! \n\n#DendengLambok #Haykatuju #PedasAutentik",
      imageBefore: "/content/dendeng-before.png",
      imageAfter: "/content/dendeng-after.png",
    },
    {
      id: 2,
      name: "Kopi Susu Klasik",
      shortDes: "Perpaduan kopi robusta pilihan dan susu creamy yang segar",
      description: "☕✨ Saatnya ngopi lebih nikmat bareng KopiLagi Dukuh Zamrud! \n\nKopi susu klasik dengan paduan rasa kopi yang bold dan lembutnya susu segar, siap jadi teman setia ngobrol, kerja, atau sekadar me time. 🌿❄\n\n📍 Datang langsung ke KopiLagi Dukuh Zamrud dan rasakan kesegarannya!\n\n#KopiLagi #NgopiAsik #DukuhZamrud",
      imageBefore: "/content/kopilagi-before.png",
      imageAfter: "/content/kopilagi-after.png",
    },
    {
      id: 3,
      name: "Sabun Herbal Alma",
      shortDes: "Sabun herbal alami dengan aroma menenangkan dan lembut di kulit",
      description: "🌿✨ Saatnya rawat kulitmu dengan kebaikan alami! \n\n*Sabun Herbal Alma* hadir dengan bahan-bahan herbal pilihan yang lembut di kulit, membantu membersihkan dengan maksimal tanpa membuat kering. Diperkaya aroma floral yang menenangkan, cocok untuk relaksasi setelah seharian beraktivitas. 🌸🫧\n\n💧 Ukuran praktis 30ml, pas dibawa ke mana saja.\n\n#SabunHerbal #AlmaCare #NaturalBeauty",
      imageBefore: "/content/sabun-before.png",
      imageAfter: "/content/sabun-after.png",
    },
    {
      id: 4,
      name: "Dendeng Khas Warisan Nenek",
      shortDes: "Menu baru spesial dengan cita rasa autentik dan pedas menggoda",
      description: "🍽 Menu Baru Hadir! \n\nNikmati Dendeng Khas Warisan Nenek dengan cita rasa otentik yang bikin rindu masakan rumah. Perpaduan daging dendeng gurih, sambal pedas menggoda, dan nasi hangat siap memanjakan lidahmu. 🤤🔥\n\nHarga cuma Rp 20.000,- aja! 💸\n\n📍 Tersedia sekarang di Haykatuju. Yuk buruan cobain sebelum kehabisan! \n\n#Haykatuju #MenuBaru #DendengWarisanNenek",
      imageBefore: "/content/nasi-dendeng-before.png",
      imageAfter: "/content/nasi-dendeng-after.png",
    },
    {
      id: 5,
      name: "Kontrakan Haystudio Property",
      shortDes: "Kontrakan strategis di Jl. Palaganisme, Yogyakarta",
      description: "🏠 Cari kontrakan luas & nyaman di Yogyakarta? \n\nKontrakan Haystudio Property hadir dengan fasilitas lengkap: \n✨ 4 Kamar Tidur\n✨ 2 Kamar Mandi\n✨ Lokasi strategis di Jl. Palaganisme, Yogyakarta\n\nDengan harga hanya *30 juta/tahun*, cocok untuk keluarga atau tempat tinggal bersama. 💫\n\n📍 Segera amankan unitnya sebelum penuh!\n\n#KontrakanJogja #HaystudioProperty #SewaRumah",
      imageBefore: "/content/rumah-before.png",
      imageAfter: "/content/rumah-after.png",
    },
    // {
    //   id: 6,
    //   name: "Smart Dashboard",
    //   shortDes: "Pemantauan performa cerdas",
    //   description:
    //     "Pantau performa bisnis Anda dengan cerdas dan efektif. Smart Dashboard menyediakan visualisasi data yang intuitif dan metrik kunci yang bisa disesuaikan, memungkinkan Anda untuk memantau progres dan membuat penyesuaian dengan cepat.",
    //   imageBefore: "/content/sabun-before.png",
    //   imageAfter: "/content/sabun-after.png",
    // },
  ];

  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[0] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openProductModal = (product: (typeof products)[0]) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  const closeProductModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section id="about" className="relative">
      <div className="text-center mb-7">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Postmatic
          </span>{" "}
          Showcase
        </h2>
      </div>
      <MacWindow
        hoverZoom={false}
        title="Product Showcase"
        className="max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto ">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              <ProductCard product={product} onClick={openProductModal} />
            </div>
          ))}
        </div>
      </MacWindow>

      {selectedProduct && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={closeProductModal}
          product={selectedProduct}
        />
      )}
    </section>
  );
}

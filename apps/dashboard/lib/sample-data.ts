export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
}

export const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Jus Segar",
    category: "Food & Beverage",
    description:
      "Ini Penjelasan Produknya yang sangat detail dan informatif untuk memberikan gambaran lengkap tentang produk yang ditawarkan kepada pelanggan.",
    price: "Rp 25.000",
    image: "https://picsum.photos/80/80",
  },
  {
    id: 2,
    name: "Es Tebu Es Teh",
    category: "Food & Beverage",
    description:
      "Ini Penjelasan Produknya yang sangat detail dan informatif untuk memberikan gambaran lengkap tentang produk yang ditawarkan kepada pelanggan.",
    price: "Rp 25.000",
    image: "https://picsum.photos/80/80",
  },
  {
    id: 3,
    name: "Nasi Goreng Spesial",
    category: "Food & Beverage",
    description:
      "Nasi goreng dengan bumbu rempah pilihan dan topping lengkap yang menggugah selera.",
    price: "Rp 35.000",
    image: "https://picsum.photos/80/80",
  },
  {
    id: 4,
    name: "Ayam Bakar Madu",
    category: "Food & Beverage",
    description:
      "Ayam bakar dengan bumbu madu yang manis dan gurih, disajikan dengan sambal pedas.",
    price: "Rp 45.000",
    image: "https://picsum.photos/80/80",
  },
];

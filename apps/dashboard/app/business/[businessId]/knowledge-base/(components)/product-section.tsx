"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreVertical,
  Plus,
  Search,
  Edit,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import { ProductModal } from "./product-modal";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import {
  useProductKnowledgeCreate,
  useProductKnowledgeGetAll,
  useProductKnowledgeUpdate,
  useProductKnowledgeDelete,
} from "@/services/knowledge.api";
import { DEFAULT_PRODUCT_IMAGE } from "@/constants";
import {
  ProductKnowledgePld,
  ProductKnowledgeRes,
} from "@/models/api/knowledge/product.type";
import { showToast } from "@/helper/show-toast";
import { formatPriceWithCurrency } from "@/helper/price-formatter";
import { NoContent } from "@/components/base/no-content";
import { SearchNotFound } from "@/components/base/search-not-found";
import { productKnowledgeSchema } from "@/validator/new-business";
import { useRole } from "@/contexts/role-context";

const initialProduct: ProductKnowledgePld & { id?: string } = {
  category: "",
  description: "",
  images: [],
  name: "",
  price: 0,
  currency: "IDR",
  id: "",
};

export function ProductSection() {
  const { businessId } = useParams() as { businessId: string };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<
    ProductKnowledgePld & { id?: string }
  >(initialProduct);
  const [productToDelete, setProductToDelete] =
    useState<ProductKnowledgeRes | null>(null);
  const [productErrors, setProductErrors] = useState<Record<string, string>>(
    {}
  );
  const { access } = useRole();
  const { productKnowledge } = access;

  const handleAddProduct = () => {
    setModalMode("add");
    setSelectedProduct(initialProduct);
    setProductErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditProduct = (product: ProductKnowledgeRes) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setProductErrors({});
    console.log("Selected product:", product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = (product: ProductKnowledgeRes) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete?.id) {
      showToast("error", "Product ID tidak ditemukan");
      return;
    }

    try {
      const res = await mProductDelete.mutateAsync(productToDelete.id);
      showToast(
        "success",
        res.data.responseMessage || "Produk berhasil dihapus"
      );
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      showToast("error", "Gagal menghapus produk");
      console.error("Delete product error:", error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const mProductUpdate = useProductKnowledgeUpdate();
  const mProductCreate = useProductKnowledgeCreate();
  const mProductDelete = useProductKnowledgeDelete();
  const handleSave = async (
    productData: ProductKnowledgePld & { id?: string }
  ) => {
    try {
      // Validate form data
      const result = productKnowledgeSchema.safeParse(productData);
      if (!result.success) {
        const validationErrors: Record<string, string> = {};
        result.error.issues.forEach((error) => {
          validationErrors[error.path[0] as string] = error.message;
        });
        setProductErrors(validationErrors);
        throw new Error("Harap perbaiki data yang tidak valid");
      }

      // Clear errors if validation passes
      setProductErrors({});

      if (productData.id) {
        const res = await mProductUpdate.mutateAsync({
          productId: productData.id,
          formData: productData,
        });
        showToast("success", res.data.responseMessage);
      } else {
        const res = await mProductCreate.mutateAsync({
          businessId,
          formData: productData,
        });
        showToast("success", res.data.responseMessage);
      }
      setIsEditModalOpen(false);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Harap perbaiki data yang tidak valid"
      ) {
        // Validation errors are already set, don't show toast
        return;
      }
      showToast("error", "Gagal menyimpan produk");
    }
  };

  const { data: productData } = useProductKnowledgeGetAll(businessId, {
    search: searchQuery,
  });
  const products = productData?.data.data || [];

  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Produk Anda</h2>

          <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cari produk anda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                {productKnowledge.write && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 whitespace-nowrap"
                    onClick={handleAddProduct}
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Produk
                  </Button>
                )}
              </div>


          {/* Product List */}
          {products.length === 0 && searchQuery === "" ? (
            <NoContent
              icon={ShoppingBag}
              title="Belum ada Produk"
              titleDescription="Tambahkan produk anda sekarang"
              buttonText="Tambah Sumber RSS"
              onButtonClick={handleAddProduct}
            />
          ) : products.length === 0 ? (
            <SearchNotFound description="atau tambah produk baru" />
          ) : (
            <div
              className={`space-y-3 ${
                products.length > 3 ? "max-h-[500px] overflow-y-auto " : ""
              }`}
            >
              {products.map((product) => (
                <Card key={product.id} className="bg-background-secondary">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="relative w-16 h-16 sm:w-32  sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={product.images[0] || DEFAULT_PRODUCT_IMAGE}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col sm:hidden items-start ">
                            <h3 className="font-medium text-foreground mb-1 text-sm line-clamp-1">
                              {product.name}
                            </h3>

                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                                {product.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="hidden sm:flex flex-col lg:flex-row lg:gap-2">
                            <h3 className="font-medium text-foreground mb-1">
                              {product.name}
                            </h3>

                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                                {product.category}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                            {product.description}
                          </p>

                          <p className="text-sm font-medium text-foreground">
                            {formatPriceWithCurrency(
                              product.price,
                              product.currency
                            )}
                          </p>
                        </div>
                      </div>

                      {productKnowledge.write && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <ProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProductErrors({});
        }}
        onSave={handleSave}
        mode={modalMode}
        formValue={selectedProduct}
        onChange={setSelectedProduct}
        errors={productErrors}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Produk"
        description="Tindakan ini tidak dapat dibatalkan. Produk akan dihapus secara permanen dari sistem."
        itemName={productToDelete?.name || ""}
        isLoading={mProductDelete.isPending}
      />
    </Card>
  );
}

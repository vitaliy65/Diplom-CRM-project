"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Layers, Trash2 } from "lucide-react";
import { containerVariants, variantItem } from "@/static/Animations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectStorage,
  selectStorageLoading,
  selectStorageSaving,
  createSparePart,
  deleteSparePart,
} from "@/store/slices/storage-slice";
import type { SpareParts } from "@/lib/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ModalDialogConateiner from "@/components/ModalDialogConateiner";
import CreateStorageDialog from "@/components/storage-view-components/CreateStorageDialog";
import { Dialog, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { EditStorageDialog } from "@/components/storage-view-components/EditStorageDialog";

export default function StorageView() {
  const dispatch = useAppDispatch();
  const storageRaw = useAppSelector(selectStorage) as SpareParts[];
  const loading = useAppSelector(selectStorageLoading);
  const saving = useAppSelector(selectStorageSaving);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState<SpareParts | null>(null);

  // Prepare list to render
  const storage = Array.isArray(storageRaw) ? storageRaw : [];

  return (
    <motion.div
      className="view-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="view-container">
        {/* Header */}
        <motion.div variants={variantItem} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  Склад / Запчастини
                </h1>
              </div>
              <p className="text-muted-foreground">
                Перелік запчастин та матеріалів на складі сервісного центру
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Додати запчастину
                  </Button>
                </motion.div>
              </DialogTrigger>
              {isCreateDialogOpen && (
                <ModalDialogConateiner
                  title="Нова запчастина"
                  description="Додайте нову запчастину на склад"
                >
                  <CreateStorageDialog
                    onClose={() => setIsCreateDialogOpen(false)}
                    onSubmit={async (data) => {
                      const result = await dispatch(createSparePart(data));
                      if (createSparePart.fulfilled.match(result)) {
                        toast.success("Запчастину додано");
                        setIsCreateDialogOpen(false);
                      } else {
                        toast.error(
                          (result.payload as string) ||
                            "Помилка під час додавання запчастини",
                        );
                      }
                    }}
                  />
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Скасувати
                    </Button>
                  </DialogFooter>
                </ModalDialogConateiner>
              )}
            </Dialog>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={variantItem}
          className="bento-card p-0 overflow-x-hidden"
        >
          {loading ? (
            <p className="text-muted-foreground px-6 py-4">
              Завантаження складу...
            </p>
          ) : storage.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-md font-medium text-foreground">
                Запчастин не знайдено
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Додайте першу запчастину для початку роботи
              </p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-normal">Назва</th>
                  <th className="text-left px-4 py-3 font-normal">Опис</th>
                  <th className="text-left px-4 py-3 font-normal">Кількість</th>
                  <th className="text-left px-4 py-3 font-normal">
                    Ціна за одиницю (₴)
                  </th>
                  <th className="text-right px-4 py-3 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {storage.map((item) => (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{
                        scale: 1.015,
                        backgroundColor: "#ffffff05",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 24,
                      }}
                      className="border-b border-border/40 cursor-pointer"
                      onClick={() => setEditingStorage(item)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {item.count}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {item.priceForOne} ₴
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-destructive/15 hover:text-destructive"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const result = await dispatch(
                              deleteSparePart(item.id),
                            );
                            if (deleteSparePart.fulfilled.match(result)) {
                              toast.success("Запчастину видалено");
                            } else {
                              toast.error(
                                (result.payload as string) ||
                                  "Помилка видалення запчастини",
                              );
                            }
                          }}
                          aria-label="Видалити запчастину"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>
      </div>

      {/* Edit Storage Modal */}
      <EditStorageDialog
        editingStorage={editingStorage}
        setEditingStorage={setEditingStorage}
        saving={saving}
      />
    </motion.div>
  );
}

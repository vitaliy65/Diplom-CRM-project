"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Layers } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createService,
  deleteService,
  selectServices,
  selectServicesLoading,
  selectServicesSaving,
} from "@/store/slices/services-slice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/components/service-view-components/ServiceForm";
import type { Service } from "@/lib/types";
import { EditServiceDialog } from "@/components/service-view-components/EditServiceDialog";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ServicesView() {
  const dispatch = useAppDispatch();
  const servicesRaw = useAppSelector(selectServices) as Service[];
  const loading = useAppSelector(selectServicesLoading);
  const saving = useAppSelector(selectServicesSaving);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<null | Service>(null);

  // Prepare list to render
  const services = Array.isArray(servicesRaw) ? servicesRaw : [];

  return (
    <motion.div
      className="general-view-settings"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-4xl md:pl-16">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">
                  Сервіси / Послуги
                </h1>
              </div>
              <p className="text-muted-foreground">
                Перелік усіх послуг сервісного центру
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
                    Додати сервіс
                  </Button>
                </motion.div>
              </DialogTrigger>
              {isCreateDialogOpen && (
                <DialogContent className="border-border/50 sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      Новий сервіс
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Додайте новий сервіс до бази даних
                    </DialogDescription>
                  </DialogHeader>
                  <ServiceForm
                    saving={saving}
                    onSubmit={async (data) => {
                      const payload = {
                        ...data,
                        final_price: data.base_price,
                        discount: 0,
                      };
                      const result = await dispatch(createService(payload));
                      if (createService.fulfilled.match(result)) {
                        toast.success("Сервіс додано");
                        setIsCreateDialogOpen(false);
                      } else {
                        toast.error(
                          (result.payload as string) ||
                            "Помилка під час додавання сервісу",
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
                </DialogContent>
              )}
            </Dialog>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={itemVariants}
          className="bento-card p-0 overflow-x-hidden"
        >
          {loading ? (
            <p className="text-muted-foreground px-6 py-4">
              Завантаження сервісів...
            </p>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-md font-medium text-foreground">
                Сервісів не знайдено
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Додайте перший сервіс для початку роботи
              </p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-normal">Назва</th>
                  <th className="text-left px-4 py-3 font-normal">
                    Базова вартість (₴)
                  </th>
                  <th className="text-left px-4 py-3 font-normal">
                    Фінальна вартість (₴)
                  </th>
                  <th className="text-left px-4 py-3 font-normal">
                    Знижка (%)
                  </th>
                  <th className="text-right px-4 py-3 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {services.map((service) => (
                    <motion.tr
                      key={service.id}
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
                      onClick={() => {
                        setEditingService({
                          id: service.id,
                          name: service.name,
                          base_price:
                            typeof service.base_price === "number"
                              ? service.base_price
                              : (service.final_price ?? 0),
                          final_price:
                            typeof service.final_price === "number"
                              ? service.final_price
                              : service.base_price,
                          discount:
                            typeof service.discount === "number"
                              ? service.discount
                              : 0,
                        });
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">
                          {service.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {service.base_price} ₴
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {service.final_price} ₴
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {service.discount} %
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-destructive/15 hover:text-destructive"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const result = await dispatch(
                              deleteService(service.id),
                            );
                            if (deleteService.fulfilled.match(result)) {
                              toast.success("Сервіс видалено");
                            } else {
                              toast.error(
                                (result.payload as string) ||
                                  "Помилка видалення сервісу",
                              );
                            }
                          }}
                          aria-label="Видалити сервіс"
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

        {/* Edit Service Modal */}
        <EditServiceDialog
          editingService={editingService}
          setEditingService={setEditingService}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}

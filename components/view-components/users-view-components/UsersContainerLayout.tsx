import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, UserCog } from "lucide-react";
import { roleLabels, type UserProfile as User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { containerVariants, variantItem } from "@/static/Animations";
import { roleConfig, UserCard } from "./UserCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectUsers,
  selectUsersLoading,
  updateUser,
} from "@/store/slices/users-slice";
import { toast } from "sonner";
import { useState } from "react";

export default function UsersContainerLayout() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const loading = useAppSelector(selectUsersLoading);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleUserStatus = async (userId: string, active: boolean) => {
    const result = await dispatch(
      updateUser({ id: userId, data: { active: !active } }),
    );
    if (updateUser.fulfilled.match(result)) {
      toast.success("Статус користувача оновлено");
    } else {
      toast.error((result.payload as string) || "Помилка оновлення статусу");
    }
  };

  const stats = {
    admin: users.filter((u) => u.role === "admin").length,
    manager: users.filter((u) => u.role === "manager").length,
    master: users.filter((u) => u.role === "master").length,
  };

  return (
    <div className="container-layout">
      {/* Stats */}
      <motion.div
        variants={variantItem}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        {(["admin", "manager", "master"] as const).map((role) => {
          const config = roleConfig[role as User["role"]];
          const Icon = config.icon;
          return (
            <div key={role} className="bento-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    config.bgColor,
                  )}
                >
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {stats[role]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {roleLabels[role]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Search */}
      <motion.div variants={variantItem} className="bento-card p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук за іменем або email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50 focus:border-primary/50"
          />
        </div>
      </motion.div>

      {/* Users List */}
      {loading && (
        <p className="text-sm text-muted-foreground mb-3">
          Завантаження користувачів...
        </p>
      )}
      <motion.div variants={containerVariants} className="space-y-3">
        <AnimatePresence>
          {filteredUsers.map((user, index) => (
            <UserCard
              key={user.id}
              user={user}
              index={index}
              onToggleStatus={() => toggleUserStatus(user.id, user.active)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredUsers.length === 0 && (
        <motion.div
          variants={variantItem}
          className="bento-card p-8 text-center"
        >
          <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">
            Користувачів не знайдено
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Спробуйте змінити параметри пошуку
          </p>
        </motion.div>
      )}
    </div>
  );
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  UserCog,
  Settings,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { selectUsers, selectUsersLoading, updateUser } from "@/store/slices/users-slice"
import { roleLabels, type UserProfile as User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { roleConfig, UserCard } from "../users-view-components/UserCard";
import { CreateUserDialog } from "../users-view-components/CreateUserDialog";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function UsersView() {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers)
  const loading = useAppSelector(selectUsersLoading)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleUserStatus = async (userId: string, active: boolean) => {
    const result = await dispatch(updateUser({ id: userId, data: { active: !active } }))
    if (updateUser.fulfilled.match(result)) {
      toast.success("Статус користувача оновлено")
    } else {
      toast.error((result.payload as string) || "Помилка оновлення статусу")
    }
  }

  const stats = {
    admin: users.filter((u) => u.role === "admin").length,
    manager: users.filter((u) => u.role === "manager").length,
    master: users.filter((u) => u.role === "master").length,
  }

  return (
    <motion.div
      className="min-h-screen px-4 pb-8 pt-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl md:pl-16">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Settings className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Адмін панель</h1>
              </div>
              <p className="text-muted-foreground">Управління користувачами системи</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Новий користувач
                  </Button>
                </motion.div>
              </DialogTrigger>
              <CreateUserDialog onClose={() => setIsCreateDialogOpen(false)} />
            </Dialog>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {(["admin", "manager", "master"] as const).map((role) => {
            const config = roleConfig[role as User["role"]]
            const Icon = config.icon
            return (
              <div key={role} className="bento-card p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", config.bgColor)}>
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stats[role]}</p>
                    <p className="text-sm text-muted-foreground">{roleLabels[role]}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="bento-card p-4 mb-6">
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
        {loading && <p className="text-sm text-muted-foreground mb-3">Завантаження користувачів...</p>}
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
          <motion.div variants={itemVariants} className="bento-card p-8 text-center">
            <UserCog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Користувачів не знайдено</p>
            <p className="text-sm text-muted-foreground mt-1">
              Спробуйте змінити параметри пошуку
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

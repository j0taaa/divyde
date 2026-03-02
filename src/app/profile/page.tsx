"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Check, LogOut, Mail, Pencil, User, Users, History as HistoryIcon, UserCircle } from "lucide-react";

const ICON_CHOICES = ["🙂", "😎", "🤓", "🦊", "🐼", "🐙", "🐸", "🦁", "🐵", "🐱"];

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatarIcon, setAvatarIcon] = useState<string>("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const fallbackInitials = (user?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const { error: updateError } = await api.updateProfile({
      name: name.trim(),
      avatarIcon,
    });

    if (updateError) {
      setError(updateError);
      setIsSaving(false);
      return;
    }

    await refreshUser();
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight">Divyde</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
          <form onSubmit={handleSave} className="contents">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                {(isEditing ? avatarIcon : user.avatarIcon) || fallbackInitials}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{isEditing ? name : user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                    <CardDescription>Edit your personal details and icon</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                        setName(user.name);
                        setAvatarIcon(user.avatarIcon || "");
                        setError("");
                        setIsEditing(true);
                      }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <Button type="submit" size="sm" disabled={isSaving}>
                      <Check className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex w-full flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Name</span>
                    {isEditing ? (
                      <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
                    ) : (
                      <span className="font-medium">{user.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">Profile icon</span>
                  <div className="flex flex-wrap gap-2">
                    {ICON_CHOICES.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant={avatarIcon === icon ? "default" : "outline"}
                        className="h-10 w-10 p-0 text-lg"
                        disabled={!isEditing}
                        onClick={() => setAvatarIcon(icon)}
                      >
                        {icon}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={!avatarIcon ? "default" : "outline"}
                      disabled={!isEditing}
                      onClick={() => setAvatarIcon("")}
                    >
                      Initials
                    </Button>
                  </div>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </CardContent>
            </Card>
          </form>

          <Button variant="destructive" size="lg" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </main>

      <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          <button
            onClick={() => router.push("/")}
            className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Friends</span>
          </button>
          <button
            onClick={() => router.push("/?screen=history")}
            className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <HistoryIcon className="h-5 w-5" />
            <span className="text-xs font-medium">History</span>
          </button>
          <button
            onClick={() => {}}
            className="flex flex-col items-center gap-1 px-6 py-2 text-primary transition-colors"
            aria-current="page"
          >
            <UserCircle className="h-5 w-5" />
            <span className="text-xs font-medium">{user?.name?.split(" ")[0] || "Account"}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

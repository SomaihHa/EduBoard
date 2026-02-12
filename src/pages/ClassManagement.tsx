import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAppContext } from "@/contexts/AppContext";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Copy, Trash2, UserMinus, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

const ClassManagement = () => {
  const { role, language } = useAppContext();
  const isAr = language === "ar";
  const {
    students,
    teachers,
    invitations,
    loading,
    createInvitation,
    deactivateInvitation,
    joinClass,
    removeStudent,
  } = useTeacherStudents();

  const [newClassName, setNewClassName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleCreateInvite = async () => {
    if (!newClassName.trim()) {
      toast.error(isAr ? "أدخل اسم الفصل" : "Enter a class name");
      return;
    }
    await createInvitation(newClassName.trim());
    setNewClassName("");
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    const { error } = await joinClass(joinCode);
    if (error) toast.error(error);
    setJoinCode("");
    setJoining(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(isAr ? "تم نسخ الكود" : "Code copied!");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // STUDENT VIEW
  if (role === "student") {
    return (
      <AppLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isAr ? "فصولي" : "My Classes"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAr ? "انضم إلى فصل باستخدام كود الدعوة" : "Join a class using an invite code"}
          </p>
        </div>

        {/* Join Class */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            {isAr ? "انضم إلى فصل" : "Join a Class"}
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder={isAr ? "أدخل كود الدعوة" : "Enter invite code"}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="max-w-xs font-mono text-lg tracking-widest uppercase"
            />
            <Button onClick={handleJoin} disabled={joining || !joinCode.trim()}>
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAr ? "انضم" : "Join")}
            </Button>
          </div>
        </Card>

        {/* My Teachers */}
        <h2 className="text-lg font-semibold mb-4">{isAr ? "معلميّ" : "My Teachers"}</h2>
        {teachers.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {isAr ? "لم تنضم إلى أي فصل بعد" : "You haven't joined any class yet"}
          </Card>
        ) : (
          <div className="grid gap-3">
            {teachers.map((t) => (
              <Card key={t.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{t.profile?.full_name || "Teacher"}</p>
                  {t.class_name && (
                    <Badge variant="secondary" className="mt-1">{t.class_name}</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString()}
                </span>
              </Card>
            ))}
          </div>
        )}
      </AppLayout>
    );
  }

  // TEACHER VIEW
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {isAr ? "إدارة الفصول" : "Class Management"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? "أنشئ أكواد دعوة وأدر طلابك" : "Create invite codes and manage your students"}
        </p>
      </div>

      {/* Create Invitation */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          {isAr ? "إنشاء كود دعوة" : "Create Invite Code"}
        </h2>
        <div className="flex gap-3">
          <Input
            placeholder={isAr ? "اسم الفصل (مثل: الفصل أ)" : "Class name (e.g., Class A)"}
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            maxLength={50}
            className="max-w-sm"
          />
          <Button onClick={handleCreateInvite}>
            {isAr ? "إنشاء" : "Generate"}
          </Button>
        </div>
      </Card>

      {/* Active Invitations */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{isAr ? "أكواد الدعوة" : "Invite Codes"}</h2>
          <div className="grid gap-3">
            {invitations.map((inv) => (
              <Card key={inv.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xl font-bold tracking-widest text-primary">
                    {inv.invite_code}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{inv.class_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.use_count}/{inv.max_uses} {isAr ? "مستخدم" : "used"}
                    </p>
                  </div>
                  <Badge variant={inv.is_active ? "default" : "secondary"}>
                    {inv.is_active ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => copyCode(inv.invite_code)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  {inv.is_active && (
                    <Button size="icon" variant="ghost" onClick={() => deactivateInvitation(inv.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Linked Students */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        {isAr ? "طلابي" : "My Students"} ({students.length})
      </h2>
      {students.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          {isAr ? "لا يوجد طلاب مرتبطين بعد. أنشئ كود دعوة وشاركه." : "No students linked yet. Create an invite code and share it."}
        </Card>
      ) : (
        <div className="grid gap-3">
          {students.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{s.profile?.full_name || "Student"}</p>
                {s.class_name && (
                  <Badge variant="secondary" className="mt-1">{s.class_name}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
                <Button size="icon" variant="ghost" onClick={() => removeStudent(s.id)}>
                  <UserMinus className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default ClassManagement;

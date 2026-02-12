import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface LinkedStudent {
  id: string;
  student_id: string;
  class_name: string;
  created_at: string;
  profile?: { full_name: string; email: string | null };
}

export interface LinkedTeacher {
  id: string;
  teacher_id: string;
  class_name: string;
  created_at: string;
  profile?: { full_name: string };
}

export interface ClassInvitation {
  id: string;
  invite_code: string;
  class_name: string;
  is_active: boolean;
  max_uses: number;
  use_count: number;
  expires_at: string | null;
  created_at: string;
}

export function useTeacherStudents() {
  const { user, role } = useAuth();
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [teachers, setTeachers] = useState<LinkedTeacher[]>([]);
  const [invitations, setInvitations] = useState<ClassInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    if (!user || role !== "teacher") return;
    const { data: links } = await supabase
      .from("teacher_students")
      .select("*")
      .eq("teacher_id", user.id);

    if (links && links.length > 0) {
      const studentIds = links.map((l) => l.student_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds);

      const enriched = links.map((l) => ({
        ...l,
        profile: profiles?.find((p) => p.id === l.student_id),
      }));
      setStudents(enriched);
    } else {
      setStudents([]);
    }
  };

  const fetchTeachers = async () => {
    if (!user || role !== "student") return;
    const { data: links } = await supabase
      .from("teacher_students")
      .select("*")
      .eq("student_id", user.id);

    if (links && links.length > 0) {
      const teacherIds = links.map((l) => l.teacher_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", teacherIds);

      const enriched = links.map((l) => ({
        ...l,
        profile: profiles?.find((p) => p.id === l.teacher_id),
      }));
      setTeachers(enriched);
    } else {
      setTeachers([]);
    }
  };

  const fetchInvitations = async () => {
    if (!user || role !== "teacher") return;
    const { data } = await supabase
      .from("class_invitations")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });
    setInvitations(data ?? []);
  };

  const createInvitation = async (className: string) => {
    if (!user) return;
    const { data: code } = await supabase.rpc("generate_invite_code");
    const { error } = await supabase.from("class_invitations").insert({
      teacher_id: user.id,
      invite_code: code as string,
      class_name: className,
    });
    if (error) {
      toast.error("Failed to create invitation");
      return;
    }
    toast.success("Invite code created!");
    fetchInvitations();
  };

  const deactivateInvitation = async (id: string) => {
    await supabase
      .from("class_invitations")
      .update({ is_active: false })
      .eq("id", id);
    fetchInvitations();
  };

  const joinClass = async (code: string) => {
    if (!user) return { error: "Not logged in" };

    const { data: invitation } = await supabase
      .from("class_invitations")
      .select("*")
      .eq("invite_code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (!invitation) return { error: "Invalid or expired invite code" };

    if (invitation.max_uses && invitation.use_count >= invitation.max_uses) {
      return { error: "This invite code has reached its maximum uses" };
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { error: "This invite code has expired" };
    }

    // Check if already linked
    const { data: existing } = await supabase
      .from("teacher_students")
      .select("id")
      .eq("teacher_id", invitation.teacher_id)
      .eq("student_id", user.id)
      .maybeSingle();

    if (existing) return { error: "You are already in this class" };

    const { error: insertError } = await supabase
      .from("teacher_students")
      .insert({
        teacher_id: invitation.teacher_id,
        student_id: user.id,
        class_name: invitation.class_name || "",
      });

    if (insertError) return { error: "Failed to join class" };

    // Increment use count
    await supabase
      .from("class_invitations")
      .update({ use_count: invitation.use_count + 1 })
      .eq("id", invitation.id);

    toast.success("Successfully joined the class!");
    fetchTeachers();
    return { error: null };
  };

  const removeStudent = async (linkId: string) => {
    await supabase.from("teacher_students").delete().eq("id", linkId);
    toast.success("Student removed");
    fetchStudents();
  };

  useEffect(() => {
    if (!user || !role) return;
    setLoading(true);
    const promises = role === "teacher"
      ? [fetchStudents(), fetchInvitations()]
      : [fetchTeachers()];
    Promise.all(promises).finally(() => setLoading(false));
  }, [user, role]);

  return {
    students,
    teachers,
    invitations,
    loading,
    createInvitation,
    deactivateInvitation,
    joinClass,
    removeStudent,
    refetchStudents: fetchStudents,
  };
}

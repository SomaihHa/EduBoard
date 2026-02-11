import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppContext } from "@/contexts/AppContext";
import { Users, Plus, LogOut, Loader2, UserCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Group {
  id: string;
  skill_id: string;
  name: string;
  description: string;
  created_by: string;
  max_members: number;
  member_count: number;
  is_member: boolean;
}

interface SkillGroupsProps {
  skillId: string;
  accent: string;
}

const SkillGroups = ({ skillId, accent }: SkillGroupsProps) => {
  const { user } = useAuth();
  const { language } = useAppContext();
  const isAr = language === "ar";
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: groupsData } = await supabase
        .from("skill_groups")
        .select("*")
        .eq("skill_id", skillId);

      if (!groupsData) { setGroups([]); return; }

      const { data: membersData } = await supabase
        .from("skill_group_members")
        .select("group_id, user_id");

      const enriched: Group[] = groupsData.map((g: any) => {
        const members = (membersData || []).filter((m: any) => m.group_id === g.id);
        return {
          ...g,
          member_count: members.length,
          is_member: members.some((m: any) => m.user_id === user.id),
        };
      });
      setGroups(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, [skillId, user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim()) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("skill_groups")
        .insert({ skill_id: skillId, name: newName.trim(), description: newDesc.trim(), created_by: user.id })
        .select()
        .single();
      if (error) throw error;

      // Auto-join the creator
      await supabase.from("skill_group_members").insert({ group_id: data.id, user_id: user.id });

      toast({ title: isAr ? "تم إنشاء المجموعة" : "Group created!" });
      setNewName(""); setNewDesc(""); setShowForm(false);
      fetchGroups();
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", description: isAr ? "فشل إنشاء المجموعة" : "Failed to create group", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    if (!user) return;
    setJoiningId(groupId);
    try {
      const { error } = await supabase.from("skill_group_members").insert({ group_id: groupId, user_id: user.id });
      if (error) throw error;
      toast({ title: isAr ? "انضممت للمجموعة!" : "Joined group!" });
      fetchGroups();
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (groupId: string) => {
    if (!user) return;
    setJoiningId(groupId);
    try {
      const { error } = await supabase.from("skill_group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: isAr ? "غادرت المجموعة" : "Left group" });
      fetchGroups();
    } catch {
      toast({ title: isAr ? "خطأ" : "Error", variant: "destructive" });
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {isAr ? "مجموعات التمرين" : "Practice Groups"}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); }}
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إنشاء" : "Create"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          onClick={(e) => e.stopPropagation()}
          className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 animate-slide-in"
        >
          <input
            type="text"
            placeholder={isAr ? "اسم المجموعة" : "Group name"}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-secondary/50"
          />
          <input
            type="text"
            placeholder={isAr ? "وصف قصير (اختياري)" : "Short description (optional)"}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-secondary/50"
          />
          <button
            type="submit"
            disabled={creating}
            className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-foreground text-sm font-medium transition-all flex items-center justify-center gap-1.5"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isAr ? "إنشاء مجموعة" : "Create Group"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          {isAr ? "لا توجد مجموعات بعد. كن أول من ينشئ واحدة!" : "No groups yet. Be the first to create one!"}
        </p>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className={`p-1.5 rounded-lg bg-white/5 ${accent}`}>
                <UserCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{group.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {group.member_count}/{group.max_members} {isAr ? "أعضاء" : "members"}
                  {group.description ? ` · ${group.description}` : ""}
                </p>
              </div>
              {group.is_member ? (
                <button
                  onClick={() => handleLeave(group.id)}
                  disabled={joiningId === group.id}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all flex items-center gap-1"
                >
                  {joiningId === group.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                  {isAr ? "مغادرة" : "Leave"}
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(group.id)}
                  disabled={joiningId === group.id || group.member_count >= group.max_members}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-foreground font-medium transition-all flex items-center gap-1 disabled:opacity-40"
                >
                  {joiningId === group.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3" />}
                  {group.member_count >= group.max_members ? (isAr ? "ممتلئ" : "Full") : (isAr ? "انضم" : "Join")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillGroups;

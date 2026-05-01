import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function KingMakerAdmin() {
  const [event, setEvent] = useState<any>(null);
  const [reels, setReels] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [viewUser, setViewUser] = useState<any | null>(null);

  const load = async () => {
    const [{ data: e }, { data: r }, { data: p }] = await Promise.all([
      supabase.from("event_settings").select("*").eq("id", "king_maker").maybeSingle(),
      supabase.from("king_maker_reels").select("*").order("position"),
      supabase.from("king_maker_participants").select("*, profiles:user_id(email, full_name)").order("created_at", { ascending: false }),
    ]);
    setEvent(e);
    setReels(r || []);
    setParticipants(p || []);
  };

  useEffect(() => { load(); }, []);

  const saveEvent = async () => {
    if (!event) return;
    setSaving(true);
    const { error } = await supabase.from("event_settings").update({
      event_name: event.event_name,
      banner_title: event.banner_title,
      banner_subtitle: event.banner_subtitle,
      banner_image_url: event.banner_image_url,
      instagram_profile_url: event.instagram_profile_url,
      poster_image_url: event.poster_image_url,
      result_announcement_at: event.result_announcement_at,
      total_winners: Number(event.total_winners),
      is_active: event.is_active,
      updated_at: new Date().toISOString(),
    }).eq("id", "king_maker");
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Event saved!");
  };

  const updateReel = async (id: string, url: string) => {
    await supabase.from("king_maker_reels").update({ reel_url: url }).eq("id", id);
    toast.success("Reel updated");
    load();
  };

  const pickWinners = async () => {
    if (!event) return;
    if (!confirm(`Pick ${event.total_winners} random winners and grant them $30K accounts?`)) return;
    setPicking(true);

    // Get joined non-winner participants
    const { data: joined } = await supabase
      .from("king_maker_participants")
      .select("user_id")
      .eq("joined", true)
      .eq("is_winner", false);
    const pool = joined || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, event.total_winners);

    if (winners.length === 0) {
      toast.error("No eligible participants");
      setPicking(false);
      return;
    }

    // Find King Maker plan
    const { data: plan } = await supabase
      .from("challenge_plans")
      .select("*")
      .eq("challenge_type", "king_maker" as any)
      .eq("account_size", 30000)
      .maybeSingle();

    if (!plan) { toast.error("King Maker plan not found"); setPicking(false); return; }

    // For each winner: create a synthetic purchase + trading account
    for (const w of winners) {
      const { data: purchase } = await supabase.from("challenge_purchases").insert({
        user_id: w.user_id,
        plan_id: plan.id,
        status: "approved" as any,
        transaction_id: "KING_MAKER_GIVEAWAY",
      }).select().single();
      if (purchase) {
        const accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
        const password = Math.random().toString(36).slice(-8);
        await supabase.from("trading_accounts").insert({
          user_id: w.user_id,
          purchase_id: purchase.id,
          account_number: accountNumber,
          password,
          balance: 30000,
          phase: "king_maker_master" as any,
          status: "funded" as any,
          profit_target: 0,
        });
      }
      await supabase.from("king_maker_participants").update({ is_winner: true }).eq("user_id", w.user_id);
    }

    await supabase.from("event_settings").update({ winners_announced: true }).eq("id", "king_maker");
    toast.success(`${winners.length} winners selected & accounts created!`);
    setPicking(false);
    load();
  };

  const taskBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-primary/15 text-primary text-xs">Approved</Badge>;
    if (status === "under_review") return <Badge variant="secondary" className="text-xs">Review</Badge>;
    return <Badge variant="outline" className="text-xs">Pending</Badge>;
  };

  const overrideStatus = async (userId: string, taskNum: 3 | 5, status: string) => {
    const updates: any = taskNum === 3 ? { task3_status: status } : { task5_status: status };
    await supabase.from("king_maker_participants").update(updates).eq("user_id", userId);
    toast.success("Updated");
    load();
  };

  if (!event) return <div className="text-center py-12">Loading…</div>;

  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit"><Crown className="h-4 w-4 mr-2" />Event Edit</TabsTrigger>
        <TabsTrigger value="users">User Tracking ({participants.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="edit" className="space-y-4">
        <Card className="gradient-card">
          <CardHeader><CardTitle>Event Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Event Name</Label><Input value={event.event_name} onChange={(e) => setEvent({ ...event, event_name: e.target.value })} /></div>
              <div><Label>Total Winners</Label><Input type="number" value={event.total_winners} onChange={(e) => setEvent({ ...event, total_winners: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Banner Title</Label><Input value={event.banner_title} onChange={(e) => setEvent({ ...event, banner_title: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Banner Subtitle</Label><Input value={event.banner_subtitle} onChange={(e) => setEvent({ ...event, banner_subtitle: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Banner Image URL</Label><Input value={event.banner_image_url || ""} onChange={(e) => setEvent({ ...event, banner_image_url: e.target.value })} placeholder="https://..." /></div>
              <div className="sm:col-span-2"><Label>Instagram Profile URL (Task 3)</Label><Input value={event.instagram_profile_url || ""} onChange={(e) => setEvent({ ...event, instagram_profile_url: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>Poster Image URL (Task 5)</Label><Input value={event.poster_image_url || ""} onChange={(e) => setEvent({ ...event, poster_image_url: e.target.value })} placeholder="https://..." /></div>
              <div className="sm:col-span-2"><Label>Result Announcement Date</Label>
                <Input type="datetime-local" value={event.result_announcement_at?.slice(0, 16)} onChange={(e) => setEvent({ ...event, result_announcement_at: new Date(e.target.value).toISOString() })} />
              </div>
            </div>
            <Button onClick={saveEvent} disabled={saving}>{saving ? "Saving…" : "Save Event"}</Button>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader><CardTitle>4 Reels (Task 4)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reels.map((r) => (
              <div key={r.id} className="flex gap-2 items-center">
                <span className="text-sm font-bold w-8">#{r.position}</span>
                <Input
                  defaultValue={r.reel_url}
                  onBlur={(e) => e.target.value !== r.reel_url && updateReel(r.id, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gradient-card border-primary/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Pick Winners</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Randomly selects {event.total_winners} winners from joined participants and auto-creates $30K master accounts.
            </p>
            <p className="text-xs">Winners announced: <strong>{event.winners_announced ? "Yes" : "No"}</strong></p>
            <Button onClick={pickWinners} disabled={picking} className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              {picking ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Picking…</> : "Pick Winners Now"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <Card className="gradient-card">
          <CardHeader><CardTitle>All Participants</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>IG ID</TableHead>
                    <TableHead>T1</TableHead>
                    <TableHead>T2</TableHead>
                    <TableHead>T3</TableHead>
                    <TableHead>T4</TableHead>
                    <TableHead>T5</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="text-xs font-medium">{p.profiles?.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{p.profiles?.email}</div>
                      </TableCell>
                      <TableCell className="text-xs">{p.task2_instagram_id || "—"}</TableCell>
                      <TableCell>{p.task1_buy_10_completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                      <TableCell>{p.task2_completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                      <TableCell>{taskBadge(p.task3_status)}</TableCell>
                      <TableCell>{p.task4_reels_completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="text-xs">{p.task4_progress}/4</span>}</TableCell>
                      <TableCell>{taskBadge(p.task5_status)}</TableCell>
                      <TableCell>{p.joined ? <Badge className="bg-primary/15 text-primary text-xs">Joined</Badge> : "—"}</TableCell>
                      <TableCell>{p.is_winner ? <Badge className="bg-primary text-primary-foreground text-xs"><Trophy className="h-3 w-3 mr-1" />Winner</Badge> : "—"}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => setViewUser(p)}>View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!viewUser} onOpenChange={(o) => !o && setViewUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{viewUser?.profiles?.full_name || viewUser?.profiles?.email}</DialogTitle></DialogHeader>
            {viewUser && (
              <div className="space-y-4">
                <p className="text-sm"><strong>Instagram:</strong> {viewUser.task2_instagram_id || "—"}</p>
                <div>
                  <p className="text-sm font-semibold mb-2">Task 3 — Follow Screenshot {taskBadge(viewUser.task3_status)}</p>
                  {viewUser.task3_screenshot_url ? (
                    <a href={viewUser.task3_screenshot_url} target="_blank" rel="noopener noreferrer">
                      <img src={viewUser.task3_screenshot_url} alt="Task 3" className="max-h-64 rounded border border-border" />
                    </a>
                  ) : <p className="text-xs text-muted-foreground">Not uploaded</p>}
                  {viewUser.task3_screenshot_url && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => overrideStatus(viewUser.user_id, 3, "approved")}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => overrideStatus(viewUser.user_id, 3, "pending")}>Reject</Button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Task 5 — Story Screenshot {taskBadge(viewUser.task5_status)}</p>
                  {viewUser.task5_screenshot_url ? (
                    <a href={viewUser.task5_screenshot_url} target="_blank" rel="noopener noreferrer">
                      <img src={viewUser.task5_screenshot_url} alt="Task 5" className="max-h-64 rounded border border-border" />
                    </a>
                  ) : <p className="text-xs text-muted-foreground">Not uploaded</p>}
                  {viewUser.task5_screenshot_url && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => overrideStatus(viewUser.user_id, 5, "approved")}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => overrideStatus(viewUser.user_id, 5, "pending")}>Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  );
}
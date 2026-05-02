import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, CheckCircle2, Circle, Instagram, Upload, Download, Copy, ExternalLink, Trophy, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CountdownTimer } from "@/components/king-maker/CountdownTimer";

type EventSettings = {
  id: string;
  event_name: string;
  banner_title: string;
  banner_subtitle: string;
  banner_image_url: string | null;
  instagram_profile_url: string | null;
  poster_image_url: string | null;
  result_announcement_at: string;
  total_winners: number;
  winners_announced: boolean;
  is_active: boolean;
};

type Participant = {
  id: string;
  user_id: string;
  task1_buy_10_completed: boolean;
  task2_instagram_id: string | null;
  task2_completed: boolean;
  task3_screenshot_url: string | null;
  task3_status: string;
  task3_submitted_at: string | null;
  task4_reels_completed: boolean;
  task4_progress: number;
  task5_screenshot_url: string | null;
  task5_status: string;
  task5_submitted_at: string | null;
  joined: boolean;
  joined_at: string | null;
  is_winner: boolean;
};

type Reel = { id: string; reel_url: string; position: number };

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-primary/15 text-primary border-primary/30"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
  if (status === "under_review") return <Badge variant="secondary">Under Review</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

function TaskHeader({ idx, title, done }: { idx: number; title: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {done ? <CheckCircle2 className="h-5 w-5" /> : idx}
      </div>
      <h3 className="font-semibold text-base md:text-lg">{title}</h3>
      {done && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
    </div>
  );
}

export default function KingMaker() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventSettings | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [igInput, setIgInput] = useState("");
  const [submittingIg, setSubmittingIg] = useState(false);
  const [uploadingTask, setUploadingTask] = useState<3 | 5 | null>(null);
  const [reelDone, setReelDone] = useState<Record<number, boolean>>({});
  const [reelPlayed, setReelPlayed] = useState<Record<number, boolean>>({});
  const [reelRemaining, setReelRemaining] = useState<Record<number, number>>({});
  const reelStartedAt = useRef<Record<number, number>>({});
  const [joinedUsers, setJoinedUsers] = useState<any[]>([]);
  const fileRef3 = useRef<HTMLInputElement>(null);
  const fileRef5 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const loadAll = async () => {
    if (!user) return;
    const [{ data: ev }, { data: rs }] = await Promise.all([
      supabase.from("event_settings").select("*").eq("id", "king_maker").maybeSingle(),
      supabase.from("king_maker_reels").select("*").order("position"),
    ]);
    setEvent(ev as any);
    setReels((rs as any) || []);

    // Load or create participant
    let { data: p } = await supabase
      .from("king_maker_participants")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Check task1 — does user have a $10 instant_10 purchase that's approved?
    const { data: purchases } = await supabase
      .from("challenge_purchases")
      .select("status, challenge_plans(challenge_type, price_usd)")
      .eq("user_id", user.id)
      .eq("status", "approved");
    const hasTen = (purchases || []).some(
      (x: any) => x.challenge_plans?.challenge_type === "instant" && Number(x.challenge_plans?.price_usd) === 10,
    );

    if (!p) {
      const { data: created } = await supabase
        .from("king_maker_participants")
        .insert({ user_id: user.id, task1_buy_10_completed: hasTen })
        .select()
        .single();
      p = created as any;
    } else if (p.task1_buy_10_completed !== hasTen) {
      const { data: upd } = await supabase
        .from("king_maker_participants")
        .update({ task1_buy_10_completed: hasTen })
        .eq("user_id", user.id)
        .select()
        .single();
      p = (upd as any) || p;
    }

    // Auto-approve tasks 3 & 5 after 2 minutes
    const updates: any = {};
    const now = Date.now();
    if (p && p.task3_status === "under_review" && p.task3_submitted_at && now - new Date(p.task3_submitted_at).getTime() > 120000) {
      updates.task3_status = "approved";
    }
    if (p && p.task5_status === "under_review" && p.task5_submitted_at && now - new Date(p.task5_submitted_at).getTime() > 120000) {
      updates.task5_status = "approved";
    }
    if (Object.keys(updates).length) {
      const { data: upd2 } = await supabase
        .from("king_maker_participants")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();
      p = (upd2 as any) || p;
    }

    setParticipant(p as any);
    if ((p as any)?.task2_instagram_id) setIgInput((p as any).task2_instagram_id);

    // Load leaderboard (top 100 joined)
    const { data: lb } = await supabase
      .from("king_maker_participants")
      .select("id, user_id, joined_at, is_winner")
      .eq("joined", true)
      .order("joined_at", { ascending: true })
      .limit(100);
    setJoinedUsers((lb as any) || []);

    setLoading(false);
  };

  useEffect(() => {
    if (user) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Poll every 15s for status updates
  useEffect(() => {
    if (!user) return;
    const i = setInterval(loadAll, 15000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Reel countdown ticker (1s)
  useEffect(() => {
    const i = setInterval(() => {
      const starts = reelStartedAt.current;
      const positions = Object.keys(starts).map(Number);
      if (positions.length === 0) return;
      setReelRemaining((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const pos of positions) {
          const elapsed = Math.floor((Date.now() - starts[pos]) / 1000);
          const remaining = Math.max(0, 60 - elapsed);
          if (next[pos] !== remaining) {
            next[pos] = remaining;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const tasksDone = useMemo(() => {
    if (!participant) return [false, false, false, false, false];
    return [
      participant.task1_buy_10_completed,
      participant.task2_completed,
      participant.task3_status === "approved",
      participant.task4_reels_completed,
      participant.task5_status === "approved",
    ];
  }, [participant]);

  const allDone = tasksDone.every(Boolean);

  const refreshParticipant = async () => {
    if (!user) return;
    const { data } = await supabase.from("king_maker_participants").select("*").eq("user_id", user.id).single();
    setParticipant(data as any);
  };

  const submitInstagramId = async () => {
    if (!user || !igInput.trim()) return;
    setSubmittingIg(true);
    const handle = igInput.trim().replace(/^@/, "");
    const { error } = await supabase
      .from("king_maker_participants")
      .update({ task2_instagram_id: handle, task2_completed: true })
      .eq("user_id", user.id);
    setSubmittingIg(false);
    if (error) {
      if (error.code === "23505" || error.message?.includes("duplicate")) {
        toast.error("This Instagram ID is already used by another participant");
      } else {
        toast.error("Failed to save: " + error.message);
      }
      return;
    }
    toast.success("Instagram ID saved!");
    refreshParticipant();
  };

  const uploadScreenshot = async (taskNum: 3 | 5, file: File) => {
    if (!user) return;
    setUploadingTask(taskNum);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/task${taskNum}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("king-maker-uploads").upload(path, file);
    if (upErr) {
      toast.error("Upload failed: " + upErr.message);
      setUploadingTask(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("king-maker-uploads").getPublicUrl(path);
    const updates: any = taskNum === 3
      ? { task3_screenshot_url: urlData.publicUrl, task3_status: "under_review", task3_submitted_at: new Date().toISOString() }
      : { task5_screenshot_url: urlData.publicUrl, task5_status: "under_review", task5_submitted_at: new Date().toISOString() };
    const { error } = await supabase.from("king_maker_participants").update(updates).eq("user_id", user.id);
    setUploadingTask(null);
    if (error) {
      toast.error("Failed to submit: " + error.message);
      return;
    }
    toast.success("Screenshot submitted — under review");
    refreshParticipant();
  };

  const playReel = (pos: number, url: string) => {
    window.open(url, "_blank");
    setReelPlayed((prev) => ({ ...prev, [pos]: true }));
    reelStartedAt.current[pos] = Date.now();
    setReelRemaining((prev) => ({ ...prev, [pos]: 60 }));
  };

  const markReelDone = async (pos: number) => {
    setReelDone((prev) => ({ ...prev, [pos]: true }));
    const newCount = Object.keys({ ...reelDone, [pos]: true }).length;
    if (!user) return;
    if (newCount >= 4) {
      await supabase.from("king_maker_participants").update({ task4_reels_completed: true, task4_progress: 4 }).eq("user_id", user.id);
      toast.success("All reels complete!");
      refreshParticipant();
    } else {
      await supabase.from("king_maker_participants").update({ task4_progress: newCount }).eq("user_id", user.id);
    }
  };

  const handleJoin = async () => {
    if (!user || !allDone) return;
    const { error } = await supabase
      .from("king_maker_participants")
      .update({ joined: true, joined_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("🎉 You've joined the King Maker event!");
    refreshParticipant();
    loadAll();
  };

  const referralLink = `${window.location.origin}/?ref=${user?.id?.slice(0, 8) || ""}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const downloadPoster = async () => {
    if (!event?.poster_image_url) {
      toast.error("Poster not yet uploaded by admin");
      return;
    }
    try {
      const res = await fetch(event.poster_image_url);
      const blob = await res.blob();
      const ext = (event.poster_image_url.split(".").pop() || "jpg").split("?")[0];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prop-gym-king-maker-poster.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Poster downloaded");
    } catch {
      window.open(event.poster_image_url, "_blank");
    }
  };

  if (authLoading || loading || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">Loading event…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO BANNER */}
      <section
        className="relative overflow-hidden border-b border-border"
        style={
          event.banner_image_url
            ? { backgroundImage: `url(${event.banner_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary-light/80 to-primary/90" />
        <div className="relative container mx-auto px-4 py-10 md:py-16 text-center text-primary-foreground">
          <Badge className="mb-3 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
            <Crown className="h-3 w-3 mr-1" /> {event.event_name} Event
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold mb-3 drop-shadow-lg">
            {event.banner_title}
          </h1>
          <p className="text-base md:text-xl mb-6 opacity-95">{event.banner_subtitle}</p>
          <div className="mb-2 text-xs md:text-sm uppercase tracking-wider opacity-90">Results announced in</div>
          <CountdownTimer target={event.result_announcement_at} />
        </div>
      </section>

      {/* RULES BOX */}
      <section className="container mx-auto px-4 py-8">
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-6">
            <h2 className="text-xl md:text-2xl font-display font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> $30K Master Account Rules
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                "5% Daily Drawdown",
                "10% Maximum Drawdown",
                "Weekly Payouts",
                "90% Profit Split",
                "No News Trading",
                "No other rules",
              ].map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Worth ~$150 — FREE for {event.total_winners} winners</p>
          </CardContent>
        </Card>
      </section>

      {/* TASKS */}
      <section className="container mx-auto px-4 pb-8 max-w-3xl">
        <h2 className="text-2xl font-display font-bold mb-4">Complete Tasks to Enter</h2>
        <div className="space-y-4">
          {/* Task 1 */}
          <Card className="p-5 gradient-card">
            <TaskHeader idx={1} title="Buy a $10 Instant Funded Account" done={tasksDone[0]} />
            {!tasksDone[0] && (
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground" onClick={() => navigate("/buy-challenge?type=instant_10")}>
                Buy $10 Account <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            )}
          </Card>

          {/* Task 2 — IG ID */}
          <Card className="p-5 gradient-card">
            <TaskHeader idx={2} title="Enter your Instagram username" done={tasksDone[1]} />
            <div className="flex gap-2">
              <Input
                placeholder="@yourhandle"
                value={igInput}
                onChange={(e) => setIgInput(e.target.value)}
                disabled={tasksDone[1]}
              />
              <Button onClick={submitInstagramId} disabled={tasksDone[1] || submittingIg || !igInput.trim()}>
                {submittingIg ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </Card>

          {/* Task 3 — Follow IG */}
          <Card className="p-5 gradient-card">
            <TaskHeader idx={3} title="Follow Prop Gym on Instagram" done={tasksDone[2]} />
            <div className="flex flex-wrap gap-2 items-center mb-3">
              <Button variant="outline" size="sm" onClick={() => window.open(event.instagram_profile_url || "#", "_blank")}>
                <Instagram className="h-4 w-4 mr-2" /> Open Instagram
              </Button>
              {participant?.task3_status && participant.task3_submitted_at && <StatusBadge status={participant.task3_status} />}
            </div>
            {!tasksDone[2] && (
              <div className="flex gap-2 items-center">
                <input
                  ref={fileRef3}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadScreenshot(3, e.target.files[0])}
                />
                <Button size="sm" variant="secondary" onClick={() => fileRef3.current?.click()} disabled={uploadingTask === 3}>
                  {uploadingTask === 3 ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Screenshot & Done
                </Button>
              </div>
            )}
          </Card>

          {/* Task 4 — Reels */}
          <Card className="p-5 gradient-card">
            <TaskHeader idx={4} title="Watch & like 4 Reels" done={tasksDone[3]} />
            <p className="text-xs text-muted-foreground mb-3">
              Click <strong>Play Reel</strong>, watch it for 60 seconds, then the Done button will unlock.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reels.map((r) => {
                const done = reelDone[r.position] || tasksDone[3];
                const played = reelPlayed[r.position] || done;
                const remaining = reelRemaining[r.position] ?? (played ? 0 : 60);
                const ready = played && remaining <= 0;
                let label: React.ReactNode = "Done";
                if (done) label = <><CheckCircle2 className="h-4 w-4 mr-1" />Done</>;
                else if (!played) label = "Play first";
                else if (!ready) label = `Wait ${remaining}s`;
                return (
                  <div key={r.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card/40">
                    <div className="text-sm font-semibold">Reel #{r.position}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => !done && playReel(r.position, r.reel_url)}
                      disabled={done}
                    >
                      <Play className="h-4 w-4 mr-1" /> Play Reel
                    </Button>
                    <Button
                      size="sm"
                      variant={done ? "default" : "secondary"}
                      onClick={() => ready && !done && markReelDone(r.position)}
                      disabled={done || !ready}
                    >
                      {label}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Task 5 — Poster share */}
          <Card className="p-5 gradient-card">
            <TaskHeader idx={5} title="Share poster on your Instagram story" done={tasksDone[4]} />
            {event.poster_image_url ? (
              <div className="mb-3">
                <img
                  src={event.poster_image_url}
                  alt="King Maker Poster"
                  className="max-h-64 w-auto rounded-lg border border-border shadow-sm"
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">Poster will appear here once admin uploads it.</p>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              <Button size="sm" variant="outline" onClick={downloadPoster}>
                <Download className="h-4 w-4 mr-2" /> Download Poster
              </Button>
              <Button size="sm" variant="outline" onClick={copyReferral}>
                <Copy className="h-4 w-4 mr-2" /> Copy Link
              </Button>
              {participant?.task5_status && participant.task5_submitted_at && <StatusBadge status={participant.task5_status} />}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Put this poster on your Instagram story along with your referral link, and mention <strong>@PropGym</strong>. Then upload a screenshot below and click Promoted.
            </p>
            {!tasksDone[4] && (
              <div>
                <input
                  ref={fileRef5}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadScreenshot(5, e.target.files[0])}
                />
                <Button size="sm" className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground" onClick={() => fileRef5.current?.click()} disabled={uploadingTask === 5}>
                  {uploadingTask === 5 ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Screenshot & Promoted
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* JOIN BUTTON */}
        <div className="mt-8 text-center">
          {participant?.joined ? (
            <Badge className="bg-primary text-primary-foreground text-base px-6 py-2">
              <CheckCircle2 className="h-5 w-5 mr-2" /> You've Joined!
            </Badge>
          ) : (
            <Button
              size="lg"
              disabled={!allDone}
              onClick={handleJoin}
              className="w-full sm:w-auto px-12 py-6 text-lg font-bold bg-gradient-to-r from-primary via-primary-light to-primary text-primary-foreground disabled:opacity-50"
            >
              <Crown className="h-6 w-6 mr-2" /> Join King Maker Event
            </Button>
          )}
          {!allDone && <p className="text-xs text-muted-foreground mt-2">Complete all 5 tasks to unlock</p>}
        </div>
      </section>

      {/* LEADERBOARD (only when joined) */}
      {participant?.joined && (
        <section className="container mx-auto px-4 pb-12 max-w-3xl">
          <Card className="gradient-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Leaderboard
              </h2>
              <div className="space-y-2">
                {/* Pin current user */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <span className="font-semibold">You</span>
                  {participant.is_winner ? (
                    <Badge className="bg-primary text-primary-foreground"><Trophy className="h-3 w-3 mr-1" /> Winner</Badge>
                  ) : event.winners_announced ? (
                    <Badge variant="outline">Not selected</Badge>
                  ) : (
                    <Badge variant="secondary">Joined</Badge>
                  )}
                </div>
                {joinedUsers
                  .filter((u) => u.user_id !== user?.id)
                  .map((u, i) => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
                      <span className="text-sm text-muted-foreground">User #{u.user_id.slice(0, 6)}…</span>
                      {u.is_winner ? (
                        <Badge className="bg-primary/20 text-primary text-xs"><Trophy className="h-3 w-3 mr-1" /> Winner</Badge>
                      ) : event.winners_announced ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Badge variant="outline" className="text-xs">Joined</Badge>
                      )}
                    </div>
                  ))}
                {joinedUsers.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">Waiting for more participants…</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload as UploadIcon, X, Plus, Image as ImageIcon } from "lucide-react";

const CATEGORIES = [
  "South Hindi Dubbed",
  "Hollywood Hindi Dubbed",
  "Bollywood",
  "Web Series"
];

// Admin email - bypasses subscription check
const ADMIN_EMAIL = "tilaks631@gmail.com";

const LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada"];

const KEYWORD_SUGGESTIONS: Record<string, string[]> = {
  "South Hindi Dubbed": ["south movie", "hindi dubbed", "action", "thriller", "mass", "2024", "2025"],
  "Hollywood Hindi Dubbed": ["hollywood", "hindi dubbed", "english movie", "action", "sci-fi", "marvel", "2024", "2025"],
  "Bollywood": ["bollywood", "hindi movie", "drama", "romance", "comedy", "2024", "2025"],
  "Web Series": ["web series", "episodes", "season", "streaming", "thriller", "drama", "2024", "2025"],
};

function getSuggestedKeywords(category: string, language: string): string[] {
  const suggestions = new Set<string>();
  if (category && KEYWORD_SUGGESTIONS[category]) {
    KEYWORD_SUGGESTIONS[category].forEach(k => suggestions.add(k));
  }
  if (language) suggestions.add(language.toLowerCase());
  suggestions.add("throtoz");
  suggestions.add("free download");
  return Array.from(suggestions);
}

interface Episode {
  episode_number: number;
  episode_title: string;
  episode_link: string;
}

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [isWebSeries, setIsWebSeries] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([
    { episode_number: 1, episode_title: "", episode_link: "" }
  ]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    language: "",
    description: "",
    direct_link: "",
    seo_keywords: ""
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Check subscription on load - Admin bypasses this check
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      // Admin has lifetime access - bypass subscription check
      if (user.email === ADMIN_EMAIL) {
        setHasActiveSubscription(true);
        setCheckingSubscription(false);
        return;
      }
      
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .eq("payment_verified", true)
        .gte("expiry_date", new Date().toISOString())
        .maybeSingle();
      
      setHasActiveSubscription(!!data);
      setCheckingSubscription(false);
    };
    checkSubscription();
  }, [user]);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5242880) {
        toast.error("Poster size must be less than 5MB");
        return;
      }
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5242880) {
        toast.error("Screenshot size must be less than 5MB");
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const addEpisode = () => {
    setEpisodes([
      ...episodes,
      { episode_number: episodes.length + 1, episode_title: "", episode_link: "" }
    ]);
  };

  const removeEpisode = (index: number) => {
    if (episodes.length > 1) {
      setEpisodes(episodes.filter((_, i) => i !== index));
    }
  };

  const updateEpisode = (index: number, field: keyof Episode, value: string | number) => {
    const updated = [...episodes];
    updated[index] = { ...updated[index], [field]: value };
    setEpisodes(updated);
  };

  const checkDuplicate = async () => {
    const { data } = await supabase
      .from("movies")
      .select("id, title")
      .or(`title.ilike.%${formData.title}%,direct_link.eq.${formData.direct_link}`)
      .limit(1);

    return data && data.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!posterFile) {
        toast.error("Please upload a poster");
        return;
      }

      if (!formData.title || !formData.category || !formData.language) {
        toast.error("Please fill all required fields");
        return;
      }

      if (!isWebSeries && !formData.direct_link) {
        toast.error("Please provide download link");
        return;
      }

      if (isWebSeries && episodes.some(ep => !ep.episode_title || !ep.episode_link)) {
        toast.error("Please fill all episode details");
        return;
      }

      // Check duplicate
      const isDuplicate = await checkDuplicate();
      if (isDuplicate) {
        toast.error("A movie with similar title or link already exists!");
        return;
      }

      // Upload poster
      const fileExt = posterFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("movie-posters")
        .upload(fileName, posterFile);

      if (uploadError) throw uploadError;

      const posterUrl = supabase.storage.from("movie-posters").getPublicUrl(fileName).data.publicUrl;

      // Upload screenshot if provided
      let screenshotUrl = null;
      if (screenshotFile) {
        const screenshotExt = screenshotFile.name.split(".").pop();
        const screenshotName = `screenshot-${user.id}-${Date.now()}.${screenshotExt}`;
        const { error: screenshotError } = await supabase.storage
          .from("movie-posters")
          .upload(screenshotName, screenshotFile);
        
        if (screenshotError) throw screenshotError;
        
        screenshotUrl = supabase.storage.from("movie-posters").getPublicUrl(screenshotName).data.publicUrl;
      }

      // Insert movie
      const { data: movie, error: movieError } = await supabase
        .from("movies")
        .insert({
          title: formData.title,
          category: formData.category,
          language: formData.language,
          description: formData.description,
          poster_url: posterUrl,
          screenshot_url: screenshotUrl,
          direct_link: isWebSeries ? null : formData.direct_link,
          is_web_series: isWebSeries,
          uploader_id: user.id
        })
        .select()
        .single();

      if (movieError) throw movieError;

      // Insert episodes if web series
      if (isWebSeries) {
        const { error: episodesError } = await supabase
          .from("episodes")
          .insert(
            episodes.map(ep => ({
              movie_id: movie.id,
              episode_number: ep.episode_number,
              episode_title: ep.episode_title,
              episode_link: ep.episode_link
            }))
          );

        if (episodesError) throw episodesError;
      }

      toast.success("Upload successful! Your content is now live.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Show subscription required message if no active subscription
  if (!hasActiveSubscription && !checkingSubscription) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-6xl">🔒</div>
            <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Subscription Required
            </h2>
            <p className="text-muted-foreground text-lg">
              You need an active subscription to upload movies and web series.
            </p>
            <Button 
              onClick={() => navigate("/subscriptions")}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-light"
            >
              View Subscription Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-display font-bold mb-8 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          Upload Content
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Poster Upload */}
          <div className="space-y-2">
            <Label>Movie Poster *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              {posterPreview ? (
                <div className="relative inline-block">
                  <img src={posterPreview} alt="Preview" className="max-h-64 rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      setPosterFile(null);
                      setPosterPreview("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Click to upload poster</p>
                  <p className="text-sm text-muted-foreground">Max 5MB (JPG, PNG, WEBP)</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Movie Screenshot Upload */}
          <div className="space-y-2">
            <Label>Movie Scene Screenshot (Optional)</Label>
            <p className="text-xs text-muted-foreground">Upload a screenshot from the movie scene</p>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              {screenshotPreview ? (
                <div className="relative inline-block">
                  <img src={screenshotPreview} alt="Screenshot" className="max-h-48 rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      setScreenshotFile(null);
                      setScreenshotPreview("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Click to upload screenshot</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter movie/series title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Select value={formData.language} onValueChange={(val) => setFormData({ ...formData, language: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description about the content"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Web Series Toggle */}
          <div className="flex items-center space-x-2">
            <Switch checked={isWebSeries} onCheckedChange={setIsWebSeries} />
            <Label>This is a Web Series</Label>
          </div>

          {/* Direct Link or Episodes */}
          {!isWebSeries ? (
            <div className="space-y-2">
              <Label htmlFor="direct_link">Download Link *</Label>
              <Input
                id="direct_link"
                type="url"
                placeholder="https://example.com/download"
                value={formData.direct_link}
                onChange={(e) => setFormData({ ...formData, direct_link: e.target.value })}
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Episodes</Label>
                <Button type="button" size="sm" variant="outline" onClick={addEpisode}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Episode
                </Button>
              </div>
              <div className="space-y-4">
                {episodes.map((ep, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">Episode {ep.episode_number}</p>
                      {episodes.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeEpisode(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Episode title"
                      value={ep.episode_title}
                      onChange={(e) => updateEpisode(idx, "episode_title", e.target.value)}
                      required
                    />
                    <Input
                      type="url"
                      placeholder="Episode download link"
                      value={ep.episode_link}
                      onChange={(e) => updateEpisode(idx, "episode_link", e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Keywords */}
          <div className="space-y-2">
            <Label htmlFor="seo_keywords">SEO Keywords (Optional)</Label>
            <Textarea
              id="seo_keywords"
              placeholder="action, thriller, hindi dubbed, 2024, blockbuster"
              value={formData.seo_keywords}
              onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated keywords to help users find this content in search
            </p>
            {(formData.category || formData.language) && (
              <div className="flex flex-wrap gap-2 mt-2">
                <p className="text-xs text-muted-foreground w-full">Suggested:</p>
                {getSuggestedKeywords(formData.category, formData.language).map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    className="px-2 py-1 text-xs rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    onClick={() => {
                      const existing = formData.seo_keywords.split(",").map(k => k.trim()).filter(Boolean);
                      if (!existing.includes(kw)) {
                        setFormData({
                          ...formData,
                          seo_keywords: existing.length ? `${formData.seo_keywords}, ${kw}` : kw
                        });
                      }
                    }}
                  >
                    + {kw}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary-light"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload & Publish"}
          </Button>
        </form>
      </div>
    </div>
  );
}

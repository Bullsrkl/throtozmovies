import { useState } from "react";
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
import { Upload as UploadIcon, X, Plus } from "lucide-react";

const CATEGORIES = [
  "South Hindi Dubbed",
  "Hollywood Hindi Dubbed",
  "Bollywood",
  "Web Series"
];

const LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada"];

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
  const [isWebSeries, setIsWebSeries] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([
    { episode_number: 1, episode_title: "", episode_link: "" }
  ]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    language: "",
    description: "",
    direct_link: ""
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

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

      // Insert movie
      const { data: movie, error: movieError } = await supabase
        .from("movies")
        .insert({
          title: formData.title,
          category: formData.category,
          language: formData.language,
          description: formData.description,
          poster_url: posterUrl,
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

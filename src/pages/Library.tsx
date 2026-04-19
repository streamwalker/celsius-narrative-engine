
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatTimeSince } from '@/hooks/useAutoSave';
import type { User } from '@supabase/supabase-js';

interface DraftRow {
  id: string;
  title: string;
  version_label: string;
  format: string;
  updated_at: string;
}

const FORMAT_LABELS: Record<string, string> = {
  'graphic-novel': 'Graphic Novel',
  television: 'Television',
  'feature-film': 'Feature Film',
  'stage-play': 'Stage Play',
};

export default function Library() {
  const supabase = supabase;
  const [user, setUser] = useState<User | null>(null);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('script_drafts')
      .select('id,title,version_label,format,updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setDrafts(data);
        setLoading(false);
      });
  }, [user, supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft permanently?')) return;
    const { error } = await supabase.from('script_drafts').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    setDrafts((d) => d.filter((row) => row.id !== id));
    toast({ title: 'Draft deleted' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-display text-2xl tracking-wider">Library</h1>
          </div>
          <Link to="/script-formatter">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Draft
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Sign in to view your saved drafts.</p>
            </CardContent>
          </Card>
        ) : drafts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-4">No drafts yet.</p>
              <Link to="/script-formatter">
                <Button>Create your first draft</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {drafts.map((d) => (
              <Card key={d.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-4 flex items-center gap-4">
                  <Link to={`/script-formatter/${d.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold truncate">{d.title}</span>
                      <span className="font-mono text-xs text-muted-foreground shrink-0">{d.version_label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span>{FORMAT_LABELS[d.format] ?? d.format}</span>
                      <span>·</span>
                      <span>updated {formatTimeSince(new Date(d.updated_at))}</span>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(d.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

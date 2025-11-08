'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

type PracticeVocabulary = {
  id: string;
  macedonian: string;
  english: string;
  category: string | null;
  difficulty: string;
  isActive: boolean;
  createdAt: string;
};

type FormData = Omit<PracticeVocabulary, 'id' | 'createdAt'>;

const emptyForm: FormData = {
  macedonian: '',
  english: '',
  category: null,
  difficulty: 'beginner',
  isActive: true,
};

export default function PracticeVocabularyAdmin() {
  const [words, setWords] = useState<PracticeVocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const res = await fetch('/api/admin/practice-vocabulary');
      if (res.ok) {
        const data = await res.json();
        setWords(data);
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/admin/practice-vocabulary/${editingId}`
        : '/api/admin/practice-vocabulary';

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchWords();
        setShowForm(false);
        setEditingId(null);
        setFormData(emptyForm);
      } else {
        alert('Error saving word');
      }
    } catch (error) {
      console.error('Error saving word:', error);
      alert('Error saving word');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (word: PracticeVocabulary) => {
    setFormData({
      macedonian: word.macedonian,
      english: word.english,
      category: word.category,
      difficulty: word.difficulty,
      isActive: word.isActive,
    });
    setEditingId(word.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      const res = await fetch(`/api/admin/practice-vocabulary/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchWords();
      } else {
        alert('Error deleting word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      alert('Error deleting word');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Group words by difficulty
  const grouped = words.reduce((acc, word) => {
    const key = word.difficulty;
    if (!acc[key]) acc[key] = [];
    acc[key].push(word);
    return acc;
  }, {} as Record<string, PracticeVocabulary[]>);

  return (
    <div className="space-y-8 px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Vocabulary</h1>
          <p className="text-muted-foreground mt-2">
            Manage the word bank for Quick Practice exercises
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Word
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Word' : 'Add New Word'}</CardTitle>
            <CardDescription>
              Add vocabulary words for practice exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="macedonian">Macedonian Word *</Label>
                  <Input
                    id="macedonian"
                    value={formData.macedonian}
                    onChange={(e) => setFormData({ ...formData, macedonian: e.target.value })}
                    required
                    placeholder="книга"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="english">English Translation *</Label>
                  <Input
                    id="english"
                    value={formData.english}
                    onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                    required
                    placeholder="book"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value || null })}
                    placeholder="e.g., food, family, greetings"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active (include in practice exercises)</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2 grid-cols-3 text-center">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Beginner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grouped['beginner']?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Intermediate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grouped['intermediate']?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Advanced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grouped['advanced']?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Words ({words.length})</CardTitle>
          <CardDescription>
            Sorted by creation date (newest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {words.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No words yet. Click &quot;Add Word&quot; to create your first entry.
            </p>
          ) : (
            <div className="space-y-2">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 flex items-center gap-4">
                    <div>
                      <div className="font-medium">{word.macedonian} → {word.english}</div>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-primary/10 text-primary">
                          {word.difficulty}
                        </span>
                        {word.category && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-secondary/10 text-secondary">
                            {word.category}
                          </span>
                        )}
                        <span className={word.isActive ? 'text-green-600' : 'text-orange-600'}>
                          {word.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(word)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(word.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

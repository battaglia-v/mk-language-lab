'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

type WordOfTheDay = {
  id: string;
  macedonian: string;
  pronunciation: string;
  english: string;
  partOfSpeech: string;
  exampleMk: string;
  exampleEn: string;
  icon: string;
  scheduledDate: string;
  isActive: boolean;
  createdAt: string;
};

type FormData = Omit<WordOfTheDay, 'id' | 'createdAt'>;

const emptyForm: FormData = {
  macedonian: '',
  pronunciation: '',
  english: '',
  partOfSpeech: '',
  exampleMk: '',
  exampleEn: '',
  icon: '📚',
  scheduledDate: new Date().toISOString().split('T')[0],
  isActive: true,
};

export default function WordOfTheDayAdmin() {
  const [words, setWords] = useState<WordOfTheDay[]>([]);
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
      const res = await fetch('/api/admin/word-of-the-day');
      if (res.ok) {
        const data = await res.json();
        setWords(data);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/admin/word-of-the-day/${editingId}`
        : '/api/admin/word-of-the-day';

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

  const handleEdit = (word: WordOfTheDay) => {
    setFormData({
      macedonian: word.macedonian,
      pronunciation: word.pronunciation,
      english: word.english,
      partOfSpeech: word.partOfSpeech,
      exampleMk: word.exampleMk,
      exampleEn: word.exampleEn,
      icon: word.icon,
      scheduledDate: word.scheduledDate.split('T')[0],
      isActive: word.isActive,
    });
    setEditingId(word.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      const res = await fetch(`/api/admin/word-of-the-day/${id}`, {
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

  return (
    <div className="space-y-8 px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Word of the Day</h1>
          <p className="text-muted-foreground mt-2">
            Manage daily featured vocabulary words
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
              Fill in the details for the Word of the Day
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
                    placeholder="здраво"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pronunciation">Pronunciation *</Label>
                  <Input
                    id="pronunciation"
                    value={formData.pronunciation}
                    onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                    required
                    placeholder="zdravo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="english">English Translation *</Label>
                  <Input
                    id="english"
                    value={formData.english}
                    onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                    required
                    placeholder="hello"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partOfSpeech">Part of Speech *</Label>
                  <Input
                    id="partOfSpeech"
                    value={formData.partOfSpeech}
                    onChange={(e) => setFormData({ ...formData, partOfSpeech: e.target.value })}
                    required
                    placeholder="greeting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Emoji Icon *</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    required
                    placeholder="👋"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exampleMk">Example Sentence (Macedonian) *</Label>
                <Textarea
                  id="exampleMk"
                  value={formData.exampleMk}
                  onChange={(e) => setFormData({ ...formData, exampleMk: e.target.value })}
                  required
                  placeholder="Здраво, како си?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exampleEn">Example Sentence (English) *</Label>
                <Textarea
                  id="exampleEn"
                  value={formData.exampleEn}
                  onChange={(e) => setFormData({ ...formData, exampleEn: e.target.value })}
                  required
                  placeholder="Hello, how are you?"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active (visible to users)</Label>
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

      <Card>
        <CardHeader>
          <CardTitle>All Words ({words.length})</CardTitle>
          <CardDescription>
            Sorted by scheduled date (newest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {words.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No words yet. Click &quot;Add Word&quot; to create your first entry.
            </p>
          ) : (
            <div className="space-y-4">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="flex items-start justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{word.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {word.macedonian} <span className="text-muted-foreground">({word.pronunciation})</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {word.english} • {word.partOfSpeech}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm"><span className="font-medium">MK:</span> {word.exampleMk}</p>
                    <p className="text-sm text-muted-foreground">{word.exampleEn}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                      <span>📅 {new Date(word.scheduledDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={word.isActive ? 'text-green-600' : 'text-orange-600'}>
                        {word.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
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

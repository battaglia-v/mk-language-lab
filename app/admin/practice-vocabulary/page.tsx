import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function PracticeVocabularyAdmin() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Vocabulary</h1>
          <p className="text-muted-foreground mt-2">
            Manage the word bank for Quick Practice exercises
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Word
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Bank</CardTitle>
          <CardDescription>
            Coming soon - interface to manage practice vocabulary words
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This interface will allow you to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Add new Macedonian ↔ English word pairs</li>
            <li>Categorize words (e.g., food, family, greetings)</li>
            <li>Set difficulty levels (beginner, intermediate, advanced)</li>
            <li>Mark words as active/inactive</li>
            <li>Bulk import words from CSV</li>
            <li>Edit or delete existing words</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

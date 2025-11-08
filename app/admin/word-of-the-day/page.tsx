import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function WordOfTheDayAdmin() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Word of the Day</h1>
          <p className="text-muted-foreground mt-2">
            Manage daily featured vocabulary words
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Word
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Words List</CardTitle>
          <CardDescription>
            Coming soon - interface to add, edit, and schedule words for specific dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This interface will allow you to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Add new vocabulary words with Macedonian and English translations</li>
            <li>Add pronunciation, part of speech, and example sentences</li>
            <li>Schedule words for specific dates</li>
            <li>Edit or delete existing words</li>
            <li>Preview how words will appear to users</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

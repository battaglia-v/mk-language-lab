'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: string;
  title: string;
  description: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-card border border-border rounded-lg p-4 mb-3 cursor-move hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start gap-2">
        <div {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  totalColumns,
  onDeleteColumn,
  emptyHint,
}: {
  column: Column;
  totalColumns: number;
  onDeleteColumn: (columnId: string) => void;
  emptyHint: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {column.title}
            <span className="text-sm font-normal text-muted-foreground">({column.tasks.length})</span>
          </CardTitle>
          {totalColumns > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteColumn(column.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <SortableContext id={column.id} items={column.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`p-6 pt-0 min-h-[200px] rounded-lg border border-dashed border-transparent transition-colors ${
            isOver ? 'border-primary/40 bg-primary/5' : ''
          }`}
        >
          {column.tasks.length > 0 ? (
            column.tasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-6">{emptyHint}</p>
          )}
        </div>
      </SortableContext>
    </Card>
  );
}

export default function TasksPage() {
  const t = useTranslations('tasks');
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: t('todo'), tasks: [] },
    { id: 'in-progress', title: t('inProgress'), tasks: [] },
    { id: 'done', title: t('done'), tasks: [] },
  ]);
  const [newTaskColumn, setNewTaskColumn] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const emptyColumnHint = t('emptyColumnHint');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kanban-board');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColumns(parsed);
      } catch (e) {
        console.error('Failed to parse saved board:', e);
      }
    }
  }, []);

  // Save to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem('kanban-board', JSON.stringify(columns));
  }, [columns]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
    let sourceColumn: Column | undefined;
    let destColumn: Column | undefined;
    let sourceIndex = -1;
    let destIndex = -1;

    columns.forEach((col) => {
      const taskIndex = col.tasks.findIndex((task) => task.id === activeId);
      if (taskIndex !== -1) {
        sourceColumn = col;
        sourceIndex = taskIndex;
      }

      const destTaskIndex = col.tasks.findIndex((task) => task.id === overId);
      if (destTaskIndex !== -1) {
        destColumn = col;
        destIndex = destTaskIndex;
      }

      // Check if dropped on column itself
      if (col.id === overId) {
        destColumn = col;
        destIndex = col.tasks.length;
      }
    });

    if (!sourceColumn || !destColumn) return;

    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex((c) => c.id === sourceColumn!.id);
    const destColIndex = newColumns.findIndex((c) => c.id === destColumn!.id);

    if (sourceColumn.id === destColumn.id && sourceIndex === destIndex) {
      return;
    }

    // Remove from source
    const [movedTask] = newColumns[sourceColIndex].tasks.splice(sourceIndex, 1);

    // Add to destination
    if (destIndex === -1) {
      destIndex = newColumns[destColIndex].tasks.length;
    }
    newColumns[destColIndex].tasks.splice(destIndex, 0, movedTask);

    setColumns(newColumns);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskColumn) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
    };

    const newColumns = columns.map((col) => {
      if (col.id === newTaskColumn) {
        return { ...col, tasks: [...col.tasks, newTask] };
      }
      return col;
    });

    setColumns(newColumns);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsDialogOpen(false);
  };

  const handleAddColumn = () => {
    const columnName = prompt(t('columnName'));
    if (!columnName) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      title: columnName,
      tasks: [],
    };

    setColumns([...columns, newColumn]);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 1) return;
    if (!confirm(t('deleteColumn') + '?')) return;

    setColumns(columns.filter((col) => col.id !== columnId));
  };

  return (
    <AuthGuard fallbackHeight="min-h-screen">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addTask')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('addTask')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Column</label>
                    <select
                      value={newTaskColumn}
                      onChange={(e) => setNewTaskColumn(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    >
                      <option value="">Select column...</option>
                      {columns.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('taskTitle')}</label>
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder={t('taskTitle')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('taskDescription')}</label>
                    <Textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder={t('taskDescription')}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddTask} className="w-full">
                    {t('create')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleAddColumn}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addColumn')}
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                totalColumns={columns.length}
                onDeleteColumn={handleDeleteColumn}
                emptyHint={emptyColumnHint}
              />
            ))}
          </div>
        </DndContext>
      </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span></p>
        </div>
      </footer>
    </AuthGuard>
  );
}

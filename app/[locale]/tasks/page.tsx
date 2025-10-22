'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations as useJourneyTranslations } from 'next-intl';
import { isJourneyId } from '@/data/journeys';
import { JOURNEY_PRACTICE_CONTENT } from '@/data/journey-practice-content';

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

const DEFAULT_COLUMN_IDS = ['todo', 'in-progress', 'done'] as const;
type DefaultColumnId = (typeof DEFAULT_COLUMN_IDS)[number];

const isDefaultColumnId = (id: string): id is DefaultColumnId =>
  (DEFAULT_COLUMN_IDS as readonly string[]).includes(id);

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
      className="bg-card border border-border rounded-lg p-4 mb-3 cursor-move select-none hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start gap-2">
        <div {...listeners} className="cursor-grab active:cursor-grabbing mt-1 touch-none">
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
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

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
  const journeyT = useJourneyTranslations('journey');
  const searchParams = useSearchParams();

  const defaultColumnTitles = useMemo(
    () => ({
      todo: t('todo'),
      'in-progress': t('inProgress'),
      done: t('done'),
    }),
    [t]
  );

  const createDefaultColumns = useCallback(
    (): Column[] =>
      DEFAULT_COLUMN_IDS.map((id) => ({
        id,
        title: defaultColumnTitles[id],
        tasks: [],
      })),
    [defaultColumnTitles]
  );

  const mergeWithDefaultColumns = useCallback(
    (existing: Column[] = []): Column[] => {
      const defaults = createDefaultColumns();

      const mergedDefaults = defaults.map((defaultColumn) => {
        const match = existing.find((column) => column.id === defaultColumn.id);
        if (!match) {
          return defaultColumn;
        }

        return {
          ...defaultColumn,
          tasks: match.tasks,
        };
      });

      const additionalColumns = existing.filter((column) => !isDefaultColumnId(column.id));

      return [...mergedDefaults, ...additionalColumns];
    },
    [createDefaultColumns]
  );

  const [columns, setColumns] = useState<Column[]>(() => mergeWithDefaultColumns());
  const [newTaskColumn, setNewTaskColumn] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [templateApplied, setTemplateApplied] = useState(false);
  const templateAppliedRef = useRef(false);
  const emptyColumnHint = t('emptyColumnHint');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const journeyParam = searchParams?.get('journey') ?? null;
  const journeyId = journeyParam && isJourneyId(journeyParam) ? journeyParam : null;
  const journeyTitle = journeyId ? journeyT(`goals.cards.${journeyId}.title`) : null;
  const journeyPreset = journeyId ? JOURNEY_PRACTICE_CONTENT[journeyId]?.taskPreset ?? null : null;

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kanban-board');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Column[];
        setColumns(mergeWithDefaultColumns(parsed));
      } catch (e) {
        console.error('Failed to parse saved board:', e);
        setColumns(mergeWithDefaultColumns());
      }
    } else {
      setColumns(mergeWithDefaultColumns());
    }
    setIsHydrated(true);
  }, [mergeWithDefaultColumns]);

  useEffect(() => {
    setColumns((previous) => mergeWithDefaultColumns(previous));
  }, [mergeWithDefaultColumns]);

  // Save to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem('kanban-board', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    templateAppliedRef.current = false;
    setTemplateApplied(false);
  }, [journeyId]);

  useEffect(() => {
    if (!isHydrated || templateAppliedRef.current || !journeyPreset) {
      return;
    }

    const boardIsEmpty = columns.every((column) => column.tasks.length === 0);

    if (!boardIsEmpty) {
      return;
    }

    setColumns((previous) => {
      const updated = previous.map((column) => {
        const presetTasks = journeyPreset.columns[column.id as keyof typeof journeyPreset.columns] ?? [];

        if (!presetTasks.length) {
          return column;
        }

        return {
          ...column,
          tasks: presetTasks.map((task, index) => ({
            id: `preset-${column.id}-${index}`,
            title: task.title,
            description: task.description,
          })),
        };
      });

      return updated;
    });

    templateAppliedRef.current = true;
    setTemplateApplied(true);
  }, [columns, isHydrated, journeyPreset]);

  const findColumnIdForItem = useCallback(
    (id: string): string | null => {
      if (columns.some((column) => column.id === id)) {
        return id;
      }

      const match = columns.find((column) => column.tasks.some((task) => task.id === id));
      return match?.id ?? null;
    },
    [columns]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over) {
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);

      const sourceColumnId = findColumnIdForItem(activeId);
      const destinationColumnId = findColumnIdForItem(overId);

      if (!sourceColumnId || !destinationColumnId) {
        return;
      }

      if (sourceColumnId === destinationColumnId) {
        const columnIndex = columns.findIndex((column) => column.id === sourceColumnId);
        if (columnIndex === -1) {
          return;
        }

        const column = columns[columnIndex];
        const oldIndex = column.tasks.findIndex((task) => task.id === activeId);

        if (oldIndex === -1) {
          return;
        }

        let newIndex = column.tasks.findIndex((task) => task.id === overId);
        if (newIndex === -1) {
          newIndex = column.tasks.length - 1;
        }

        if (newIndex === oldIndex || newIndex < 0) {
          return;
        }

        setColumns((previous) =>
          previous.map((col, index) =>
            index === columnIndex
              ? { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) }
              : col
          )
        );
        return;
      }

      const sourceColumnIndex = columns.findIndex((column) => column.id === sourceColumnId);
      const destinationColumnIndex = columns.findIndex((column) => column.id === destinationColumnId);

      if (sourceColumnIndex === -1 || destinationColumnIndex === -1) {
        return;
      }

      const sourceColumn = columns[sourceColumnIndex];
      const destinationColumn = columns[destinationColumnIndex];

      const sourceTaskIndex = sourceColumn.tasks.findIndex((task) => task.id === activeId);
      if (sourceTaskIndex === -1) {
        return;
      }

      const [movedTask] = sourceColumn.tasks.slice(sourceTaskIndex, sourceTaskIndex + 1);
      const destinationTaskIndex = (() => {
        const index = destinationColumn.tasks.findIndex((task) => task.id === overId);
        return index === -1 ? destinationColumn.tasks.length : index;
      })();

      setColumns((previous) =>
        previous.map((col, index) => {
          if (index === sourceColumnIndex) {
            const updatedTasks = [...col.tasks];
            updatedTasks.splice(sourceTaskIndex, 1);
            return { ...col, tasks: updatedTasks };
          }

          if (index === destinationColumnIndex) {
            const updatedTasks = [...col.tasks];
            updatedTasks.splice(destinationTaskIndex, 0, movedTask);
            return { ...col, tasks: updatedTasks };
          }

          return col;
        })
      );
    },
    [columns, findColumnIdForItem]
  );

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
    if (isDefaultColumnId(columnId)) {
      window.alert('Default columns cannot be removed.');
      return;
    }
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

        {journeyPreset && templateApplied ? (
          <div className="mb-8 rounded-lg border border-primary/40 bg-primary/10 p-4">
            <p className="text-sm font-semibold text-primary">
              {t('journeyPresetHeading', { journey: journeyTitle ?? '' })}
            </p>
            <p className="text-sm text-primary/80">{journeyPreset.note}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t('journeyPresetDescription')}</p>
          </div>
        ) : null}

        {/* Kanban Board */}
  <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
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

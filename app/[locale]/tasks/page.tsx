'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
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
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
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
      {...listeners}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-3 cursor-move select-none text-white transition hover:border-primary/50"
      data-testid={`tasks-task-${task.id}`}
    >
      <div className="flex items-start gap-2">
        <div className="cursor-grab active:cursor-grabbing mt-1 touch-none">
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{task.title}</h4>
          {task.description && <p className="text-sm text-slate-300">{task.description}</p>}
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
    <Card className="glass-card rounded-3xl border border-white/10 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {column.title}
            <span className="text-sm font-normal text-slate-300">({column.tasks.length})</span>
          </CardTitle>
          {totalColumns > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteColumn(column.id)}
              className="h-8 w-8 text-white"
              data-testid={`tasks-column-delete-${column.id}`}
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
            <p className="text-sm text-slate-300 italic text-center py-6">{emptyHint}</p>
          )}
        </div>
      </SortableContext>
    </Card>
  );
}

export default function TasksPage() {
  const t = useTranslations('tasks');

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
  const emptyColumnHint = t('emptyColumnHint');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 80,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


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
  }, [mergeWithDefaultColumns]);

  useEffect(() => {
    setColumns((previous) => mergeWithDefaultColumns(previous));
  }, [mergeWithDefaultColumns]);

  // Save to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem('kanban-board', JSON.stringify(columns));
  }, [columns]);


  const findColumnIdForItem = useCallback(
    (id: string, collection: Column[] = columns): string | null => {
      if (collection.some((column) => column.id === id)) {
        return id;
      }

      const match = collection.find((column) => column.tasks.some((task) => task.id === id));
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
      const overColumnId = (over.data.current as { columnId?: string } | undefined)?.columnId;

      setColumns((previous) => {
        const sourceColumnId = findColumnIdForItem(activeId, previous);
        const destinationColumnId = overColumnId ?? findColumnIdForItem(overId, previous);

        if (!sourceColumnId || !destinationColumnId) {
          return previous;
        }

        const sourceColumnIndex = previous.findIndex((column) => column.id === sourceColumnId);
        const destinationColumnIndex = previous.findIndex((column) => column.id === destinationColumnId);

        if (sourceColumnIndex === -1 || destinationColumnIndex === -1) {
          return previous;
        }

        const sourceColumn = previous[sourceColumnIndex];
        const destinationColumn = previous[destinationColumnIndex];
        const sourceTaskIndex = sourceColumn.tasks.findIndex((task) => task.id === activeId);

        if (sourceTaskIndex === -1) {
          return previous;
        }

        if (sourceColumnId === destinationColumnId) {
          let targetIndex = destinationColumn.tasks.findIndex((task) => task.id === overId);

          if (targetIndex === -1) {
            const overData = over.data.current as { columnId?: string } | undefined;
            if (overData?.columnId === destinationColumnId || overId === destinationColumnId) {
              targetIndex = destinationColumn.tasks.length - 1;
            }
          }

          if (targetIndex < 0 || targetIndex === sourceTaskIndex) {
            return previous;
          }

          const reorderedTasks = arrayMove(destinationColumn.tasks, sourceTaskIndex, targetIndex);

          return previous.map((column, index) =>
            index === destinationColumnIndex ? { ...column, tasks: reorderedTasks } : column
          );
        }

        const sourceTasks = [...sourceColumn.tasks];
        const [movedTask] = sourceTasks.splice(sourceTaskIndex, 1);

        if (!movedTask) {
          return previous;
        }

        let destinationTaskIndex = destinationColumn.tasks.findIndex((task) => task.id === overId);
        if (destinationTaskIndex === -1 || findColumnIdForItem(overId, previous) !== destinationColumnId) {
          destinationTaskIndex = destinationColumn.tasks.length;
        }

        const destinationTasks = [...destinationColumn.tasks];
        destinationTasks.splice(destinationTaskIndex, 0, movedTask);

        const next = [...previous];
        next[sourceColumnIndex] = { ...sourceColumn, tasks: sourceTasks };
        next[destinationColumnIndex] = { ...destinationColumn, tasks: destinationTasks };
        return next;
      });
    },
    [findColumnIdForItem]
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
    <AuthGuard fallbackHeight="min-h-screen" signInTestId="tasks-sign-in" cardTestId="tasks-sign-in-card">
      <div className="page-shell">
        <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
          <section data-testid="tasks-hero" className="glass-card rounded-3xl p-6 md:p-8 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">{t('title')}</p>
                <h1 className="text-3xl font-bold md:text-4xl text-white">{t('subtitle')}</h1>
                <p className="text-sm text-slate-300">
                  Organize your study tasks, quests, and reminders.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full" data-testid="tasks-add-task-open">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addTask')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background/90 text-white">
                    <DialogHeader>
                      <DialogTitle>{t('addTask')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Column</label>
                        <select
                          value={newTaskColumn}
                          onChange={(e) => setNewTaskColumn(e.target.value)}
                          className="w-full rounded-2xl border border-white/15 bg-background/80 px-3 py-2 text-white"
                          data-testid="tasks-add-task-column-select"
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
                          className="rounded-2xl border border-white/15 bg-background/80 text-white placeholder:text-slate-400"
                          data-testid="tasks-add-task-title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('taskDescription')}</label>
                        <Textarea
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          placeholder={t('taskDescription')}
                          rows={3}
                          className="rounded-2xl border border-white/15 bg-background/80 text-white placeholder:text-slate-400"
                          data-testid="tasks-add-task-description"
                        />
                      </div>
                      <Button onClick={handleAddTask} className="w-full rounded-full" data-testid="tasks-add-task-submit">
                        {t('create')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={handleAddColumn}
                  className="rounded-full border-white/20 text-white"
                  data-testid="tasks-add-column"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addColumn')}
                </Button>
              </div>
            </div>
          </section>

          <section data-testid="tasks-board">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}

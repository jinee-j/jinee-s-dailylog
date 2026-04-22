import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#2B77E8", "#57A9FB", "#37D4CF", "#23C343", "#FBE842", "#FF9A2E"];

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Queries
  const tasksQuery = trpc.tasks.list.useQuery();
  const statsQuery = trpc.tasks.stats.useQuery();
  const categoriesQuery = trpc.categories.list.useQuery();

  // Mutations
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      statsQuery.refetch();
      setNewTaskTitle("");
      setNewTaskPriority("medium");
      setIsDialogOpen(false);
    },
  });

  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      statsQuery.refetch();
    },
  });

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      tasksQuery.refetch();
      statsQuery.refetch();
    },
  });

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTaskMutation.mutateAsync({
      title: newTaskTitle,
      priority: newTaskPriority as "low" | "medium" | "high",
    });
  };

  const handleToggleTask = async (taskId: number, completed: number) => {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      completed: completed === 1 ? 0 : 1,
    });
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTaskMutation.mutateAsync({ id: taskId });
  };

  const tasks = tasksQuery.data || [];
  const stats = statsQuery.data || { total: 0, completed: 0, completionRate: 0 };

  const chartData = [
    { name: "완료", value: stats.completed },
    { name: "미완료", value: stats.total - stats.completed },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "높음";
      case "medium":
        return "중간";
      case "low":
        return "낮음";
      default:
        return priority;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">데일리로그</h1>
            <p className="text-slate-600 mt-1">주간 업무 관리 대시보드</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation("/settings")}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            설정
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Card */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <CardTitle className="text-slate-900">주간 진행률</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-bold text-blue-600">
                      {stats.completionRate}%
                    </p>
                    <p className="text-slate-600 mt-2">
                      {stats.completed} / {stats.total} 완료
                    </p>
                  </div>
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#2B77E8" />
                          <Cell fill="#E5E7EB" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900">업무 목록</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      새 업무 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 업무 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="업무 제목"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                      />
                      <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">낮음</SelectItem>
                          <SelectItem value="medium">중간</SelectItem>
                          <SelectItem value="high">높음</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddTask}
                        disabled={createTaskMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        추가
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-6">
                {tasksQuery.isLoading ? (
                  <p className="text-slate-500">로딩 중...</p>
                ) : tasks.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    아직 업무가 없습니다. 새 업무를 추가해보세요!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        <Checkbox
                          checked={task.completed === 1}
                          onCheckedChange={() =>
                            handleToggleTask(task.id, task.completed)
                          }
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              task.completed === 1
                                ? "line-through text-slate-400"
                                : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-slate-600 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deleteTaskMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <CardTitle className="text-slate-900">카테고리</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {categoriesQuery.isLoading ? (
                  <p className="text-slate-500">로딩 중...</p>
                ) : (categoriesQuery.data || []).length === 0 ? (
                  <p className="text-slate-500 text-sm">카테고리가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {(categoriesQuery.data || []).map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-slate-100"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-slate-700">
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <CardTitle className="text-slate-900">통계</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-600">전체 업무</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">완료된 업무</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">남은 업무</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.total - stats.completed}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useStore } from "@/src/store/useStore";
import { Card } from "@/src/components/ui/Card";
import { StatusBadge } from "@/src/components/ui/Badge";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { Button } from "@/src/components/ui/Button";
import { MapPin, CalendarClock, Search, X, Plus, FileUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/src/types";

const dictionary = {
  EN: {
    myTasks: "My Tasks",
    myTasksDesc: "Manage and track your assigned tasks.",
    searchPlaceholder: "Search tasks...",
    progress: "Progress",
    update: "Update",
    view: "View",
    updateTask: "Update Task",
    status: "Status",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    all: "All",
    today: "Today",
    upcoming: "Upcoming",
    overdue: "Overdue",
    completed: "Completed",
    taskDetails: "Task Details",
    project: "Project",
    location: "Location",
    dueDate: "Due Date",
    priority: "Priority",
    close: "Close",
    createTask: "Create Task",
    uploadEvidence: "Upload Evidence",
  },
  TH: {
    myTasks: "งานของฉัน",
    myTasksDesc: "จัดการและติดตามงานที่ได้รับมอบหมาย",
    searchPlaceholder: "ค้นหางาน...",
    progress: "ความคืบหน้า",
    update: "อัปเดต",
    view: "ดูข้อมูล",
    updateTask: "อัปเดตงาน",
    status: "สถานะ",
    cancel: "ยกเลิก",
    saveChanges: "บันทึกการเปลี่ยนแปลง",
    all: "ทั้งหมด",
    today: "วันนี้",
    upcoming: "กำลังจะมาถึง",
    overdue: "เกินกำหนด",
    completed: "เสร็จสิ้น",
    taskDetails: "รายละเอียดงาน",
    project: "โครงการ",
    location: "สถานที่",
    dueDate: "วันที่ครบกำหนด",
    priority: "ความสำคัญ",
    close: "ปิด",
    createTask: "สร้างงาน",
    uploadEvidence: "อัปโหลดหลักฐาน",
  },
};

export function Tasks() {
  const { tasks, updateTask, language } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const t = (key: keyof typeof dictionary.EN) => dictionary[language][key];

  const filters = [
    { key: "all", label: t("all") },
    { key: "today", label: t("today") },
    { key: "upcoming", label: t("upcoming") },
    { key: "overdue", label: t("overdue") },
    { key: "completed", label: t("completed") },
  ];

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      progress: task.progress,
      status: task.status,
    });
  };

  const handleSave = () => {
    if (editingTask && editForm) {
      updateTask(editingTask.id, editForm);
      setEditingTask(null);
      setEditForm({});
    }
  };

  const closeModal = () => {
    setEditingTask(null);
    setViewingTask(null);
    setEditForm({});
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t("myTasks")}
          </h1>
          <p className="text-gray-500 text-sm">{t("myTasksDesc")}</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none border-gray-200 hover:bg-gray-50 h-10 text-gray-700"
            onClick={() => navigate("/tasks")}
          >
            <FileUp className="h-4 w-4 mr-2" />
            {t("uploadEvidence")}
          </Button>
          <Button
            className="flex-1 md:flex-none bg-ikm-orange hover:bg-ikm-orange-dark text-white h-10 border-0"
            onClick={() => navigate("/assign")}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("createTask")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] ${
              filter === f.key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-white shadow-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pt-2">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 md:p-5 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-xs font-bold text-gray-400 mb-1">
                    {task.id}
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">
                    {task.title}
                  </h3>
                  <div className="text-sm text-ikm-orange font-medium mt-1">
                    {task.project}
                  </div>
                </div>
                <StatusBadge status={task.status as any} />
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{task.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-gray-400 shrink-0" />
                  <span
                    className={
                      task.dueDate === "Overdue"
                        ? "text-status-red font-medium"
                        : ""
                    }
                  >
                    Due: {task.dueDate}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{t("progress")}</span>
                  <span>{task.progress}%</span>
                </div>
                <ProgressBar
                  value={task.progress}
                  color={
                    task.progress === 100 ? "bg-ikm-green" : "bg-ikm-orange"
                  }
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <Button
                  variant={task.status === "Overdue" ? "danger" : "primary"}
                  className="flex-1"
                  onClick={() => handleEditClick(task)}
                >
                  {t("update")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setViewingTask(task)}
                >
                  {t("view")}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal Overlay */}
      {editingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {t("updateTask")}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs font-bold text-gray-400 mb-1">
                  {editingTask.id}
                </div>
                <h3 className="font-bold text-gray-900">{editingTask.title}</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  {t("status")}
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none bg-white text-sm"
                  value={editForm.status || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value as any })
                  }
                >
                  <option value="Assigned">Assigned</option>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Review">Review</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    {t("progress")}
                  </label>
                  <span className="text-sm font-bold text-ikm-orange">
                    {editForm.progress || 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editForm.progress || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      progress: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-ikm-orange"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <Button variant="outline" onClick={closeModal}>
                {t("cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="bg-ikm-orange hover:bg-ikm-orange-dark text-white border-0"
              >
                {t("saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal Overlay */}
      {viewingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {t("taskDetails")}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="text-xs font-bold text-gray-400 mb-1">
                  {viewingTask.id}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {viewingTask.title}
                </h3>
                <div className="mt-2 flex items-center">
                  <StatusBadge status={viewingTask.status as any} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">{t("project")}</div>
                  <div className="font-semibold text-gray-900">
                    {viewingTask.project}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">{t("priority")}</div>
                  <div className="font-semibold text-gray-900">
                    {viewingTask.priority}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">{t("location")}</div>
                  <div className="font-semibold text-gray-900">
                    {viewingTask.location}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">{t("dueDate")}</div>
                  <div
                    className={`font-semibold ${viewingTask.dueDate === "Overdue" ? "text-status-red" : "text-gray-900"}`}
                  >
                    {viewingTask.dueDate}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{t("progress")}</span>
                  <span>{viewingTask.progress}%</span>
                </div>
                <ProgressBar
                  value={viewingTask.progress}
                  color={
                    viewingTask.progress === 100
                      ? "bg-ikm-green"
                      : "bg-ikm-orange"
                  }
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <Button
                variant="primary"
                onClick={closeModal}
                className="bg-ikm-orange hover:bg-ikm-orange-dark text-white border-0 w-full sm:w-auto"
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

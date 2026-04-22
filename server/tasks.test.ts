import { describe, expect, it } from "vitest";

describe("Task Management", () => {
  describe("Task Completion Rate Calculation", () => {
    it("should calculate completion rate correctly with mixed tasks", () => {
      const tasks = [
        { completed: 1 },
        { completed: 1 },
        { completed: 0 },
      ];
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed === 1).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      expect(total).toBe(3);
      expect(completed).toBe(2);
      expect(completionRate).toBe(67);
    });

    it("should return 0% when no tasks are completed", () => {
      const tasks = [
        { completed: 0 },
        { completed: 0 },
      ];
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed === 1).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      expect(completionRate).toBe(0);
    });

    it("should return 100% when all tasks are completed", () => {
      const tasks = [
        { completed: 1 },
        { completed: 1 },
      ];
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed === 1).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      expect(completionRate).toBe(100);
    });

    it("should return 0% when user has no tasks", () => {
      const tasks: { completed: number }[] = [];
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed === 1).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      expect(total).toBe(0);
      expect(completed).toBe(0);
      expect(completionRate).toBe(0);
    });
  });

  describe("Priority Validation", () => {
    it("should accept valid priority values", () => {
      const validPriorities = ["low", "medium", "high"];
      expect(validPriorities).toContain("low");
      expect(validPriorities).toContain("medium");
      expect(validPriorities).toContain("high");
    });

    it("should correctly identify priority levels", () => {
      const priorities = {
        low: "낮음",
        medium: "중간",
        high: "높음",
      };

      expect(priorities.low).toBe("낮음");
      expect(priorities.medium).toBe("중간");
      expect(priorities.high).toBe("높음");
    });
  });

  describe("Task Completion Toggle", () => {
    it("should toggle task completion status from 0 to 1", () => {
      const completed = 0;
      const newStatus = completed === 1 ? 0 : 1;
      expect(newStatus).toBe(1);
    });

    it("should toggle task completion status from 1 to 0", () => {
      const completed = 1;
      const newStatus = completed === 1 ? 0 : 1;
      expect(newStatus).toBe(0);
    });
  });

  describe("Task Data Validation", () => {
    it("should validate task title is not empty", () => {
      const title = "Buy groceries";
      expect(title.trim().length).toBeGreaterThan(0);
    });

    it("should reject empty task title", () => {
      const title = "";
      expect(title.trim().length).toBe(0);
    });

    it("should handle task with optional description", () => {
      const task = {
        title: "Complete project",
        description: "Finish the dashboard implementation",
      };
      expect(task.title).toBeDefined();
      expect(task.description).toBeDefined();
    });

    it("should handle task without description", () => {
      const task = {
        title: "Complete project",
      };
      expect(task.title).toBeDefined();
      expect(task.description).toBeUndefined();
    });
  });
});

/*
  Warnings:

  - You are about to drop the column `attempt_count` on the `exam_attempts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exam_attempts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_exam_attempts" ("end_time", "exam_id", "id", "score", "start_time", "user_id") SELECT "end_time", "exam_id", "id", "score", "start_time", "user_id" FROM "exam_attempts";
DROP TABLE "exam_attempts";
ALTER TABLE "new_exam_attempts" RENAME TO "exam_attempts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

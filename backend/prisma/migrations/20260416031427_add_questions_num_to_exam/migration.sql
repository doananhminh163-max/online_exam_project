-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "duration_mins" INTEGER NOT NULL,
    "attempts_num" INTEGER NOT NULL DEFAULT 2,
    "questions_num" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_exams" ("attempts_num", "duration_mins", "end_time", "id", "name", "start_time") SELECT "attempts_num", "duration_mins", "end_time", "id", "name", "start_time" FROM "exams";
DROP TABLE "exams";
ALTER TABLE "new_exams" RENAME TO "exams";
CREATE UNIQUE INDEX "exams_name_key" ON "exams"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

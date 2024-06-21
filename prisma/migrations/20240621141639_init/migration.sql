-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "authorUsername" TEXT NOT NULL,
    CONSTRAINT "Idea_authorUsername_fkey" FOREIGN KEY ("authorUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "type" INTEGER NOT NULL,
    "voterUsername" TEXT NOT NULL,
    "ideaId" INTEGER NOT NULL,

    PRIMARY KEY ("voterUsername", "ideaId"),
    CONSTRAINT "Vote_voterUsername_fkey" FOREIGN KEY ("voterUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "authorUsername" TEXT NOT NULL,
    "ideaId" INTEGER NOT NULL,
    CONSTRAINT "Comment_authorUsername_fkey" FOREIGN KEY ("authorUsername") REFERENCES "User" ("username") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

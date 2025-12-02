/*
  Warnings:

  - You are about to drop the `UserGoalCollaborator` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UserGoalCollaborator` DROP FOREIGN KEY `UserGoalCollaborator_goal_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserGoalCollaborator` DROP FOREIGN KEY `UserGoalCollaborator_user_id_fkey`;

-- DropTable
DROP TABLE `UserGoalCollaborator`;

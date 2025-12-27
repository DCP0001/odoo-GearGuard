CREATE TABLE `equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`serialNumber` varchar(255) NOT NULL,
	`categoryId` int NOT NULL,
	`maintenanceTeamId` int,
	`department` varchar(255),
	`assignedTo` varchar(255),
	`location` varchar(255),
	`purchaseDate` timestamp,
	`warrantyExpiry` timestamp,
	`status` enum('active','inactive','scrapped') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipment_serialNumber_unique` UNIQUE(`serialNumber`)
);
--> statement-breakpoint
CREATE TABLE `equipment_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `equipment_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment_maintenance_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` int NOT NULL,
	`requestId` int,
	`serviceType` varchar(100) NOT NULL,
	`description` text,
	`technician` varchar(255),
	`cost` decimal(10,2),
	`nextServiceDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `equipment_maintenance_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`equipmentId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`changedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestNumber` varchar(50) NOT NULL,
	`type` enum('corrective','preventive') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text,
	`equipmentId` int NOT NULL,
	`maintenanceTeamId` int NOT NULL,
	`assignedToUserId` int,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('new','in_progress','repaired','scrap') NOT NULL DEFAULT 'new',
	`scheduledDate` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`durationMinutes` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `maintenance_requests_requestNumber_unique` UNIQUE(`requestNumber`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`teamId` int NOT NULL,
	`role` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);

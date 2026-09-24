CREATE TABLE `events` (
	`id` varchar(128) NOT NULL,
	`title` varchar(220) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(64) NOT NULL,
	`startAt` timestamp NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 120,
	`venue` varchar(220) NOT NULL,
	`instructor` varchar(160) NOT NULL,
	`level` varchar(80) NOT NULL,
	`capacity` int NOT NULL DEFAULT 12,
	`imageUrl` text NOT NULL,
	`accent` varchar(32) NOT NULL DEFAULT '#E56A3D',
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookingId` int,
	`type` enum('confirmation','reminder','system') NOT NULL,
	`title` varchar(220) NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `notifications_booking_type_unique` UNIQUE(`bookingId`,`type`)
);
--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_bookingId_bookings_id_fk` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE cascade ON UPDATE no action;
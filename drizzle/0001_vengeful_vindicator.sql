CREATE TABLE `registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`rollNo` varchar(80) NOT NULL,
	`email` varchar(320) NOT NULL,
	`photoUrl` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `registrations_rollNo_unique` UNIQUE(`rollNo`)
);

CREATE TABLE `AppUser` (
    `id` BIGINT NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `username` TEXT NOT NULL,
    `firstname` TEXT NOT NULL,
    `lastname` TEXT NOT NULL,
    `password` TEXT NOT NULL,
    `email` TEXT NOT NULL,
    `nonlocked` BOOLEAN NOT NULL,
    `enabled` BOOLEAN NOT NULL,
    `last_time_password_updated` DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
    `password_never_expires` BOOLEAN NOT NULL DEFAULT FALSE,
    `cannot_change_password` BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `Role` (
    `id` BIGINT NOT NULL,
    `name` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `is_disabled` BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `AppUserRole` (
    `appuser_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,

    PRIMARY KEY (`appuser_id`, `role_id`),
    CONSTRAINT `fk_app_user_role_user`
        FOREIGN KEY (`appuser_id`)
        REFERENCES `AppUser` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT `fk_app_user_role_role`
        FOREIGN KEY (`role_id`)
        REFERENCES `Role` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `UserPhone` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `phone_country_id` INT NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `order_index` INT NOT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_user_phone_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `AppUser` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE = InnoDB;
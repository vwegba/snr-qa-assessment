INSERT INTO Role (id, name, description, is_disabled)
VALUES
    (1, 'Superuser', 'Full access to all application features', FALSE),
    (2, 'Editor', 'Can create and update application content', FALSE),
    (3, 'ReadOnly', 'Can view application content only', FALSE)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    is_disabled = VALUES(is_disabled);
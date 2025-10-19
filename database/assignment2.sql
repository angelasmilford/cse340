-- 1.
-- Insert the new record to the account table
INSERT INTO public.account(account_firstname, account_lastname, account_email, account_password)
VALUES('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

SELECT * FROM public.account;


-- 2.
-- Modify the Tony Stark record to change the account_type to "Admin".
UPDATE public.account 
SET account_type = 'Admin' 
WHERE account_lastname = 'Stark';

SELECT * FROM public.account;


-- 3.
-- Delete the Tony Stark record from the database
DELETE from public.account 
WHERE account_firstname = 'Tony';

SELECT * FROM public.account;


-- 4.
-- Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query.
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 
	'Do you have 6 kids and like to go offroading? The Hummer gives you the small interiors with an engine to get you out of any muddy or rocky situation.', 
	'Do you have 6 kids and like to go offroading? The Hummer gives you a huge interior with an engine to get you out of any muddy or rocky situation.')
WHERE inv_make = 'GM';

SELECT * FROM public.inventory;


-- 5.
-- Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items that belong to the "Sport" category.
SELECT inv_make, inv_model
FROM public.inventory
INNER JOIN public.classification
	ON public.inventory.classification_id = public.classification.classification_id
WHERE classification_name = 'Sport';

SELECT * FROM public.classification;


-- 6.
-- Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns using a single query.
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/vehicles/vehicles/', '/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/vehicles/vehicles/', '/vehicles/')
WHERE inv_image LIKE '%/vehicles/vehicles/%'
   OR inv_thumbnail LIKE '%/vehicles/vehicles/%';
 
SELECT inv_image, inv_thumbnail FROM inventory;
-- Seed ile eklenen 30 etkinliğin poster_url alanını posters klasöründeki dosyalarla eşleştirir.
-- Sadece "Mock Events Organizasyonu" altındaki etkinlikler güncellenir.
-- Çalıştırmadan önce b/uploads/posters/ içinde event-1.jpg .. event-25.jpg ve
-- Generated_image1.png .. Generated_image5.png dosyalarının olduğundan emin ol.

UPDATE events SET poster_url = '/uploads/posters/event-1.jpg'
WHERE name = 'ZAMNA x MO Homecoming' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-2.jpg'
WHERE name = 'Istanbul Core Festival | Nico Moreno' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-3.jpg'
WHERE name = 'Black Coffee' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-4.jpg'
WHERE name = 'Sublime Music Festival' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-5.jpg'
WHERE name = 'X by Adriatique' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-6.jpg'
WHERE name = 'Nonstop Techno Presents: NOVAH' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-7.jpg'
WHERE name = 'Blind Fest' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-8.jpg'
WHERE name = 'Electronic Dreams' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-9.jpg'
WHERE name = 'Cosmic Lights' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-10.jpg'
WHERE name = 'Midnight Soul' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-11.jpg'
WHERE name = 'Indie Waves' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-12.jpg'
WHERE name = 'Summer Vibrations' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-13.jpg'
WHERE name = 'Lo-Fi Nights' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-14.jpg'
WHERE name = 'Neon City Festival' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-15.jpg'
WHERE name = 'Analog Dreams' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-16.jpg'
WHERE name = 'Sunrise Session' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-17.jpg'
WHERE name = 'Deep Forest' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-18.jpg'
WHERE name = 'Urban Jazz Night' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-19.jpg'
WHERE name = 'Rooftop Stories' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-20.jpg'
WHERE name = 'Minimal Therapy' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-21.jpg'
WHERE name = 'Lake View Festival' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-22.jpg'
WHERE name = 'Retro Disco Night' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-23.jpg'
WHERE name = 'Chill & Beats' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-24.jpg'
WHERE name = 'Dark Rooms' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/event-25.jpg'
WHERE name = 'Lost in Mind' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/Generated_image1.png'
WHERE name = 'Neon Pulse' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/Generated_image2.png'
WHERE name = 'Midnight Circuit' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/Generated_image3.png'
WHERE name = 'Afterglow Session' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/Generated_image4.png'
WHERE name = 'Spectrum' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

UPDATE events SET poster_url = '/uploads/posters/Generated_image5.png'
WHERE name = 'Noir Frequencies' AND organization_id IN (SELECT id FROM organizations WHERE name = 'Mock Events Organizasyonu');

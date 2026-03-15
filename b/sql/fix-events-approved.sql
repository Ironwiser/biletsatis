-- Tüm mevcut etkinlikleri onaylı yap (ana sayfada tekrar görünsünler)
-- Bu script'i event-approval-and-popup.sql'den sonra bir kez çalıştırın.

update events
set is_approved = true
where is_deleted = false and is_cancelled = false;

-- 梨花祭2026 安定化対応 DBマイグレーション
--
-- 本番環境ではコールドスタートごとの sequelize.sync({ alter: true }) を
-- 無効化したため（RUN_DB_SYNC=true のときのみ実行）、以下のSQLを
-- Supabase の SQL Editor で「1回だけ」実行してください。
-- すべて IF NOT EXISTS 付きなので、複数回実行しても安全です。

-- 譲渡機能用カラム（既存環境では適用済みのはず・念のため）
ALTER TABLE "GuestSlots" ADD COLUMN IF NOT EXISTS "transfer_code" VARCHAR(8);
ALTER TABLE "GuestSlots" ADD COLUMN IF NOT EXISTS "transfer_expires_at" TIMESTAMPTZ;

-- 検索高速化用インデックス
-- (token と Students.email は UNIQUE 制約により索引済みのため不要)
CREATE INDEX IF NOT EXISTS "guest_slots_student_email" ON "GuestSlots" ("student_email");
CREATE INDEX IF NOT EXISTS "guest_slots_transfer_code" ON "GuestSlots" ("transfer_code");

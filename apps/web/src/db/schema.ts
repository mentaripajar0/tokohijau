import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Starter schema; domain tables (products, orders, stocks, coupons) will be added per feature slice.
export const storeSettings = sqliteTable('store_settings', {
  key: text('key').primaryKey(),
  valueEncrypted: text('value_encrypted').notNull(),
  isSecret: integer('is_secret', { mode: 'boolean' }).notNull().default(true),
  updatedAt: integer('updated_at').notNull(),
});

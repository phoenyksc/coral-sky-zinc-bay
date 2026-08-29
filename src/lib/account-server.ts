import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { uniqueId } from "@/lib/utils";
import type { Order, ShippingAddress } from "@/lib/types";

export type SavedAddress = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
};

export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  nameOnCard: string;
  isDefault: boolean;
};

export type AccountOrder = {
  id: string;
  number: string;
  email: string;
  tracking: string;
  shipStatus: string;
  createdAt: string;
  order: Order;
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  sku: string;
  reason: string;
  status: string;
  createdAt: string;
};

export type AccountBundle = {
  firstPurchaseUsed: boolean;
  addresses: SavedAddress[];
  cards: SavedCard[];
  orders: AccountOrder[];
  returns: ReturnRequest[];
};

type AddressRow = {
  id: string;
  label: string;
  first_name: string;
  last_name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  is_default: boolean;
};

type CardRow = {
  id: string;
  brand: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  name_on_card: string;
  is_default: boolean;
};

type OrderRow = {
  id: string;
  number: string;
  email: string;
  payload: string;
  tracking: string;
  ship_status: string;
  created_at: string;
};

type ReturnRow = {
  id: string;
  order_id: string;
  sku: string;
  reason: string;
  status: string;
  created_at: string;
};

function mapAddress(row: AddressRow): SavedAddress {
  return {
    id: row.id,
    label: row.label,
    firstName: row.first_name,
    lastName: row.last_name,
    address1: row.address1,
    address2: row.address2,
    city: row.city,
    state: row.state,
    zip: row.zip,
    country: row.country,
    phone: row.phone,
    isDefault: Boolean(row.is_default),
  };
}

function mapCard(row: CardRow): SavedCard {
  return {
    id: row.id,
    brand: row.brand,
    last4: row.last4,
    expMonth: row.exp_month,
    expYear: row.exp_year,
    nameOnCard: row.name_on_card,
    isDefault: Boolean(row.is_default),
  };
}

async function loadBundle(userId: string): Promise<AccountBundle> {
  const sql = await getSql();
  await sql`insert into account_profiles (user_id) values (${userId}) on conflict (user_id) do nothing`;
  const profiles = await sql<{ first_purchase_used: boolean }>`
    select first_purchase_used from account_profiles where user_id = ${userId}
  `;
  const addresses = await sql<AddressRow>`
    select id, label, first_name, last_name, address1, address2, city, state, zip, country, phone, is_default
    from saved_addresses where user_id = ${userId} order by is_default desc, created_at desc
  `;
  const cards = await sql<CardRow>`
    select id, brand, last4, exp_month, exp_year, name_on_card, is_default
    from saved_cards where user_id = ${userId} order by is_default desc, created_at desc
  `;
  const orders = await sql<OrderRow>`
    select id, number, email, payload, tracking, ship_status, created_at
    from account_orders where user_id = ${userId} order by created_at desc
  `;
  const returns = await sql<ReturnRow>`
    select id, order_id, sku, reason, status, created_at
    from return_requests where user_id = ${userId} order by created_at desc
  `;
  return {
    firstPurchaseUsed: Boolean(profiles[0]?.first_purchase_used),
    addresses: addresses.map(mapAddress),
    cards: cards.map(mapCard),
    orders: orders.map((row) => ({
      id: row.id,
      number: row.number,
      email: row.email,
      tracking: row.tracking,
      shipStatus: row.ship_status,
      createdAt: row.created_at,
      order: JSON.parse(row.payload) as Order,
    })),
    returns: returns.map((row) => ({
      id: row.id,
      orderId: row.order_id,
      sku: row.sku,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
}

export const loadAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => loadBundle(context.userId));

export const saveAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { address: Omit<SavedAddress, "id"> & { id?: string } }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const a = data.address;
    const id = a.id || uniqueId("addr");
    if (a.isDefault) {
      await sql`update saved_addresses set is_default = false where user_id = ${context.userId}`;
    }
    await sql`
      insert into saved_addresses (
        id, user_id, label, first_name, last_name, address1, address2, city, state, zip, country, phone, is_default
      ) values (
        ${id}, ${context.userId}, ${a.label}, ${a.firstName}, ${a.lastName}, ${a.address1}, ${a.address2},
        ${a.city}, ${a.state}, ${a.zip}, ${a.country}, ${a.phone}, ${a.isDefault}
      )
      on conflict (id) do update set
        label = excluded.label,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        address1 = excluded.address1,
        address2 = excluded.address2,
        city = excluded.city,
        state = excluded.state,
        zip = excluded.zip,
        country = excluded.country,
        phone = excluded.phone,
        is_default = excluded.is_default
      where saved_addresses.user_id = ${context.userId}
    `;
    return loadBundle(context.userId);
  });

export const deleteAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from saved_addresses where id = ${data.id} and user_id = ${context.userId}`;
    return loadBundle(context.userId);
  });

export const saveCard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { card: Omit<SavedCard, "id"> & { id?: string } }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const c = data.card;
    const last4 = c.last4.replace(/\D/g, "").slice(-4);
    if (last4.length !== 4) throw new Error("Card could not be saved.");
    const id = c.id || uniqueId("card");
    if (c.isDefault) {
      await sql`update saved_cards set is_default = false where user_id = ${context.userId}`;
    }
    await sql`
      insert into saved_cards (id, user_id, brand, last4, exp_month, exp_year, name_on_card, is_default)
      values (${id}, ${context.userId}, ${c.brand}, ${last4}, ${c.expMonth}, ${c.expYear}, ${c.nameOnCard}, ${c.isDefault})
      on conflict (id) do update set
        brand = excluded.brand,
        last4 = excluded.last4,
        exp_month = excluded.exp_month,
        exp_year = excluded.exp_year,
        name_on_card = excluded.name_on_card,
        is_default = excluded.is_default
      where saved_cards.user_id = ${context.userId}
    `;
    return loadBundle(context.userId);
  });

export const deleteCard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from saved_cards where id = ${data.id} and user_id = ${context.userId}`;
    return loadBundle(context.userId);
  });

export const saveAccountOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { order: Order; tracking: string; shipStatus: string; address?: ShippingAddress; saveCard?: Omit<SavedCard, "id" | "isDefault"> }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into account_profiles (user_id) values (${context.userId}) on conflict (user_id) do nothing`;
    await sql`
      insert into account_orders (id, user_id, number, email, payload, tracking, ship_status)
      values (
        ${data.order.id}, ${context.userId}, ${data.order.number}, ${data.order.email},
        ${JSON.stringify(data.order)}, ${data.tracking}, ${data.shipStatus}
      )
      on conflict (id) do nothing
    `;
    if (data.order.discountCode === "FIRST10") {
      await sql`update account_profiles set first_purchase_used = true where user_id = ${context.userId}`;
    }
    if (data.address) {
      const existing = await sql<{ id: string }>`
        select id from saved_addresses
        where user_id = ${context.userId} and address1 = ${data.address.address1} and zip = ${data.address.zip}
        limit 1
      `;
      if (!existing.length) {
        const count = await sql<{ n: number }>`select count(*)::int as n from saved_addresses where user_id = ${context.userId}`;
        await sql`
          insert into saved_addresses (
            id, user_id, label, first_name, last_name, address1, address2, city, state, zip, country, phone, is_default
          ) values (
            ${uniqueId("addr")}, ${context.userId}, ${"Home"}, ${data.address.firstName}, ${data.address.lastName},
            ${data.address.address1}, ${data.address.address2}, ${data.address.city}, ${data.address.state},
            ${data.address.zip}, ${data.address.country}, ${data.address.phone}, ${(count[0]?.n ?? 0) === 0}
          )
        `;
      }
    }
    if (data.saveCard) {
      const last4 = data.saveCard.last4.replace(/\D/g, "").slice(-4);
      if (last4.length === 4) {
        const dup = await sql<{ id: string }>`
          select id from saved_cards where user_id = ${context.userId} and last4 = ${last4} and exp_month = ${data.saveCard.expMonth} limit 1
        `;
        if (!dup.length) {
          const count = await sql<{ n: number }>`select count(*)::int as n from saved_cards where user_id = ${context.userId}`;
          await sql`
            insert into saved_cards (id, user_id, brand, last4, exp_month, exp_year, name_on_card, is_default)
            values (
              ${uniqueId("card")}, ${context.userId}, ${data.saveCard.brand}, ${last4},
              ${data.saveCard.expMonth}, ${data.saveCard.expYear}, ${data.saveCard.nameOnCard}, ${(count[0]?.n ?? 0) === 0}
            )
          `;
        }
      }
    }
    return loadBundle(context.userId);
  });

export const requestReturn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orderId: string; sku: string; reason: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const owned = await sql<{ id: string }>`
      select id from account_orders where id = ${data.orderId} and user_id = ${context.userId}
    `;
    if (!owned.length) throw new Error("Order not found.");
    const reason = data.reason.trim();
    if (reason.length < 4) throw new Error("Tell us a little more.");
    await sql`
      insert into return_requests (id, user_id, order_id, sku, reason, status)
      values (${uniqueId("ret")}, ${context.userId}, ${data.orderId}, ${data.sku}, ${reason}, ${"requested"})
    `;
    return loadBundle(context.userId);
  });

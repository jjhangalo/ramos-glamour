"use client";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const GA_TRACKING_ID = "G-G98TS5PDM3";

// Core tracking function
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
}

// E-commerce specific events
export const trackViewItem = (item: {
  id: string;
  name: string;
  price: number;
  category?: string;
  variant?: string;
}) => {
  trackEvent("view_item", {
    currency: "AOA",
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_variant: item.variant,
        price: item.price,
        quantity: 1,
      } as AnalyticsItem,
    ],
  });
};

export const trackAddToCart = (item: {
  id: string;
  name: string;
  price: number;
  category?: string;
  variant?: string;
}, quantity: number = 1) => {
  trackEvent("add_to_cart", {
    currency: "AOA",
    value: item.price * quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_variant: item.variant,
        price: item.price,
        quantity: quantity,
      } as AnalyticsItem,
    ],
  });
};

export const trackBeginCheckout = (items: { id: string; name: string; category?: string; variant?: string; price: number; quantity: number }[], total: number) => {
  trackEvent("begin_checkout", {
    currency: "AOA",
    value: total,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_variant: item.variant,
      price: item.price,
      quantity: item.quantity,
    } as AnalyticsItem)),
  });
};

export const trackPurchase = (order: {
  id: string;
  total: number;
  items: { id: string; name: string; category?: string; variant?: string; price: number; quantity: number }[];
}) => {
  trackEvent("purchase", {
    transaction_id: order.id,
    value: order.total,
    currency: "AOA",
    items: order.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_variant: item.variant,
      price: item.price,
      quantity: item.quantity,
    } as AnalyticsItem)),
  });
};

"use client";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = "G-G98TS5PDM3";

// Core tracking function
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

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
      },
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
      },
    ],
  });
};

export const trackBeginCheckout = (items: any[], total: number) => {
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
    })),
  });
};

export const trackPurchase = (order: {
  id: string;
  total: number;
  items: any[];
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
    })),
  });
};

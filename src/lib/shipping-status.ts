export function makeTrackingNumber() {
  return `9400${Date.now().toString().slice(-12)}`;
}

export function shipStatusFor(createdAt: string, method: string) {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  const express = method === "express";
  if (hours < 6) return "Packed — leaving California";
  if (hours < (express ? 18 : 36)) return "In transit";
  if (hours < (express ? 36 : 96)) return "Out for delivery";
  return "Delivered";
}

export function cardBrand(number: string) {
  const n = number.replace(/\D/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (n.startsWith("6")) return "Discover";
  return "Card";
}

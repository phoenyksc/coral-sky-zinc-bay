/** Client-side snapshot of first-purchase eligibility. Server is the source of truth. */
export const accountFlags = {
  signedIn: false,
  firstPurchaseUsed: true,
};

export function setAccountFlags(next: Partial<typeof accountFlags>) {
  Object.assign(accountFlags, next);
}

/*
Pseudocode:
Define canonical sign-in and account-type selection routes.
Build typed buyer and seller registration links from one shared URL.
*/
export type SignupAccountType = "buyer" | "seller";

const SIGNUP_CHOICE_HREF = "/signin?mode=signup";

export const authRoutes = {
  signIn: "/signin",
  signupChoice: SIGNUP_CHOICE_HREF,
  signupFor: (accountType: SignupAccountType) =>
    `${SIGNUP_CHOICE_HREF}&accountType=${accountType}`,
} as const;

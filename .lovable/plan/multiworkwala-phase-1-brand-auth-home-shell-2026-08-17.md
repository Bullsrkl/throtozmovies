# MultiWorkWala — Phase 1: Brand, Auth & Home Shell

Prop Gym ko MultiWorkWala me convert karenge. Ye Phase 1 he — brand identity, authentication flow, aur Home dashboard shell. Wallets, Membership, Network, Rank engines baad ke phases me.

## Approach

Existing auth, profiles, wallet aur referral systems ko reuse karke MultiWorkWala rules me convert karenge. Trading/challenge specific pages (Buy Challenge, Rules, King Maker, Trading Accounts, Certificates, Competition) is phase me route se hata denge — data delete nahi karenge, taki kuch bhi wapas chahiye to available rahe.

## Design System (new identity)

- Deep navy (#0B1730 range) / matte black background, white text
- Premium metallic gold / champagne accent (primary CTA, branding)
- Emerald green = MVS Points & success, Blue = Earning Wallet & info, Gold = MVS Pay
- Elevated glass cards, 18-24px rounded corners, premium line icons
- Generous spacing, 200-400ms smooth transitions, no neon/cheap glow
- Mobile-first: max-width phone container, sab kuch 9:19 ke liye tuned
- Logo: uploaded MultiWorkWala "M" mark + "समाधान हर जरूरत का" tagline

Saare colors semantic tokens ke through — index.css aur tailwind config me define honge.

## Screens is phase me

**Brand / Entry**
1. Splash Screen — logo, tagline, loading bar
2-5. Onboarding 1/4 to 4/4 — One Ecosystem, 3 Smart Wallets, Products & Services, Grow Together (dots, Skip, Next, Get Started)
6. Login — mobile/email + password, show/hide, Remember Me, Forgot Password, Google login, Create New Account
7. OTP Verification — 6 box input, resend timer
8. Forgot Password
9-12. Sign Up multi-step — Basic Details → Referral Code → OTP → Profile Setup
13. Account Created — permanent Member ID reveal

**Home Shell**
20. Home Dashboard — top bar (hamburger, logo, bell, avatar), greeting, hero banner carousel, profile/member card (photo, name, Member ID, role, KYC status, membership status), 3-wallet summary cards, Quick Actions grid, Membership summary card, My Rank card, Mission1616 progress card, My Network summary, Latest Offers / Announcements
237. Hamburger Drawer — MAIN / MY BUSINESS / ACCOUNT / LEGAL sections + Logout
Bottom Nav — Home, Wallet, MVS Pay (center, emphasized), Offers, Profile

Wallet / MVS Pay / Offers / Profile tabs is phase me placeholder screens honge, real data agle phase me.

## Backend changes

Naye tables:
- `member_profiles` — permanent Member ID (MWW########), role (member/manager/core/prime/admin), membership status, KYC status. Role backend-controlled, user kabhi self-assign nahi kar sakta.
- `hero_banners` — image, title, subtitle, CTA text, CTA link, active flag, start/end dates (admin CMS controlled)
- `app_announcements` — title, body, date, active
- Existing `wallets` table ko 3-wallet model me extend: earning (INR), mvs_pay (INR), mvs_points (points)

Existing `profiles`, `user_roles`, `referrals` reuse honge. Member ID signup par ek hi baar generate hoga aur permanent rahega — koi upgrade/change plan feature nahi.

Payments (agle phase): manual UPI + screenshot upload, admin approval — jaise abhi USDT flow he.

## Currency

Poora app INR (₹). Koi USD/dollar kahin nahi. Existing $ values wale trading pages route se hat rahe he, isliye conflict nahi hoga.

## Technical notes

- Mobile-first web app (React + Tailwind), phone-frame container desktop par center
- `src/index.css` + `tailwind.config.ts` me naya navy/gold token set
- Naye routes: `/` (splash→onboarding→home logic), `/onboarding`, `/auth/login`, `/auth/signup`, `/auth/otp`, `/auth/forgot`, `/home`, `/wallet`, `/mvs-pay`, `/offers`, `/profile`
- Purane routes (`/buy-challenge`, `/rules`, `/king-maker`, `/dashboard/*`, `/checkout`) remove; `/admin` rahega (naye CMS sections agle phase me)
- Naye components: `MobileShell`, `BottomNav`, `AppTopBar`, `NavDrawer`, `WalletSummaryCard`, `HeroCarousel`, `OnboardingSlide`, `OtpInput`
- Logo asset uploaded image se banega
- index.html metadata MultiWorkWala ke liye update

## Phase 1 ke baad (approval ke baad alag se)

Phase 2: 3-wallet system + ledger + Membership (₹5k/10k/25k) + manual UPI checkout
Phase 3: Products, Orders, Return/Refund workflow
Phase 4: Referral network, 7-level benefits engine
Phase 5: 10-rank system, Mission1616, salary dashboard
Phase 6: Services, Merchants, Restaurants, Hotels, Travel, Offers CMS
Phase 7: KYC, Security Center, Notifications, Support, Admin backoffice

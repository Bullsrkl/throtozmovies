# Fix: Admin Image Upload RLS Error (King Maker Event Settings)

## Problem

Jab admin event settings me banner ya poster image upload karne ki koshish karta hai, ek RLS error aata hai aur upload fail ho jata hai.

**Root cause:** `king-maker-uploads` storage bucket par jo INSERT policy hai, wo sirf un files ko allow karti hai jinka path `{auth.uid()}/...` se start ho. Lekin admin uploads `admin/banner-{timestamp}.jpg` aur `admin/poster-{timestamp}.jpg` path use karte hain — jo policy se match nahi karta, isliye RLS block kar deta hai.

Current policy:
```
(bucket_id = 'king-maker-uploads')
AND (auth.uid()::text = storage.foldername(name)[1])
```

## Fix

Ek nayi storage policy add karenge jo admins ko `admin/` prefix wali files upload, update, aur delete karne deti hai. Existing user policy (apne folder me upload) waise hi rahegi.

### Migration

Storage `objects` table par 3 nayi RLS policies (sirf `king-maker-uploads` bucket ke `admin/` prefix ke liye, aur sirf jab user ka role `admin` ho — `has_role()` function use karke):

1. **Admins can insert into admin/** — INSERT policy
2. **Admins can update admin/** — UPDATE policy  
3. **Admins can delete admin/** — DELETE policy

Sab policies condition: `bucket_id = 'king-maker-uploads' AND (storage.foldername(name))[1] = 'admin' AND public.has_role(auth.uid(), 'admin')`

Public SELECT policy already exists, so display/preview kaam karega.

## Files

- New migration file (storage policies only)
- No frontend code change needed — `KingMakerAdmin.tsx` upload code already correct hai, bas RLS allow karne ki zarurat hai.

## After fix

Admin banner/poster images successfully upload honge, preview dikhega, aur "Save Event" se persist hoga.

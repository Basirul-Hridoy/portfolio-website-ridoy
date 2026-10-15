# Portfolio Update Notes

এই আপডেটে নিচের পরিবর্তনগুলো করা হয়েছে।

## 1. Admin authentication
- `middleware.ts`-এ Supabase `auth.getUser()` দিয়ে verified session যাচাই করা হয়।
- Protected `/admin/*` dashboard routes-এ লগইন এবং `is_admin` RPC—দুটিই বাধ্যতামূলক।
- Session না থাকলে `/admin/login`-এ redirect করা হয়; অননুমোদিত user-কে dashboard-এ ঢুকতে দেওয়া হয় না।
- Dashboard layout-এ server-side দ্বিতীয়বার authorization check যোগ করা হয়েছে, যাতে middleware configuration ভুল হলেও dashboard page render না হয়।
- `next` redirect ব্যবহার করে লগইন শেষে অনুমোদিত admin requested dashboard route-এ ফিরতে পারে।

## 2. Delete confirmation modal
- Content Manager-এর service, case study, certificate, review, process step এবং অন্যান্য managed item delete করার আগে custom confirmation modal দেখানো হয়।
- Contact message delete করার ক্ষেত্রেও একই ধরনের confirmation modal যোগ করা হয়েছে।
- Cancel করলে delete request পাঠানো হয় না; delete চলাকালে buttons disable থাকে।

## 3. Case study back navigation
- Case study details page-এর Back link এখন browser/Next navigation history-তে আগের পেজে ফেরে।
- All Case Studies থেকে details খুলে Back করলে All Case Studies-এ ফেরার কথা; browser history restore হলে আগের scroll position-ও বজায় থাকবে।
- সরাসরি details URL খুললে history না থাকায় fallback URL ব্যবহার হবে।

## Validation
- ZIP-এ dependency install/build সম্পূর্ণ করা সম্ভব হয়নি, তাই production build সফল হয়েছে বলে দাবি করা হচ্ছে না।
- Deploy করার আগে `npm ci`, `npm run lint`, এবং `npm run build` চালিয়ে যাচাই করুন।
- Supabase-এ `is_admin` RPC এবং সংশ্লিষ্ট table/storage-এর Row Level Security policies অবশ্যই সক্রিয় ও সঠিক হতে হবে। Middleware/UI checks database RLS-এর বিকল্প নয়।

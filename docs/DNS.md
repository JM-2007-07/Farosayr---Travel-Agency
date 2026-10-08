# Farosayr — Domains & DNS

Facts verified on **2026-10-06 ~06:20 UTC** (Vercel CLI as `jm-2007-07`,
direct queries to the `.tj` TLD servers and to `ns1.rspd.tj`, public
resolvers 8.8.8.8 / 1.1.1.1). Re-check before acting — DNS changes.

No secrets in this file.

## 1. Target

> **Status: planned, not live.** Production today is `https://farosayr.com`
> (website) and `https://farosayr-t-a-backend.vercel.app` (API). Nothing in
> this section is active until the steps in §4 and DEPLOYMENT.md §7 are done.

| Host | Role |
|---|---|
| **`https://farosayr.tj`** | **Canonical website** (business domain) |
| `https://www.farosayr.tj` | 308 → `https://farosayr.tj` |
| `https://api.farosayr.tj` | API (Vercel project `farosayr-t-a-backend`) |
| `https://farosayr.com`, `https://www.farosayr.com` | 308 → `https://farosayr.tj` |
| `*.vercel.app` | Technical URLs only (Telegram webhook moves to `api.farosayr.tj`) |

Why `api.` (a subdomain) and not a `/api` rewrite on the website: the
backend stays its own Vercel project and sees real client IPs (rate limits
work per visitor, not per Vercel proxy), there is no extra proxy hop, and
`farosayr.tj` ↔ `api.farosayr.tj` are the **same site**, so the auth cookie
can be `SameSite=Lax` (see AUTHENTICATION.md).

## 2. Current state

### farosayr.tj — ❌ not resolving

| Check | Result |
|---|---|
| Delegation at the `.tj` TLD (`tj.cctld.authdns.ripe.net`) | `NS ns1.rspd.tj` (91.218.160.3), `NS ns2.rspd.tj` (91.218.160.4) |
| `ns1.rspd.tj` asked directly for `farosayr.tj` | **Query refused** — the zone does not exist on these servers |
| Public resolvers, all types (NS, A, AAAA, CNAME, MX, TXT) for `farosayr.tj`, `www.`, `api.`, `_dmarc.` | **SERVFAIL** (lame delegation) |
| Vercel | Domain added (`farosayr.tj`, `www.farosayr.tj` → project `farosayr-t-a-frontend`); *"not configured properly"*; intended nameservers `ns1.vercel-dns.com`, `ns2.vercel-dns.com` |

**Consequence:** the domain answers nothing at all — no website and **no
email** (there is no working MX record, so no `@farosayr.tj` mailbox can
currently receive mail). Changing the delegation therefore cannot break an
existing service.

### farosayr.com — ✅ live

| Record | Value |
|---|---|
| Registrar / nameservers | Vercel / `ns1.vercel-dns.com`, `ns2.vercel-dns.com` (registered 2026-10-05, expires 2027-10-05) |
| `ALIAS @`, `ALIAS *` | Vercel (defaults) |
| `TXT @` | `google-site-verification=…` (Google Search Console — **keep**) |
| `CAA @` | letsencrypt.org, pki.goog, sectigo.com (Vercel defaults) |
| MX / SPF / DKIM / DMARC | **none** |
| Project | `farosayr-t-a-frontend` (`farosayr.com`, `www.farosayr.com`) |

HTTP→HTTPS 308 on all hosts; `www.farosayr.com` → `farosayr.com` (308).

### Other

- `farosayr-t-a-frontend.com` — added to the Vercel account, third-party
  nameservers, not attached to any project, doesn't resolve. Looks like a
  mistake → remove it in Vercel → Domains.
- Company email is `farosayrtour@mail.ru` (mail.ru) — not tied to either
  domain.

## 3. Target DNS for farosayr.tj

**Recommended: delegate the domain to Vercel DNS** (same as
`farosayr.com`). Vercel then creates and maintains the apex, `www`, `api`
and certificate records itself.

| | Current | Target |
|---|---|---|
| NS (at the `.tj` registrar) | `ns1.rspd.tj`, `ns2.rspd.tj` | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` |
| `farosayr.tj` | — | Vercel apex (automatic) |
| `www.farosayr.tj` | — | Vercel (automatic) → redirect to apex |
| `api.farosayr.tj` | — | Vercel (automatic once added to the backend project) |
| MX / SPF / DKIM / DMARC | — (none exist) | none until a mailbox on the domain is wanted |
| TXT | — | Google Search Console verification for the new property (added later) |

Records removed by this change: **none** (the current zone is empty /
unreachable).

**Alternative** (if the registrar must keep DNS): create the zone at the
current DNS host with `A farosayr.tj 76.76.21.21`, `CNAME www
cname.vercel-dns.com.`, `CNAME api cname.vercel-dns.com.` (values as shown
by Vercel when each domain is added — re-check them there).

### Email later

If the company wants `info@farosayr.tj`: add the provider's MX, SPF
(`TXT @ "v=spf1 include:… ~all"`), DKIM (TXT/CNAME from the provider) and
`TXT _dmarc "v=DMARC1; p=none; rua=mailto:…"` **in Vercel DNS**. Never
delete MX/SPF/DKIM/DMARC/verification TXT records during later DNS work.

## 4. Change procedure (`.tj`)

EXTERNAL — needs the `.tj` registrar account (the party that set
`ns*.rspd.tj`; the `.tj` registry is nic.tj).

1. Record the current state again (§2 commands below) and save the output.
2. Registrar panel → `farosayr.tj` → Nameservers →
   `ns1.vercel-dns.com`, `ns2.vercel-dns.com`. Save.
3. Wait for propagation (minutes to 48 h; the `.tj` TLD TTL applies).
4. Verify:
   - `nslookup -type=ns farosayr.tj 8.8.8.8` → vercel-dns.com
   - `vercel domains inspect farosayr.tj` → nameservers ✓, no warning
   - `https://farosayr.tj` loads with a valid certificate,
     `https://www.farosayr.tj` → 308 → `https://farosayr.tj`
5. Continue with the domain cutover in DEPLOYMENT.md §7.

**Rollback:** set the nameservers back to the values recorded in step 1
(`ns1.rspd.tj`, `ns2.rspd.tj`). Nothing was being served from them, so
rollback only matters if the change is made by mistake on another domain.

## 5. Commands

```bash
# delegation as the TLD sees it
nslookup -type=ns farosayr.tj tj.cctld.authdns.ripe.net
# what public resolvers return
nslookup -type=ns farosayr.tj 8.8.8.8
nslookup -type=mx farosayr.tj 8.8.8.8
# Vercel's view (read-only)
vercel domains ls
vercel domains inspect farosayr.tj
vercel dns ls farosayr.com
# HTTPS + redirects
curl -sIL http://www.farosayr.tj | grep -iE "^HTTP|^location"
```

## 6. Propagation notes

Resolvers cache negative answers and old NS sets; a fresh change can look
"broken" from one network and fine from another. Check from more than one
resolver (8.8.8.8, 1.1.1.1) and note the time of each check. Vercel
issues the certificate only after it sees the new delegation.

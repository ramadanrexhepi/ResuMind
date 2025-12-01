# Fix: Accidentally Deleted Namecheap NS Records

## What Happened?
You deleted the NS (nameserver) records. These tell the internet where to find DNS information for your domain.

**Don't worry** - this is easily fixable! ✅

---

## Quick Fix - Method 1: Use Nameservers Tab (Easiest!)

### Step 1: Find Nameservers Section
In Namecheap, on your domain page, look for one of these:
- **"Nameservers"** tab (next to Advanced DNS)
- **"Nameservers"** dropdown at the top of Advanced DNS page
- **"Domain"** tab with a "Nameservers" section

### Step 2: Select Namecheap BasicDNS
- Click the **dropdown menu**
- Select: **"Namecheap BasicDNS"**
- Click **Save** or the **✓ checkmark**

### Step 3: Done!
This will **automatically restore** all the correct NS records for you.

---

## Quick Fix - Method 2: Reset via Advanced DNS

### If you see "Select nameserver type" at the top:

1. **Advanced DNS page** → Look for **dropdown at the very top**
2. **Click dropdown** → Select **"Namecheap BasicDNS"**
3. **Save changes**
4. **Refresh page** - NS records should be back!

---

## Manual Fix - Method 3: Re-add NS Records Manually

If the above don't work, manually add the nameservers:

### Add First NS Record:
1. Click **"Add New Record"**
2. Fill in:
   ```
   Type:  NS Record
   Host:  @
   Value: dns1.registrar-servers.com
   TTL:   Automatic
   ```
3. Click **✓ Save**

### Add Second NS Record:
1. Click **"Add New Record"** again
2. Fill in:
   ```
   Type:  NS Record
   Host:  @
   Value: dns2.registrar-servers.com
   TTL:   Automatic
   ```
3. Click **✓ Save**

---

## What the Records Should Look Like:

After fixing, your Advanced DNS should show:

```
HOST RECORDS
┌──────────────┬──────┬─────────────────────────────┬───────────┐
│ Type         │ Host │ Value                       │ TTL       │
├──────────────┼──────┼─────────────────────────────┼───────────┤
│ NS Record    │ @    │ dns1.registrar-servers.com  │ Automatic │
│ NS Record    │ @    │ dns2.registrar-servers.com  │ Automatic │
└──────────────┴──────┴─────────────────────────────┴───────────┘
```

---

## Verify It's Fixed:

### Check in Namecheap:
- ✅ You should see 2 NS records in Advanced DNS
- ✅ Host should be `@` for both
- ✅ Values should be `dns1.registrar-servers.com` and `dns2.registrar-servers.com`

### Check Online:
Visit: https://www.whatsmydns.net/#NS/ramadanrexhepi.dev

Should show:
```
dns1.registrar-servers.com
dns2.registrar-servers.com
```

---

## Now Add Your CNAME Record:

Once nameservers are restored:

1. **Add New Record**
2. **Type**: CNAME Record
3. **Host**: `resumind`
4. **Value**: `resuma-backend.onrender.com`
5. **TTL**: Automatic
6. **Save ✓**

---

## Common Issues:

### "I don't see a Nameservers dropdown"
- Look for a tab called **"Nameservers"** (separate from Advanced DNS)
- Or check the **"Domain"** tab first page
- Try scrolling to the very top of the Advanced DNS page

### "BasicDNS option is grayed out"
- You might be on a custom nameserver
- Click the dropdown anyway and force-select BasicDNS
- Confirm any warnings about switching

### "I added NS records but nothing works"
- Wait 5-10 minutes for changes to propagate
- Clear browser cache (Ctrl + Shift + Delete)
- Check https://dnschecker.org

### "My website stopped working"
- Don't panic! DNS changes can take up to 24 hours to fully propagate
- Your site will come back as DNS updates
- In the meantime, you can access via direct IP if needed

---

## What are NS Records?

**NS = Name Server**

They tell the internet: *"To find DNS information for ramadanrexhepi.dev, ask these nameservers"*

Without them, the internet doesn't know where to look for your domain's DNS records!

**Default Namecheap Nameservers:**
- `dns1.registrar-servers.com`
- `dns2.registrar-servers.com`

These are Namecheap's servers that host your DNS records (like your CNAME, A records, etc.)

---

## Prevention:

**Don't delete NS records!** They're critical for DNS to work.

**Safe to edit:**
- ✅ A records
- ✅ CNAME records
- ✅ TXT records
- ✅ MX records

**Don't touch:**
- ❌ NS records (unless you know what you're doing)
- ❌ SOA records

---

## Final Checklist:

After fixing:

- [ ] NS records restored (2 records with @ as host)
- [ ] Nameserver type shows "Namecheap BasicDNS"
- [ ] CNAME record added: resumind → resuma-backend.onrender.com
- [ ] DNS checker shows correct nameservers
- [ ] Wait 5-30 minutes for propagation
- [ ] Test: https://resumind.ramadanrexhepi.dev/api/health

---

## If Still Stuck:

**Contact Namecheap Support:**
- Live Chat: Available 24/7
- They can restore your DNS settings in seconds
- Say: "I accidentally deleted my NS records, can you restore default BasicDNS?"

**Or use Cloudflare:**
- Create free account at cloudflare.com
- Add your domain
- Use Cloudflare's nameservers instead
- Easier interface, same result!

---

**Try Method 1 first** (reset to BasicDNS) - it's the easiest and fixes everything automatically! 🚀

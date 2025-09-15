const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID || '61148';
const API_KEY    = process.env.HOSTAWAY_API_KEY || '';
const HOSTAWAY_BASE = process.env.HOSTAWAY_BASE || 'https://api.hostaway.com/v1';

app.use(express.static(path.join(__dirname)));

function normalize(payload){
  const arr = Array.isArray(payload) ? payload : (payload?.result ?? []);
  const out = arr.map((r,i)=>{
    let rating = (r.rating ?? null);
    if(rating == null && Array.isArray(r.reviewCategory) && r.reviewCategory.length){
      const nums = r.reviewCategory.map(c=>Number(c.rating)).filter(n=>!isNaN(n));
      if(nums.length) rating = nums.reduce((a,b)=>a+b,0)/nums.length;
    }
    const submittedAt = new Date(String(r.submittedAt || r.createdAt || r.date || r.updatedAt).replace(' ','T'));
    const channel = r.channel || r.source || r.platform || 'hostaway';
    const type = r.type || 'guest-to-host';
    const approved = (r.approved === true) || (r.status === 'published');
    const listing = r.listingName || r.listing || r.property || r.propertyName || 'Unspecified Listing';
    const cats = {};
    if(Array.isArray(r.reviewCategory)){ r.reviewCategory.forEach(c=> cats[c.category] = Number(c.rating)); }
    else if (r.categories && typeof r.categories === 'object'){ Object.entries(r.categories).forEach(([k,v])=> cats[k]=Number(v)); }
    return { id: r.id ?? i, listing, guestName: r.guestName || r.author || r.user || 'Guest', type, channel, approved,
             rating: (rating!=null && !Number.isNaN(Number(rating))) ? Number(rating) : null,
             categories: cats, text: r.publicReview || r.text || r.comment || '',
             submittedAt: isNaN(submittedAt)? null : submittedAt.toISOString() };
  });
  return out.filter(x=>x.submittedAt);
}

app.get('/api/reviews/hostaway', async (req,res)=>{
  try{
    let data;
    if(API_KEY){
      const url = `${HOSTAWAY_BASE}/reviews?accountId=${encodeURIComponent(ACCOUNT_ID)}`;
      const r = await fetch(url, { headers: { 'Authorization': API_KEY, 'Accept': 'application/json' } });
      if(r.ok){
        data = await r.json();
        if(!data || !data.result || data.result.length===0){
          const mock = JSON.parse(fs.readFileSync(path.join(__dirname,'mock-reviews.json'),'utf8'));
          return res.json({ status:'success', source:'mock', data: normalize(mock) });
        } else {
          return res.json({ status:'success', source:'hostaway', data: normalize(data) });
        }
      }
    }
    const mock = JSON.parse(fs.readFileSync(path.join(__dirname,'mock-reviews.json'),'utf8'));
    return res.json({ status:'success', source:'mock', data: normalize(mock) });
  }catch(e){
    console.error(e);
    try{
      const mock = JSON.parse(fs.readFileSync(path.join(__dirname,'mock-reviews.json'),'utf8'));
      return res.json({ status:'success', source:'mock', data: normalize(mock) });
    }catch(_) {
      return res.status(500).json({ status:'error', message: e.message });
    }
  }
});

app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));

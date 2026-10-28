import { auth, db, firebaseAuth, ordersDb } from './firebase.js';

(() => {
  const key = 'hekaya_store_v2';
  const cartKey = 'hekaya_cart_v2';
  const ordersKey = 'hekaya_orders_v2';
  const adminUid = 'DQwNftPz0PQfaXvNyfFwb08XFjY2';
  const img = (id, width = 850) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
  const defaults = {
    name: 'حكاية', announcement: 'توصيل مجاني للطلبات فوق ١٥٠٠ جنيه · اختاري شنطتك المفضلة',
    bg: '#f8f6f2', accent: '#9a694b', title: 'قطعة تشبهك. وترافق حكايتك.',
    copy: 'حقائب تجمع بين جمال التفاصيل وسهولة كل يوم. اختاري قطعتك المفضلة من تشكيلتنا الجديدة.',
    hero: img('photo-1584917865442-de89df76afd3', 1400),
    story: 'نؤمن أن الحقيبة الجميلة هي التي تشبه صاحبتها. نختار كل قطعة لتكون عملية وأنيقة، وترافقك في أيامك كما في مناسباتك.',
    whatsapp: '',
    products: [
      {id:'p1',name:'حقيبة ساند',desc:'جلد نباتي · لون بيج',price:1250,category:'يومية',tag:'الأكثر مبيعًا',image:img('photo-1584917865442-de89df76afd3')},
      {id:'p2',name:'حقيبة ميني روز',desc:'حجم صغير · لون وردي',price:950,category:'سهرة',tag:'جديد',image:img('photo-1590874103328-eac38a683ce7')},
      {id:'p3',name:'حقيبة كلاسيك',desc:'جلد ناعم · لون بني',price:1450,category:'يومية',tag:'',image:img('photo-1548036328-c9fa89d128fa')},
      {id:'p4',name:'حقيبة توت',desc:'مساحة واسعة · لون كريمي',price:1100,category:'عملية',tag:'اختيار مميز',image:img('photo-1591561954557-26941169b49e')}
    ]
  };
  let data;
  try { data = JSON.parse(localStorage.getItem(key)) || structuredClone(defaults); } catch { data = structuredClone(defaults); }
  const money = n => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const persist = () => localStorage.setItem(key, JSON.stringify(data));
  const getCart = () => { try { return JSON.parse(localStorage.getItem(cartKey)) || {}; } catch { return {}; } };
  const setCart = c => localStorage.setItem(cartKey, JSON.stringify(c));
  const toast = msg => { const el = document.getElementById('toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2200); };
  const applyBrand = () => {
    document.documentElement.style.setProperty('--bg', data.bg);
    document.documentElement.style.setProperty('--accent', data.accent);
    ['storeName','footerName'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=data.name;});
    const a=document.getElementById('announcement'); if(a)a.textContent=data.announcement;
  };
  const cartCount = () => Object.values(getCart()).reduce((a,n)=>a+Number(n),0);
  const updateCartBadge = () => {const e=document.getElementById('cartCount');if(e)e.textContent=cartCount().toLocaleString('ar-EG');};
  applyBrand(); updateCartBadge();

  const productRoot = document.getElementById('products');
  if(productRoot){
    document.getElementById('heroTitle').innerHTML=safe(data.title).replace(/\n/g,'<br>').replace(/\. /g,'.<br>');
    document.getElementById('heroCopy').textContent=data.copy;
    document.getElementById('heroImage').src=data.hero;
    document.getElementById('storyCopy').textContent=data.story;
    document.getElementById('storyImage').src=data.products[2]?.image || data.hero;
    const categories=['الكل',...new Set(data.products.map(p=>p.category).filter(Boolean))];
    document.getElementById('filters').innerHTML=categories.map((c,i)=>`<button class="filter ${i===0?'active':''}" data-category="${safe(c)}">${safe(c)}</button>`).join('');
    const renderProducts = category => {
      const items=data.products.filter(p=>category==='الكل'||p.category===category);
      productRoot.innerHTML=items.length?items.map(p=>`<article class="product-card"><div class="product-photo"><img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy">${p.tag?`<span class="product-tag">${safe(p.tag)}</span>`:''}</div><div class="product-info"><h3>${safe(p.name)}</h3><div class="product-desc">${safe(p.desc)}</div><div class="product-bottom"><span class="product-price">${money(p.price)}</span><button class="add-cart" data-add="${safe(p.id)}" aria-label="أضيفي ${safe(p.name)} إلى الحقيبة">＋</button></div></div></article>`).join(''):'<p>لا توجد منتجات في هذا التصنيف حاليًا.</p>';
      productRoot.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{const cart=getCart(),id=b.dataset.add;cart[id]=(cart[id]||0)+1;setCart(cart);updateCartBadge();toast('اتضافت الشنطة لحقيبتك');}));
    };
    renderProducts('الكل');
    document.getElementById('filters').querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.category);}));

    const shade=document.getElementById('adminShade');
    const whatsappField=document.getElementById('editWhatsApp');
    if(whatsappField)whatsappField.closest('label').remove();
    const adminTabs=document.querySelector('.admin-tabs');
    adminTabs.insertAdjacentHTML('beforeend','<button class="tab" data-tab="orders">الطلبات</button>');
    document.getElementById('itemsTab').insertAdjacentHTML('afterend','<section class="admin-section hidden" id="ordersTab"><div id="ordersList"></div></section>');
    const adminPanel=document.querySelector('.admin-panel');
    adminPanel.insertAdjacentHTML('afterbegin','<form id="adminLogin" class="admin-login hidden"><h3>دخول صاحبة المتجر</h3><label>البريد الإلكتروني<input type="email" id="adminEmail" autocomplete="username" required></label><label>كلمة المرور<input type="password" id="adminPassword" autocomplete="current-password" required></label><button class="button dark full" type="submit">تسجيل الدخول</button><p id="adminLoginMessage" role="status"></p></form><div id="adminAccount" class="admin-account hidden"><span>تم تسجيل الدخول إلى لوحة المتجر</span><button type="button" id="adminLogout">تسجيل الخروج</button></div>');
    const loginForm=document.getElementById('adminLogin');
    const updateAdminGate=user=>{
      const isAdmin=Boolean(user&&user.uid===adminUid);
      loginForm.classList.toggle('hidden',isAdmin);
      document.getElementById('adminAccount').classList.toggle('hidden',!isAdmin);
      adminPanel.querySelectorAll('.admin-tabs,.admin-section,#resetAll').forEach(el=>el.classList.toggle('hidden',!isAdmin));
      if(isAdmin){fillDesign();fillProducts();fillOrders();}
      else document.getElementById('ordersList').innerHTML='';
    };
    firebaseAuth.onAuthStateChanged(auth,user=>{
      if(user&&user.uid!==adminUid){firebaseAuth.signOut(auth);updateAdminGate(null);return;}
      updateAdminGate(user);
    });
    updateAdminGate(auth.currentUser);
    loginForm.addEventListener('submit',async e=>{
      e.preventDefault();const message=document.getElementById('adminLoginMessage');message.textContent='جارٍ تسجيل الدخول…';
      try{const result=await firebaseAuth.signInWithEmailAndPassword(auth,document.getElementById('adminEmail').value.trim(),document.getElementById('adminPassword').value);if(result.user.uid!==adminUid){await firebaseAuth.signOut(auth);throw new Error('هذا الحساب غير مصرح له بإدارة المتجر.');}message.textContent='تم تسجيل الدخول.';}
      catch(error){message.textContent=error.message==='هذا الحساب غير مصرح له بإدارة المتجر.'?error.message:'تعذر تسجيل الدخول. راجعي البريد وكلمة المرور وتفعيل Email/Password.';}
    });
    document.getElementById('adminLogout').addEventListener('click',()=>firebaseAuth.signOut(auth));
    document.getElementById('adminOpen').addEventListener('click',()=>{shade.classList.add('open');if(auth.currentUser?.uid===adminUid){fillDesign();fillProducts();fillOrders();}});
    document.getElementById('adminClose').addEventListener('click',()=>shade.classList.remove('open'));
    shade.addEventListener('click',e=>{if(e.target===shade)shade.classList.remove('open');});
    document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===t));document.getElementById('designTab').classList.toggle('hidden',t.dataset.tab!=='design');document.getElementById('itemsTab').classList.toggle('hidden',t.dataset.tab!=='items');document.getElementById('ordersTab').classList.toggle('hidden',t.dataset.tab!=='orders');if(t.dataset.tab==='orders')fillOrders();}));
    async function fillOrders(){const root=document.getElementById('ordersList');if(auth.currentUser?.uid!==adminUid){root.innerHTML='<div class="order-empty">سجلي الدخول لعرض الطلبات.</div>';return;}root.innerHTML='<div class="order-empty">جارٍ تحميل الطلبات…</div>';try{const snap=await ordersDb.getDocs(ordersDb.query(ordersDb.collection(db,'orders'),ordersDb.orderBy('createdAt','desc')));const orders=snap.docs.map(d=>({id:d.id,...d.data()}));root.innerHTML=orders.length?orders.map(o=>{const date=o.createdAt?.toDate?o.createdAt.toDate().toLocaleString('ar-EG'):'الآن';return `<article class="order-card"><div class="order-card-head"><div><h3>طلب #${safe(o.id)}</h3><span class="order-meta">${safe(date)}</span></div><span class="order-badge">${safe(o.status)}</span></div><p><b>العميل:</b> ${safe(o.name)}<br><b>الموبايل:</b> ${safe(o.phone)}<br><b>العنوان:</b> ${safe(o.address)}</p><ul>${o.items.map(it=>`<li>${safe(it.name)} × ${Number(it.qty)} — ${money(it.price*it.qty)}</li>`).join('')}</ul><p><b>ملاحظات:</b> ${safe(o.notes||'لا يوجد')}</p><div class="order-tools"><b>${money(o.total)}</b><select class="order-select" data-status="${safe(o.id)}"><option ${o.status==='جديد'?'selected':''}>جديد</option><option ${o.status==='قيد التجهيز'?'selected':''}>قيد التجهيز</option><option ${o.status==='تم التسليم'?'selected':''}>تم التسليم</option><option ${o.status==='ملغي'?'selected':''}>ملغي</option></select><button class="editor-top" data-delete-order="${safe(o.id)}">حذف</button></div></article>`;}).join(''):'<div class="order-empty">لسه مفيش طلبات. الطلبات الجديدة هتظهر هنا.</div>';root.querySelectorAll('[data-status]').forEach(el=>el.addEventListener('change',async()=>{try{await ordersDb.updateDoc(ordersDb.doc(db,'orders',el.dataset.status),{status:el.value});fillOrders();}catch{toast('تعذر تحديث حالة الطلب');}}));root.querySelectorAll('[data-delete-order]').forEach(el=>el.addEventListener('click',async()=>{try{await ordersDb.deleteDoc(ordersDb.doc(db,'orders',el.dataset.deleteOrder));fillOrders();}catch{toast('تعذر حذف الطلب');}}));}catch(error){root.innerHTML='<div class="order-empty">تعذر تحميل الطلبات. راجعي قواعد Firestore وتسجيل الدخول.</div>';}}
    function fillDesign(){document.getElementById('editName').value=data.name;document.getElementById('editAnnouncement').value=data.announcement;document.getElementById('editBg').value=data.bg;document.getElementById('editAccent').value=data.accent;document.getElementById('editTitle').value=data.title;document.getElementById('editCopy').value=data.copy;document.getElementById('editHero').value=data.hero.startsWith('data:')?'':data.hero;document.getElementById('editStory').value=data.story;}
    const readFile=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
    document.getElementById('heroUpload').addEventListener('change',async e=>{if(e.target.files[0]){data.hero=await readFile(e.target.files[0]);document.getElementById('editHero').value='';toast('تم اختيار صورة الواجهة');}});
    document.getElementById('saveDesign').addEventListener('click',()=>{data.name=document.getElementById('editName').value.trim()||'حكاية';data.announcement=document.getElementById('editAnnouncement').value;data.bg=document.getElementById('editBg').value;data.accent=document.getElementById('editAccent').value;data.title=document.getElementById('editTitle').value;data.copy=document.getElementById('editCopy').value;data.hero=document.getElementById('editHero').value.trim()||data.hero;data.story=document.getElementById('editStory').value;persist();location.reload();});
    function fillProducts(){document.getElementById('productEditor').innerHTML=data.products.map((p,i)=>`<div class="editor-product"><div class="editor-top"><span>منتج ${String(i+1).padStart(2,'0')}</span><button type="button" data-remove="${safe(p.id)}">حذف المنتج</button></div><label>اسم المنتج<input data-field="name" data-id="${safe(p.id)}" value="${safe(p.name)}"></label><label>وصف مختصر<input data-field="desc" data-id="${safe(p.id)}" value="${safe(p.desc)}"></label><div class="form-row"><label>السعر بالجنيه<input type="number" min="0" data-field="price" data-id="${safe(p.id)}" value="${Number(p.price)||0}"></label><label>التصنيف<input data-field="category" data-id="${safe(p.id)}" value="${safe(p.category)}"></label></div><label>شارة المنتج<input data-field="tag" data-id="${safe(p.id)}" value="${safe(p.tag||'')}" placeholder="جديد، خصم..."></label><label>رابط الصورة<input data-field="image" data-id="${safe(p.id)}" value="${p.image.startsWith('data:')?'':safe(p.image)}" placeholder="رابط صورة"></label><label>أو ارفعي صورة<input type="file" accept="image/*" data-upload="${safe(p.id)}"></label></div>`).join('');
      document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{data.products=data.products.filter(p=>p.id!==b.dataset.remove);fillProducts();}));
      document.querySelectorAll('[data-upload]').forEach(inp=>inp.addEventListener('change',async e=>{if(e.target.files[0]){const p=data.products.find(x=>x.id===inp.dataset.upload);p.image=await readFile(e.target.files[0]);toast('تم اختيار صورة المنتج');}}));
    }
    document.getElementById('addProduct').addEventListener('click',()=>{data.products.push({id:`p${Date.now()}`,name:'شنطة جديدة',desc:'أضيفي وصف المنتج',price:0,category:'يومية',tag:'',image:data.hero});fillProducts();});
    document.getElementById('saveProducts').addEventListener('click',()=>{document.querySelectorAll('[data-field]').forEach(el=>{const p=data.products.find(x=>x.id===el.dataset.id);if(p)p[el.dataset.field]=el.dataset.field==='price'?Math.max(0,Number(el.value)||0):el.value;});persist();location.reload();});
    document.getElementById('resetAll').addEventListener('click',()=>{if(confirm('سيتم حذف التعديلات والمنتجات المضافة من هذا المتصفح. هل تريدين المتابعة؟')){localStorage.removeItem(key);location.reload();}});
  }

  const orderItems=document.getElementById('orderItems');
  if(orderItems){
    const cart=getCart();const chosen=data.products.filter(p=>cart[p.id]);let total=0;
    if(!chosen.length)orderItems.innerHTML='<div class="empty-cart">حقيبتك لسه فاضية.<a href="index.html#collection">ارجعي للتسوق</a></div>';
    else orderItems.innerHTML=chosen.map(p=>{const qty=Number(cart[p.id]);total+=p.price*qty;return `<div class="summary-line"><img src="${safe(p.image)}" alt=""><div><b>${safe(p.name)}</b><small>الكمية: ${qty.toLocaleString('ar-EG')}</small></div><strong>${money(p.price*qty)}</strong></div>`;}).join('');
    document.getElementById('orderTotal').textContent=money(total);
    document.getElementById('orderForm').addEventListener('submit',async e=>{e.preventDefault();if(!chosen.length){toast('أضيفي منتجًا لحقيبتك أولًا');return;}const form=e.currentTarget,button=form.querySelector('[type="submit"]');button.disabled=true;button.textContent='جارٍ إرسال الطلب…';const f=new FormData(form);const order={name:String(f.get('name')||'').trim(),phone:String(f.get('phone')||'').trim(),address:String(f.get('address')||'').trim(),notes:String(f.get('notes')||'').trim(),items:chosen.map(p=>({name:p.name,price:Number(p.price),qty:Number(cart[p.id])})),total:Number(total),status:'جديد',createdAt:ordersDb.serverTimestamp()};try{const saved=await ordersDb.addDoc(ordersDb.collection(db,'orders'),order);setCart({});form.innerHTML=`<div class="success-box"><span class="order-badge">تم استلام الطلب</span><h3>شكرًا يا ${safe(order.name)}!</h3><p>اتسجل طلبك بنجاح برقم <b>#${safe(saved.id.slice(-7))}</b>.<br>هنراجع بيانات التوصيل ونتواصل معك على رقم الموبايل المسجل.</p><a class="button dark" href="index.html">العودة للمتجر</a></div>`;}catch(error){button.disabled=false;button.innerHTML='تأكيد الطلب <span>←</span>';toast('تعذر إرسال الطلب. راجعي إعداد قاعدة البيانات وقواعد الأمان.');console.error('Order submission failed',error);}});
  }
})();

   const $ = s => document.querySelector(s);
    const ta = $("#skriv"), navn = $("#navn"), klasse = $("#klasse");
    const saveStatus = $("#saveStatus"), saveText = $("#saveText"), warn=$("#warn");
    const countsEl = $("#counts");
    const printView = document.getElementById("printView");

    /* Tipbar memory */
    try {
      const TIP_KEY='ak_demo_tip_hidden_v1';
      if(localStorage.getItem(TIP_KEY)==='1') $("#tipbar").style.display='none';
      $("#hideTips").onclick=()=>{localStorage.setItem(TIP_KEY,'1');$("#tipbar").style.display='none'};
    } catch {}

    /* Word / char count */
    function updateCounts(){
      const t = ta.value||"";
      const words = (t.trim().match(/[^\s]+/g)||[]).length;
      const chars = Array.from(t).length;
      countsEl.textContent = `Ord: ${words} · Tegn: ${chars}`;
    }
    ta.addEventListener('input', updateCounts);

    /* PrintView sync */
    function updatePrintView(){ printView.textContent = ta.value || ""; }
    ta.addEventListener('input', updatePrintView);

    /* Print */
    $("#print").onclick = async () => {
      updatePrintView();
      const old=document.title;
      document.title=((navn.value||'Besvarelse')+(klasse.value?` – ${klasse.value}`:''))+' (PDF)';
      document.activeElement?.blur();
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      if(document.fonts) try{await document.fonts.ready;}catch{}
      window.print();
      setTimeout(()=>document.title=old,400);
    };

    function beforePrint(){ updatePrintView(); }
    function afterPrint(){}
    if ('onbeforeprint' in window) {
      window.addEventListener('beforeprint', beforePrint);
      window.addEventListener('afterprint', afterPrint);
    } else if (window.matchMedia) {
      const mql = window.matchMedia('print');
      mql.addListener((mq) => mq.matches ? beforePrint() : afterPrint());
    }

    /* ✅ OBS: Ingen copy/cut/paste blokering her */

    /* Autosave */
    const KEY='ak_demo_autosave_v1';
    function storageOK(){try{localStorage.setItem('_t','1');localStorage.removeItem('_t');return true;}catch{return false;}}
    const can = storageOK();

    function setStatus(cls,msg){saveStatus.className='status '+cls; saveText.textContent=msg;}

    if(!can){
      warn.style.display='block';
      setStatus('off','Autosave ikke tilgængelig');
    }else{
      setStatus('saving','Initialiserer…');
    }

    function save(){
      if(!can) return;
      try{
        localStorage.setItem(KEY, JSON.stringify({
          navn:navn.value||'', klasse:klasse.value||'', tekst:ta.value||''
        }));
        const t=new Date(),z=n=>String(n).padStart(2,'0');
        setStatus('saved',`Gemt kl. ${z(t.getHours())}:${z(t.getMinutes())}`);
      }catch(e){
        setStatus('error','Autosave fejlede');
      }
    }

    function load(){
      if(!can) return;
      try{
        const d=JSON.parse(localStorage.getItem(KEY)||'null');
        if(d){navn.value=d.navn||''; klasse.value=d.klasse||''; ta.value=d.tekst||'';}
        setStatus('saved','Gemt indlæst');
        updateCounts();
      }catch{}
    }

    let tm=null;
    function queue(){setStatus('saving','Gemmer…');clearTimeout(tm);tm=setTimeout(save,400);}
    [navn,klasse,ta].forEach(el=>el.addEventListener('input',queue));

    $("#forceSave").onclick=save;

    $("#reset").onclick=()=>{
      if(confirm('Nulstil alt?')){
        navn.value=''; klasse.value=''; ta.value='';
        if(can) localStorage.removeItem(KEY);
        updateCounts();
        updatePrintView();
        setStatus('saving','Nulstillet…');
      }
    };

    window.addEventListener('beforeunload',save);
    load();
    updateCounts();
    updatePrintView();
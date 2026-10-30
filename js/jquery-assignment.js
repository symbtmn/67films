/* Task 0: jQuery setup and ready callback. */
$(document).ready(function () {
  console.log('jQuery is ready!');
  const movies = window.NightMovies || [];
  let toastTimer;
  function toast(text) {
    // Task 7: stop queued animations before showing a temporary notification.
    clearTimeout(toastTimer);
    $('#jqToast').stop(true,true).prop('hidden',false).text(text).hide().fadeIn(180);
    toastTimer=setTimeout(()=>$('#jqToast').fadeOut(250,()=>$('#jqToast').prop('hidden',true)),2200);
  }
  // Task 3: use text nodes and mark elements so search input cannot inject HTML.
  function highlight(text, query) {
    const box=$('<span>'); if(!query)return box.text(text);
    const lower=text.toLocaleLowerCase();const needle=query.toLocaleLowerCase();let start=0,index;
    while((index=lower.indexOf(needle,start))!==-1) {
      box.append(document.createTextNode(text.slice(start,index)),$('<mark>').text(text.slice(index,index+query.length)));start=index+query.length;
    }
    return box.append(document.createTextNode(text.slice(start)));
  }
  // Task 1: live filtering through jQuery filter(), on every input change.
  function search() {
    const query=$('#jqSearch').val().trim();
    const matches=$(movies).filter((_,movie)=>movie.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    $('#jqResults').empty();
    matches.each((_,movie)=>{
      const article=$('<article class="card p-3 h-100">');article.append($('<h2 class="h5">').append(highlight(movie.title,query)),$('<p>').append(highlight(movie.teaser,query)),$('<a class="btn btn-outline-danger align-self-start">').attr('href',movie.page).text('Киноны ашу'));
      $('#jqResults').append($('<div class="col">').append(article));
    });
    $('#jqCount').text(`Табылған туынды: ${matches.length}`);
    // Task 2: suggestions are selectable with mouse, Enter and arrow keys.
    $('#jqSuggestions').empty().prop('hidden',!query||!matches.length);
    if(query)matches.slice(0,5).each((_,movie)=>$('#jqSuggestions').append($('<li role="option">').append($('<button type="button" class="list-group-item list-group-item-action w-100">').text(movie.title).on('click',()=>{$('#jqSearch').val(movie.title);search();closeSuggestions();$('#jqSearch').trigger('focus');}))));
    $('#jqSearch').attr('aria-expanded',String(Boolean(query&&matches.length)));
  }
  function closeSuggestions(){$('#jqSuggestions').prop('hidden',true);$('#jqSearch').attr('aria-expanded','false');}
  $('#jqSearch').on('input',search).on('keydown',event=>{if(event.key==='ArrowDown') {event.preventDefault();$('#jqSuggestions button').first().trigger('focus');}if(event.key==='Escape')closeSuggestions();});
  $('#jqSuggestions').on('keydown','button',function(event){const buttons=$('#jqSuggestions button');let i=buttons.index(this);if(event.key==='Escape'){closeSuggestions();$('#jqSearch').trigger('focus');}if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();buttons.eq((i+(event.key==='ArrowDown'?1:buttons.length-1))%buttons.length).trigger('focus');}});
  $(document).on('click',event=>{if(!$(event.target).closest('#jqSearch,#jqSuggestions').length)closeSuggestions();});
  if($('#jqSearch').length)search();
  // Task 4: recompute progress after scrolling, resizing or content changes.
  function progress(){const max=document.documentElement.scrollHeight-innerHeight;const value=max>0?Math.min(100,Math.max(0,scrollY/max*100)):0;$('#jqProgress').css('width',value+'%').attr('aria-valuenow',Math.round(value));}
  $(window).on('scroll resize',progress);progress();
  // Task 5: animate numeric properties; reduced motion renders final numbers.
  $('.jq-counter').each(function(){const el=$(this),target=Number(el.attr('data-target'));if(matchMedia('(prefers-reduced-motion: reduce)').matches)el.text(target);else $({number:0}).animate({number:target},{duration:1100,step(value){el.text(Math.floor(value));},complete(){el.text(target);}});});
  // Trim whitespace before validation; required alone accepts spaces.
  $('#jqForm').attr('novalidate', 'novalidate');
  $('#jqName, #jqMessage').on('input', function () {
    this.setCustomValidity('');
    $(this).removeAttr('aria-invalid');
    $('#jqFormStatus').text('');
  });
  // Task 6: validate, show busy state, disable duplicates, restore after delay.
  $('#jqForm').on('submit',function(event){event.preventDefault();const name=$('#jqName')[0],message=$('#jqMessage')[0];name.value=name.value.trim();message.value=message.value.trim();name.setCustomValidity(name.value.length<2?'Атыңызды кемінде екі таңбамен жазыңыз.':'');message.setCustomValidity(!message.value?'Кино атауын немесе ұсынысыңызды жазыңыз.':'');const invalid=[name,message].find(field=>!field.checkValidity());if(invalid){$(invalid).attr('aria-invalid','true');$('#jqFormStatus').text(invalid.validationMessage);invalid.focus();return;}if(!this.reportValidity()||$('#jqSubmit').prop('disabled'))return;const button=$('#jqSubmit');button.prop('disabled',true).attr('aria-busy','true').empty().append($('<span class="jq-spinner" aria-hidden="true">'),document.createTextNode(' Please wait…'));$('#jqFormStatus').text('Өтінім тексерілуде…');setTimeout(()=>{button.prop('disabled',false).removeAttr('aria-busy').text('Жіберу');$('#jqFormStatus').text('Демо өтінім тексерілді. Серверге жіберілген жоқ.');toast('Өтінім сәтті тексерілді!');},1200);});
  // Task 8: modern clipboard API, explicit failure feedback and temporary tooltip.
  let copyTimer;
  $('#jqCopy').on('click',async function(){try{await navigator.clipboard.writeText($('#jqShare').text());const button=$(this);clearTimeout(copyTimer);button.text('✓ Көшірілді');$('#jqCopyTip').prop('hidden',false);toast('Мәтін көшірілді!');copyTimer=setTimeout(()=>{button.text('Көшіру');$('#jqCopyTip').prop('hidden',true);},2000);}catch{toast('Көшіру мүмкін болмады. Мәтінді қолмен көшіріңіз.');}});
  $('#jqNotify').on('click',()=>toast('Көру тізіміне қосылды!'));
  // Task 9: do not assign src until an image approaches the viewport.
  const placeholder='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="340"%3E%3C/svg%3E';
  if($('#jqLazyGrid').length)for(let i=0;i<24;i++){const movie=movies[i%movies.length];$('#jqLazyGrid').append($('<figure class="col">').append($('<img class="jq-lazy">').attr({src:placeholder,'data-src':movie.poster,alt:movie.title,width:240,height:340}),$('<figcaption class="small mt-2">').text(movie.title)));}
  function lazyLoad(){$('.jq-lazy[data-src]').filter(function(){return $(this).offset().top<scrollY+innerHeight+120;}).each(function(){const img=$(this);img.on('load',()=>img.addClass('is-loaded')).on('error',()=>img.attr('alt','Сурет ашылмады'));img.attr('src',img.attr('data-src')).removeAttr('data-src');});}
  $(window).on('scroll resize',lazyLoad);lazyLoad();
  if($('#jqReading').length)movies.forEach(movie=>$('#jqReading').append($('<article class="card p-4 mb-4">').append($('<h2 class="h5">').text(movie.title),$('<p>').text(movie.description))));
  progress();
});

/* globals $, dataLayer */
'use strict';

// 設定（ダミー送信モード）
window.DUMMY_MODE = true;              // バックエンド無しのデモ送信
window.SIMULATE_DELAY_MS = 800;        // 疑似遅延
window.SIMULATE_FAILURE_RATE = 0;      // 0〜1で失敗率
window.TEMP_ALERT = true;              // 成功/失敗の仮アラート

// コピーライト年（開始年を指定）
document.addEventListener('DOMContentLoaded', function () {
  var startYear = 2025;
  var el = document.getElementById('copy-range');
  if (el) {
    var y = new Date().getFullYear();
    el.textContent = (startYear === y) ? y : (startYear + '–' + y);
  }
});

$(function () {
  var $win = $(window), $doc = $(document), $body = $('body');

  // ヘッダー透過→実体化
  function setHeaderSolid() {
    $('.header').toggleClass('is-solid', window.scrollY > 24);
  }
  setHeaderSolid();
  $win.on('scroll', setHeaderSolid);

  // ハンバーガー（SP）
  (function () {
    var $toggle = $('.header__toggle');
    $toggle.on('click', function () {
      var expanded = $(this).attr('aria-expanded') === 'true';
      $(this).attr('aria-expanded', !expanded);
      $body.toggleClass('header--menu-open', !expanded);
      window.dataLayer && dataLayer.push({ event: 'menu_toggle', state: !expanded ? 'open' : 'close' });
    });
    $doc.on('keydown', function (e) {
      if (e.key === 'Escape' && $body.hasClass('header--menu-open')) $toggle.click();
    });
    $('.header__nav a').on('click', function () {
      if ($body.hasClass('header--menu-open')) $('.header__toggle').click();
    });
  })();

  // スムーススクロール（固定ヘッダー補正）
  function headerH() { return window.innerWidth >= 1024 ? 72 : 56; }
  $doc.on('click', 'a[href^="#"]', function (e) {
    var id = $(this).attr('href');
    if (id === '#' || id === '#top') return;
    var $t = $(id);
    if (!$t.length) return;
    e.preventDefault();

    $('html, body').animate(
      { scrollTop: $t.offset().top - headerH() - 8 },
      350,
      'swing',
      function () { $t.attr('tabindex', '-1').focus().one('blur', function () { $(this).removeAttr('tabindex'); }); }
    );
  });
  if (location.hash) {
    setTimeout(function () {
      var $t = $(location.hash);
      if ($t.length) $('html, body').scrollTop($t.offset().top - headerH() - 8);
    }, 150);
  }

  // スティッキーCTA（SP表示）
  (function () {
    var $sticky = $('.sticky-cta'), $footer = $('footer');
    function onScroll() {
      var s = window.scrollY;
      var nearFooter = $footer.length ? (s + window.innerHeight > $footer.offset().top - 16) : false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && s > h * 0.3 && !nearFooter) {
        $sticky.addClass('is-visible').attr('aria-hidden', 'false');
      } else {
        $sticky.removeClass('is-visible').attr('aria-hidden', 'true');
      }
    }
    onScroll();
    $win.on('scroll resize', onScroll);
  })();

  // 出発日：今日以降に制限＋未対応端末フォールバック
  (function () {
    var i = document.createElement('input');
    i.setAttribute('type', 'date');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var min = today.toISOString().slice(0, 10);
    $('#checkin').attr('min', min);
    if (i.type !== 'date') {
      $('#checkin').attr({ type: 'text', placeholder: 'YYYY-MM-DD' });
    }
  })();

  // 予約フォーム：簡易検証＋ダミー送信
  $('#reserveForm').on('submit', function (e) {
    e.preventDefault();
    var $form = $(this), $alert = $('.form__alert'), $btn = $('#reserveSubmit');

    var ok = true;
    function err($i, msg) {
      $('#err-' + $i.attr('id')).text(msg).prop('hidden', false);
      $i.attr({ 'aria-invalid': 'true', 'aria-describedby': 'err-' + $i.attr('id') });
      ok = false;
    }
    function clr($i) {
      $('#err-' + $i.attr('id')).prop('hidden', true);
      $i.removeAttr('aria-invalid aria-describedby');
    }

    var $name = $('#name'), $mail = $('#email'), $date = $('#checkin'), $ad = $('#adults');
    [$name, $mail, $date, $ad].forEach(clr);

    if (!$name.val().trim()) err($name, 'お名前を入力してください');
    if (!$mail.val().trim() || !$mail[0].checkValidity()) err($mail, 'メールアドレスの形式が正しくありません');
    if (!$date.val()) {
      err($date, '出発日を選択してください');
    } else {
      var t = new Date(); t.setHours(0, 0, 0, 0);
      var d = new Date($date.val()); d.setHours(0, 0, 0, 0);
      if (d < t) err($date, '今日以降の日付を選択してください');
    }
    if (!$ad.val() || +$ad.val() < 1) err($ad, '1名以上で入力してください');

    if (!ok) {
      $alert.text('未入力や不正な項目があります。赤枠の欄をご確認ください。').prop('hidden', false);
      return;
    }
    $alert.prop('hidden', true).text('');

    // 送信（ダミー）
    $btn.addClass('is-loading').attr({ 'aria-busy': 'true', disabled: true });
    setTimeout(function () {
      var fail = Math.random() < (window.SIMULATE_FAILURE_RATE || 0);
      if (fail) {
        $alert.text('送信に失敗しました（デモ）。時間を置いて再度お試しください。').prop('hidden', false);
        window.TEMP_ALERT && alert('送信に失敗しました（デモ）。');
      } else {
        window.dataLayer && dataLayer.push({
          event: 'lead_submit',
          checkin: $('#checkin').val() || '',
          adults: $('#adults').val() || ''
        });
        $form.attr('hidden', true);
        $('#reserveThanks').prop('hidden', false);
        window.TEMP_ALERT && alert('送信が完了しました（デモ）。');
      }
      $btn.removeClass('is-loading').attr({ 'aria-busy': 'false', disabled: false });
      $(document).trigger('reserve:done');
    }, window.SIMULATE_DELAY_MS || 800);
  });

  // 地図/CTA 計測（任意）
  $('.open-map').on('click', function () {
    window.dataLayer && dataLayer.push({ event: 'map_open', service: $(this).data('map') });
  });
  $('.cta--reserve').on('click', function () {
    window.dataLayer && dataLayer.push({ event: 'cta_click', label: $(this).text(), placement: $(this).data('placement') || 'unknown' });
  });

  // SNSシェア
  (function(){
    function canonicalUrl(){
      var link = document.querySelector('link[rel="canonical"]');
      return (link && link.href) ? link.href : location.href.split('#')[0];
    }
    function shareText(){
      var h1 = document.getElementById('page-title');
      var desc = document.querySelector('meta[name="description"]');
      return (h1 ? h1.textContent.trim() : document.title) + '｜' + (desc ? desc.content.trim() : '');
    }
    function withUtm(url){
      var utm = new URLSearchParams({utm_source:'share',utm_medium:'social',utm_campaign:'onsen_lp'});
      var u = new URL(url);
      ['utm_source','utm_medium','utm_campaign'].forEach(function(k){ if(!u.searchParams.get(k)) u.searchParams.set(k, utm.get(k)); });
      return u.toString();
    }
    function openPopup(u){
      var w = 640, h = 480;
      var y = window.top.outerHeight/2 + window.top.screenY - ( h/2);
      var x = window.top.outerWidth/2  + window.top.screenX - ( w/2);
      window.open(u, '_blank', 'noopener,noreferrer,width='+w+',height='+h+',left='+x+',top='+y);
    }
    if (navigator.share) { $('.share--native').prop('hidden', false); }
    $(document).on('click', '.share__btn', function(e){
      var pf = $(this).data('platform');
      var url = withUtm(canonicalUrl());
      var text = shareText();
      var encU = encodeURIComponent(url);
      var encT = encodeURIComponent(text);
      window.dataLayer && dataLayer.push({event:'share_click', platform: pf});
      if (pf === 'x') { e.preventDefault(); openPopup('https://twitter.com/intent/tweet?url='+encU+'&text='+encT); }
      else if (pf === 'facebook') { e.preventDefault(); openPopup('https://www.facebook.com/sharer/sharer.php?u='+encU); }
      else if (pf === 'line') { e.preventDefault(); openPopup('https://social-plugins.line.me/lineit/share?url='+encU); }
      else if (pf === 'copy') {
        e.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function(){ alert('URLをコピーしました'); }, function(){ alert('コピーに失敗しました。'); });
        } else {
          var ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); alert('URLをコピーしました'); } catch(_) { alert('コピーに失敗しました'); }
          document.body.removeChild(ta);
        }
      } else if (pf === 'native') {
        e.preventDefault(); navigator.share && navigator.share({title: document.title, text: text, url: url}).catch(function(){});
      }
    });
  })();
});


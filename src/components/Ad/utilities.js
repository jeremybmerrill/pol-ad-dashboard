// Recurse all parent elements and try to find 'a' tag.
const hasATagParent = (el /* DOM Element */) => {
  while (el.parentNode) {
    el = el.parentNode;
    if (el.tagName && el.tagName.toLowerCase() === 'a') return el;
  }
  return null;
}

// Find the ad image used. The tricky part here is there could be two different
// kinds of ways to parse (I think based on pre and post2020).
const getAdImg = (doc /* DOMParser */) => {
  // Pre 2020. Much easier to parse.
  var imgs = doc.querySelectorAll('div.fbStoryAttachmentImage img');
  if (imgs.length > 0) {
    return imgs[0];
  }

  // Post 2020
  imgs = doc.querySelectorAll('img');
  for (var i = 0; i < imgs.length; ++i) {
    var img = imgs[i];

    // These are the conditions where we know an image is not an ad image.
    // 1) `src` contains `data:image/svg+xml` -- an example is a heart icon
    // 2) Contains `/emoji.php/` -- these are emojis within the ad copy.
    // 3) Contains `/images/video/play` -- Video play icon.
    // 4) Width, height is less than 75px -- could be profile pic.
    // 5) Has `aria-label` -- this is usually advertiser name like `ManyChat`
    // 6) `src` contains '/rsrc.php/' -- Seems to be FB pixel.
    var src = img.getAttribute('src');
    var h = parseInt(img.getAttribute('height'), 10) || 76;
    var w = parseInt(img.getAttribute('width'), 10) || 76;
    var arialabel = img.getAttribute('aria-label');
    if (
      src.indexOf('data:image/svg+xml') >= 0 ||
      src.indexOf('/emoji.php/') >= 0 ||
      src.indexOf('/images/video/play') >= 0 ||
      w < 75 ||
      h < 75 ||
      arialabel != null ||
      src.indexOf('/rsrc.php/') >= 0 || 
      src == "null" || 
      src === null
    ) {
      continue;
    }
    return img;
  }
}

const newDoc = (html /* string */) => {
  // From https://stackoverflow.com/a/30040354/3325787
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, 'text/html');
  return doc;
}

const getAdCopyPre2020 = (doc /* DOMParser */, cx) => {
  var html = '';
  var els = doc.querySelectorAll('div.userContent');
  if (els.length > 0) {
    for (var i = 0; i < els.length; ++i) {
      html += els[i].innerHTML;
    }
  }
  return '<div class="'+cx('ati-item-ad-copy')+'">' + html + '</div>'; 
}

const getAdSponsorLine = (doc, cx) => {
  var html_texts = [];

  var els = doc.querySelectorAll('div[dir="auto"], span[dir="auto"]');
  for (var i = 0; i < els.length; ++i) {
    var el = els[i];

    if (el.childElementCount == 1 && el.innerText.indexOf('·') > -1) {
      html_texts.push(el.innerText); // non-political
    }

  }
  var els = doc.querySelectorAll('div[data-testid="story-subtitle"]');
  for (var i = 0; i < els.length; ++i) {
    var el = els[i];

    if((el.innerText.indexOf('Paid for by') > -1) && (el.innerText.indexOf('Sponsored') > -1)){
      html_texts.push(el.innerText); // political
    }

  }
  return '<div class="'+cx('ati-item-ad-sponsored')+'">' +  html_texts.join('<br />') + "</div>";
}

const getAdCopyPost2020 = (doc /* DOMParser */, cx) => {
  var html_texts = [];
  doc.querySelectorAll('div[role="button"], span[role="button"]').forEach((elem) => elem.parentNode.removeChild(elem))

  var els = doc.querySelectorAll('div[dir="auto"], span[dir="auto"]');
  for (var i = 0; i < els.length; ++i) {
    var el = els[i];
    if (el.childElementCount > 1) {
      continue;
    }

    // The ad copy that appears after the image has A tag as parent. Ignore
    // these. That stuff gets looked at in getAdCTAPost2020.
    if (hasATagParent(el)) {
      continue;
    }

    // This 'el' could still be valid it has a child element for the reason of
    // an emoji.
    if (el.childElementCount === 1 && el.innerHTML.indexOf('/emoji.php') >= 0) {
      html_texts.push(el.innerHTML);
    } else if (el.childElementCount === 0) {
      html_texts.push(el.innerText);
    }
  }
  return '<div class="'+cx('ati-item-ad-copy')+'">' +  html_texts.join('<br />') + "</div>";
}

const getAdCTAPost2020 = (doc /* DOMParser */, cx) => {
  var html = '<br>';
  var els = doc.querySelectorAll('div[dir="auto"], span[dir="auto"]');
  for (var i = 0; i < els.length; ++i) {
    var el = els[i];
    if (el.childElementCount > 1) {
      continue;
    }

    // The ad copy that appears after the image must have an A tag.
    if (!hasATagParent(el)) {
      continue;
    }

    // This 'el' could still be valid it has a child element for the reason of
    // an emoji.
    if (el.childElementCount === 1 && el.innerHTML.indexOf('/emoji.php') >= 0) {
      html += el.innerHTML;
    } else if (el.childElementCount === 0) {
      html += el.innerHTML + '<br />';
    }
  }
  return '<div class="'+cx('ati-item-cta')+'">' + html + '</div>';
}

const getAdCopy = (doc /* DOMParser */, cx) => {
  var html = getAdCopyPre2020(doc, cx);
  if (html.length > 0) {
    return html;
  }
  return getAdCopyPost2020(doc, cx);
}

const getAdvertiser = (doc /* DOMParser */, cx) => {
  // pre2020
  var els = doc.querySelectorAll('a[data-hovercard]');
  if (els.length > 1) {
    return '<div class="'+cx('ati-item-advertiser')+'">' + els[1].outerHTML + '</div>';
  }else{
    return '<div class="'+cx('ati-item-advertiser')+'">' + els[0].outerHTML + '</div>';
  }

  // post2020
  els = doc.querySelectorAll('h4[dir="auto"]');
  if (els.length === 0) {
    return '';
  }
  return '<div class="'+cx('ati-item-advertiser')+'">' + els[0].innerHTML + '</div>';
}

const getCTALink = (doc /* DOMParser */, cx) => {
  // Attempt 1.
  doc.querySelectorAll('div.fbStoryAttachmentImage').forEach((elem) => elem.parentNode.removeChild(elem))
  var els = doc.querySelectorAll('a[aria-label]');
  for (var i = 0; i < els.length; ++i) {
    if (els[i].href.indexOf('/l.php') >= 0 && els[i].innerText.length > 0) {
      return '<div class="'+cx('ati-item-cta')+'">' + els[i].outerHTML + '</div>';
    }
  }

  // Attempt 2.
  els = doc.querySelectorAll('a[rel="noopener nofollow"]');
  for (i = 0; i < els.length; ++i) {
    if (
      els[i].href.indexOf('/l.php') >= 0 &&
      els[i].innerText.length > 0 &&
      els[i].childElementCount === 0
    ) {
      return '<div class="'+cx('ati-item-cta')+'">' + els[i].outerHTML + '</div>';
    }
  }
  return ''
}

const getAdAdvertiserThumbnail = (doc /* DOMParser */, cx) => {
  // pre2020
  // var els = doc.querySelectorAll('img[role="img"]');
  // if (els.length > 1) {
  //   return '<div class="'+cx('ati-item-advertiser')+'">' + els[1].outerHTML + '</div>';
  // }

  // post2020
  var els = doc.querySelectorAll('img[role="img"]');
  if (els.length === 0) {
    return '';
  }
  return '<img class="'+cx('ati-item-advertiser-thumb')+'" src="' + els[0].getAttribute('src') + '"/>';
}


const makeAdImg = (img /* DOMElem */, cx) => {
  console.log(img);
  return '<img class="'+cx('ati-item-image')+'" src="' + img.getAttribute('src') + '" width=500>';
}

export const makeAdHtml = (html /* string */, cx) => {
  if (cx === null){
    cx = ((name) => name)
  }
  var doc = newDoc(html);
  var img = getAdImg(doc);
  if (!img) {
    return html;
  }
  return (
    getAdAdvertiserThumbnail(doc, cx) + getAdvertiser(doc, cx) + getAdSponsorLine(doc, cx) + getAdCopy(doc, cx) + makeAdImg(img, cx) + getAdCTAPost2020(doc, cx) + getCTALink(doc, cx)
  );
}

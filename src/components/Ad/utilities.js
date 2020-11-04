import get from 'lodash/get';

/* N.B. 

This file is used to three separate projects:
 - the pol-ads-dashboard repo, which is the (in-progress as of 10/30/2020) internal dashboard for looking through Ad Observer ads visually.
 - the poladstransparency-17744 repo, which drives the AdObservatory.org site (for the Missed Ads page).
 - Ad Observer's Ad Archive page

I'm trying to keep the files in exact sync. That's why we've got the cx() stuff here -- it's unnecessary in 
this repo, but necessary to work with the other one. Open to ideas on how to do this better :)

*/

// Recurse all parent elements and try to find 'a' tag.
const hasATagParent = (el /* DOM Element */) => {
  while (el.parentNode) {
    el = el.parentNode;
    if (el.tagName && el.tagName.toLowerCase() === 'a') return el;
  }
  return null;
};

const getAdImg = (doc, our_hosted_images) => {
  const ad_images = [...doc.querySelectorAll('img')];
  ad_images
    .filter(
      (img) =>
        !img.getAttribute('width') ||
        parseInt(img.getAttribute('width'), 10) >= 30,
    )
    .forEach((img, i) => {
      img.src = our_hosted_images[i];
    });
  return our_hosted_images.length
    ? ad_images.find((img) => {
        let result = true;
        // These are the conditions where we know an image is not an ad image.
        // 1) `src` contains `data:image/svg+xml` -- an example is a heart icon
        // 2) Contains `/emoji.php/` -- these are emojis within the ad copy.
        // 3) Contains `/images/video/play` -- Video play icon.
        // 4) Width, height is less than 75px -- could be profile pic.
        // 5) Has `aria-label` -- this is usually advertiser name like `ManyChat`
        // 6) `src` contains '/rsrc.php/' -- Seems to be FB pixel.
        const src = img.getAttribute('src');
        const h = parseInt(img.getAttribute('height'), 10) || 76;
        const w = parseInt(img.getAttribute('width'), 10) || 76;
        const arialabel = img.getAttribute('aria-label');
        if (
          src.indexOf('data:image/svg+xml') >= 0 ||
          src.indexOf('/emoji.php/') >= 0 ||
          src.indexOf('/images/video/play') >= 0 ||
          w < 75 ||
          h < 75 ||
          arialabel != null ||
          src.indexOf('/rsrc.php/') >= 0 ||
          src === 'null' ||
          src === null
        ) {
          result = false;
        }
        return result;
      })
    : null;
};

const newDoc = (html /* string */) => {
  // From https://stackoverflow.com/a/30040354/3325787
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc;
};

const getAdvertiser = (doc, cx) => {
  const els = doc.querySelectorAll('h4[dir="auto"]');
  const html = get(els, ['0', 'innerHTML']);
  return html
    ? `<div class="${cx('ati-item-advertiser')}">${els[0].innerHTML}</div>`
    : '';
};

const getAdSponsorLine = (doc, cx) => {
  const htmlTexts = [
    ...doc.querySelectorAll('div[dir="auto"], span[dir="auto"]'),
    ...doc.querySelectorAll('div[data-testid="story-subtitle"]'),
  ].reduce((arr, el) => {
    const newArr = [...arr];
    if (el.childElementCount === 1 && el.innerText.indexOf('·') === 2) {
      newArr.push(el.innerHTML);
    } else if (
      el.innerText.indexOf('Paid for by') > -1 &&
      el.innerText.indexOf('Sponsored') > -1
    ) {
      newArr.push(el.innerText);
    }
    return newArr;
  }, []);

  return `<div class="${cx('ati-item-ad-sponsored')}">${htmlTexts.join(
    '<br />',
  )}</div>`;
};

const getAdCopy = (doc, cx) => {
  const htmlTexts = [...doc.querySelectorAll('[data-ad-preview]')].reduce(
    (arr, el) => [...arr, el.innerHTML],
    [],
  );

  return `<div class="${cx('ati-item-ad-copy')}">${htmlTexts.join(
    '<br />',
  )}</div>`;
};

const getAdCTA = (doc, cx) => {
  const html = [
    ...doc.querySelectorAll('div[dir="auto"], span[dir="auto"]'),
  ].reduce((str, el) => {
    // The ad copy that appears after the image must have an A tag.
    if (el.childElementCount > 1 || !hasATagParent(el)) {
      return str;
    }
    // This 'el' could still be valid it has a child element for the reason of
    // an emoji.
    if (el.childElementCount === 1 && el.innerHTML.indexOf('/emoji.php') >= 0) {
      return str + el.innerHTML;
    }
    if (el.childElementCount === 0) {
      return `${str + el.innerHTML}<br />`;
    }
    return str;
  }, '<br>');
  return `<div class="${cx('ati-item-cta')}">${html}</div>`;
};

const getCTALink = (doc, cx) => {
  // Attempt 1.
  doc
    .querySelectorAll('div.fbStoryAttachmentImage')
    .forEach((elem) => elem.parentNode.removeChild(elem));
  let els = doc.querySelectorAll('a[aria-label]');
  for (var i = 0; i < els.length; ++i) {
    if (els[i].href.indexOf('/l.php') >= 0 && els[i].innerText.length > 0) {
      return `<div class="${cx('ati-item-cta')}">${els[i].outerHTML}</div>`;
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
      return `<div class="${cx('ati-item-cta', cx)}">${els[i].outerHTML}</div>`;
    }
  }
  return '';
};

const getAdAdvertiserThumbnail = (doc, thumbnail, cx) => {
  return thumbnail
    ? `<img class="${cx('ati-item-advertiser-thumb')}" src="${thumbnail}" />`
    : '';
};

const makeAdImg = (img, cx) => {
  return img
    ? `<img class="${cx('ati-item-image')}" src="${img.getAttribute(
        'src',
      )}" width=500 />`
    : '';
};

const makeAdHtml = (
  html /* string */,
  our_hosted_images /* array of strings */,
  thumbnail /* string */,
  cx,
) => {
  if (!cx) {
    cx = (name) => name;
  }
  const doc = newDoc(html);
  const img = getAdImg(doc, our_hosted_images);
  return (
    getAdAdvertiserThumbnail(doc, thumbnail, cx) +
    getAdvertiser(doc, cx) +
    getAdSponsorLine(doc, cx) +
    getAdCopy(doc, cx) +
    makeAdImg(img, cx) +
    getAdCTA(doc, cx) +
    getCTALink(doc, cx)
  );
};

export default makeAdHtml;

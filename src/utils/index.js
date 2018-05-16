//页面跳转
export function toLink(page, params, isNewTab) {
  let url = page;
  if (params) {
    url = url + '?' + qs.stringify(params);
  }
  if (isNewTab) {
    window.open(url); //新页面打开
  } else {
    window.location.href = url; //原页面打开
  }
}
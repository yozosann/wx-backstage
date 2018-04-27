export function getItem(c_name) {
  let value = "";
  let cookie = document.cookie;

  if (cookie.length > 0) {
    let c_start = cookie.indexOf(c_name + "=");

    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      let c_end = cookie.indexOf(";", c_start);
      if (c_end === -1) {
        c_end = cookie.length;
      }

      value = decodeURI(document.cookie.substring(c_start, c_end));
      if (value.substr(0, 1) === "\"" && value.substr(value.length - 1, 1) === "\"") {
        value = value.substr(1, value.length - 2);
      }
    }
  }
  return value;
}

export function setItem(c_name, value, expiredays) {
  let exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name + "=" + escape(value) +
    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}
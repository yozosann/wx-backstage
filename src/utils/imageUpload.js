// 图片上传函数
import {post, get} from '../global/request';
import * as qiniu from "qiniu-js";

export default async (file) => {
  const domain = 'http://p7vv6q8do.bkt.clouddn.com/';
  let data = await post({url: "/api/getUploadToken"}), token;
  if(data.token) {
    token = data.token;
    console.log(token)
  } else {
    throw new Error({
      code: '11',
      msg: '上传失败'
    });
  }
  
  let putExtra = {
    fname: file.name,
    params: {},
    mimeType: ["image/png", "image/jpeg", "image/gif"]
  }

  let observable = qiniu.upload(file, file.name, token, putExtra);
  return new Promise((resolve, reject) => {
    observable.subscribe(()=>{}, (err)=>{
      console.log(err)
    }, (obj)=> {
      resolve({
        url: domain + obj.key
      });
    });
  });
}
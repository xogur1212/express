
var template ={
    HTML:function (title,list,body, control){    //html 기본
      return `
      <!doctype html>
      <html>
      <head>
        <title>WEB3 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        
       ${list}
       ${control}
       ${body}
      </body>
      </html>
      `;
    },list:function(filelist){  //메뉴list작성
      var list=`<ul>`;
      var i=0;
      filelist.forEach(f1 => {
            
        list+=`<li><a href="/page/${f1}">${f1}</a></li>`
      });
    
    
      list+=`</ul>`
      return list;
    }//function templateList end
    
  
  }

  module.exports=template;  //모듈로 다른파일에서쓰려면     module.exports =변수